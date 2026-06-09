/* Contact card — call / text / save-to-phone per capability (app-ui.jsx). */
import { C, FONT } from './tokens';
import { AppIcon } from './icons';
import { telHref, smsHref, type Contact } from '../lib/data';
import { downloadVCard } from '../lib/platform';

export function ContactCard({
  contact, org, body, toast,
}: {
  contact: Contact; org?: string; body?: string; toast?: (m: string) => void;
}) {
  const has = !!(contact.phone && contact.phone.trim());
  const named = !!(contact.name && contact.name.trim());
  const displayName = named ? contact.name : (contact.role || 'Contact');
  const sub = named
    ? `${contact.role}${has ? ` · ${contact.phone}` : ' · no number set'}`
    : (has ? contact.phone : 'No name or number set');
  const actBtn = (href: string, label: 'Call' | 'Text', icon: string, primary: boolean) => (
    <a
      href={has ? href : undefined}
      onClick={(e) => {
        if (!has) { e.preventDefault(); toast?.('Set this number in Settings'); }
        else { toast?.(`${label === 'Call' ? 'Dialing' : 'Texting'} ${contact.phone}`); }
      }}
      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 12px', borderRadius: 9, textDecoration: 'none', border: primary ? '0' : `1.5px solid ${C.warm}`, background: primary ? C.teal : C.white, color: primary ? C.off : C.purple, fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: has ? 1 : 0.5 }}
    >
      <AppIcon name={icon} size={15} color={primary ? C.off : C.purple} stroke={2.2} /> {label}
    </a>
  );
  return (
    <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', padding: '13px 15px', border: '1px solid rgba(44,26,62,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 999, background: contact.canText && contact.canCall ? C.teal : C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AppIcon name={contact.canText && !contact.canCall ? 'send' : 'phone'} size={19} color={C.off} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15.5, color: C.ink }}>{displayName}</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{sub}</div>
        </div>
        <button
          onClick={() => { if (!has) { toast?.('Set this number in Settings'); return; } downloadVCard(contact, org); toast?.('Saved to contacts'); }}
          title="Save to phone contacts" aria-label="Save to phone contacts"
          style={{ background: C.whisperP, border: 0, borderRadius: 9, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: has ? 1 : 0.5 }}
        >
          <AppIcon name="userPlus" size={18} color={C.purple} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
        {contact.canCall && actBtn(telHref(contact.phone), 'Call', 'phone', false)}
        {contact.canText && actBtn(smsHref(contact.phone, body), 'Text', 'send', !contact.canCall)}
      </div>
    </div>
  );
}
