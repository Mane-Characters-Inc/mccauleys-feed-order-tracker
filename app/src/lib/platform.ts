/* =====================================================================
   Platform handoffs — web implementations of the native concerns in
   BUILD_SPEC §20. None auto-send/dial; they open the OS app pre-filled.
   ===================================================================== */
import { vcardFor, type Contact } from './data';

/** Trigger a file download from in-memory text (CSV/JSON/vCard fallback). */
export function downloadText(filename: string, text: string, type?: string): boolean {
  try {
    const blob = new Blob([text], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
    return true;
  } catch {
    return false;
  }
}

/** Save a contact to the phone: vCard download (Web Contacts API is spotty). */
export function downloadVCard(contact: Contact, org?: string): boolean {
  return downloadText(
    `${(contact.name || 'contact').replace(/[^\w]+/g, '-')}.vcf`,
    vcardFor(contact, org),
    'text/vcard',
  );
}

function canShareFiles(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
  );
}

/**
 * Share an export via the OS share sheet (Web Share API, BUILD_SPEC §9/§20),
 * falling back to a file download where sharing files isn't supported.
 * Returns 'shared' | 'downloaded' | 'failed'.
 */
export async function shareOrDownload(
  filename: string,
  text: string,
  type: string,
): Promise<'shared' | 'downloaded' | 'failed'> {
  if (canShareFiles()) {
    try {
      const file = new File([text], filename, { type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return 'shared';
      }
    } catch (err) {
      // User cancelled the share sheet — don't fall back to a download.
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
      // Otherwise fall through to download.
    }
  }
  return downloadText(filename, text, type) ? 'downloaded' : 'failed';
}

/** Copy text to the clipboard; resolves false if unavailable. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Open an external link in a new tab. */
export function openLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
