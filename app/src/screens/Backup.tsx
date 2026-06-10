/* Backup / Export — ported from app-screens-more.jsx, with Web Share + file import. */
import { useRef, useState, type ReactNode } from 'react';
import { C, FONT } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { SectionLabel, Segmented, Chip, AppButton, Sheet } from '../ui/primitives';
import { exportJSON, exportCSV, resetState, saveState, normalizeState, type AppState } from '../lib/data';
import { shareOrDownload, copyText } from '../lib/platform';

export function BackupScreen({
  state, setState, toast,
}: {
  state: AppState; setState: (s: AppState) => void; toast: (m: string) => void;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [preview, setPreview] = useState<'json' | 'csv'>('json');
  const fileRef = useRef<HTMLInputElement>(null);
  const json = exportJSON(state);
  const csv = exportCSV(state);

  const applyImport = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.weeks || !parsed.settings) throw new Error('bad');
      const restored = normalizeState(parsed);
      saveState(restored);
      setState(restored);
      setImportOpen(false);
      setImportText('');
      toast('Data restored');
    } catch {
      toast('Couldn’t read that JSON');
    }
  };
  const doReset = () => { const s = resetState(); setState(s); toast('Reset to a fresh start'); };
  const shareExport = async (filename: string, text: string, type: string, label: string) => {
    const r = await shareOrDownload(filename, text, type);
    toast(r === 'shared' ? `${label} shared` : r === 'downloaded' ? `${label} exported` : 'Export failed');
  };
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const txt = await file.text();
    applyImport(txt);
  };

  const card = (icon: string, title: string, sub: string, action: ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', padding: '14px 15px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: C.whisperP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AppIcon name={icon} size={20} color={C.purple} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15.5, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{sub}</div>
      </div>
      {action}
    </div>
  );

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '0 2px 14px' }}>
        <AppIcon name="info" size={16} color={C.teal} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, color: C.gray, lineHeight: 1.5, fontFamily: FONT }}>Everything is stored on this device and works fully offline. Export to keep a portable backup or move to a new phone.</div>
      </div>

      <SectionLabel>Export</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {card('download', 'Export as JSON', 'Complete data: every week, setting & message', <AppButton variant="soft" onClick={() => shareExport('feed-tracker-backup.json', json, 'application/json', 'JSON')}>Share</AppButton>)}
        {card('download', 'Export as CSV', 'One row per feed per week, opens in Excel', <AppButton variant="soft" onClick={() => shareExport('feed-tracker.csv', csv, 'text/csv', 'CSV')}>Share</AppButton>)}
        {card('upload', 'Import / Restore', 'Bring back a JSON backup', <AppButton variant="soft" onClick={() => setImportOpen(true)}>Restore</AppButton>)}
      </div>

      <SectionLabel style={{ margin: '20px 0 10px' }}>Preview</SectionLabel>
      <div style={{ display: 'inline-flex', marginBottom: 10 }}>
        <Segmented<'json' | 'csv'> value={preview} onChange={setPreview} options={[{ value: 'json', label: 'JSON' }, { value: 'csv', label: 'CSV' }]} />
      </div>
      <pre className="mc-scroll" style={{ background: C.purpleDeep, color: '#D9CFE6', borderRadius: 12, padding: '13px 14px', fontSize: 10.5, lineHeight: 1.5, overflow: 'auto', maxHeight: 200, margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre' }}>{preview === 'json' ? json.slice(0, 1400) + (json.length > 1400 ? '\n  …' : '') : csv}</pre>
      <div style={{ marginTop: 10 }}>
        <AppButton variant="ghost" full icon="copy" onClick={async () => { await copyText(preview === 'json' ? json : csv); toast('Copied to clipboard'); }}>Copy {preview.toUpperCase()}</AppButton>
      </div>

      <SectionLabel style={{ margin: '22px 0 10px' }}>Auto-backup</SectionLabel>
      {card('archive', 'On-device snapshot', 'A local copy is kept so a bad edit can be undone', <Chip tone="teal" icon="check">On</Chip>)}

      <div style={{ marginTop: 22 }}>
        <button onClick={doReset} style={{ width: '100%', padding: '12px', borderRadius: 10, border: `1.5px solid ${C.warm}`, background: 'transparent', color: C.alert, fontFamily: FONT, fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', cursor: 'pointer' }}>Erase all data &amp; start fresh</button>
      </div>

      <Sheet open={importOpen} title="Restore from backup" onClose={() => setImportOpen(false)}>
        <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>Choose a JSON backup file, or paste its contents. This replaces all current data.</p>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
        <div style={{ marginBottom: 12 }}><AppButton variant="soft" full icon="upload" onClick={() => fileRef.current?.click()}>Choose backup file</AppButton></div>
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder='{ "settings": …, "weeks": [ … ] }'
          style={{ width: '100%', boxSizing: 'border-box', minHeight: 130, resize: 'vertical', border: `1.5px solid ${C.warm}`, borderRadius: 11, padding: '12px 13px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: C.ink }} />
        <div style={{ marginTop: 12 }}><AppButton variant="primary" full icon="upload" onClick={() => applyImport(importText)} disabled={!importText.trim()}>Restore data</AppButton></div>
      </Sheet>
    </div>
  );
}
