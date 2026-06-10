/* History week detail / edit / hold-delete — ported from app-screens-more.jsx. */
import { useState, type CSSProperties } from 'react';
import { C, FONT } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { SectionLabel, AppButton, Chip, HoldButton } from '../ui/primitives';
import {
  weekFeedList, calcUsed, orderQty, composeMessage, shortLabel, ACCOUNT_LABEL,
  saveState, type AppState, type Week,
} from '../lib/data';

export function WeekDetail({
  state, setState, week, onClose, onDelete, toast,
}: {
  state: AppState; setState: (s: AppState) => void; week: Week; onClose: () => void; onDelete: (id: string) => void; toast: (m: string) => void;
}) {
  const { settings } = state;
  const feeds = weekFeedList(week, settings);
  const isActive = state.weeks[state.weeks.length - 1].id === week.id;
  const [editing, setEditing] = useState(false);
  const mutate = (fn: (s: AppState) => void) => { const s: AppState = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };
  const idx = state.weeks.findIndex((w) => w.id === week.id);
  const setF = (code: string, field: 'had' | 'ordered' | 'have' | 'orderSent', v: number | null) =>
    mutate((s) => { (s.weeks[idx].feeds[code][field] as number | null) = field === 'have' ? v : Math.max(0, v || 0); });
  const rebuildMsg = () => { mutate((s) => { s.weeks[idx].message = composeMessage(s.weeks[idx], s.settings); s.weeks[idx].messageEdited = false; }); toast('Message rebuilt'); };

  const rowLabel: CSSProperties = { padding: '8px 8px', textAlign: 'left', fontWeight: 600, color: C.gray, fontSize: 12, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: C.white };
  const td: CSSProperties = { padding: '8px 6px', textAlign: 'center', fontFamily: FONT, fontSize: 13.5 };
  const inputCell: CSSProperties = { width: 42, height: 28, textAlign: 'center', border: `1.5px solid ${C.warm}`, borderRadius: 6, fontFamily: FONT, fontSize: 13, fontWeight: 600 };

  return (
    <div>
      {editing && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: '#F7EFD6', borderRadius: 9, marginBottom: 12 }}>
          <AppIcon name="info" size={15} color="#8a6d12" />
          <span style={{ fontSize: 12, color: '#8a6d12', fontFamily: FONT, fontWeight: 600 }}>Fixing a past entry won’t recompute later weeks; they keep their saved numbers.</span>
        </div>
      )}
      <div style={{ background: C.white, borderRadius: 12, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden', marginBottom: 14 }}>
        <div className="mc-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 320 }}>
            <thead><tr style={{ background: C.purpleDeep }}>
              <th style={{ ...rowLabel, background: C.purpleDeep, color: C.tealLight, fontSize: 11, textTransform: 'uppercase' }}>Feed</th>
              {feeds.map((f) => <th key={f.code} style={{ ...td, color: C.off, fontWeight: 700, fontSize: 12 }}>{shortLabel(f.name)}</th>)}
            </tr></thead>
            <tbody>
              {([['Had', 'had'], ['Ordered', 'ordered']] as const).map(([lbl, field]) => (
                <tr key={field} style={{ borderBottom: '1px solid rgba(44,26,62,0.05)' }}>
                  <td style={rowLabel}>{lbl}</td>
                  {feeds.map((f) => <td key={f.code} style={{ ...td, color: C.gray }}>{editing
                    ? <input type="number" value={week.feeds[f.code][field]} onChange={(e) => setF(f.code, field, Number(e.target.value))} style={inputCell} />
                    : week.feeds[f.code][field]}</td>)}
                </tr>
              ))}
              <tr style={{ background: C.whisperT, borderBottom: '1px solid rgba(44,26,62,0.05)' }}>
                <td style={{ ...rowLabel, background: C.whisperT, color: C.teal }}>Have</td>
                {feeds.map((f) => <td key={f.code} style={td}>{editing
                  ? <input type="number" value={week.feeds[f.code].have ?? ''} onChange={(e) => setF(f.code, 'have', e.target.value === '' ? null : Number(e.target.value))} style={inputCell} />
                  : (week.feeds[f.code].have ?? '–')}</td>)}
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(44,26,62,0.05)' }}>
                <td style={rowLabel}>Used</td>
                {feeds.map((f) => { const u = calcUsed(week.feeds[f.code]); return <td key={f.code} style={{ ...td, color: C.ink, fontWeight: 600 }}>{u === null ? '–' : u}</td>; })}
              </tr>
              <tr style={{ background: C.whisperP }}>
                <td style={{ ...rowLabel, background: C.whisperP, color: C.purple }}>Order</td>
                {feeds.map((f) => { const c = week.feeds[f.code]; const q = orderQty(c, settings.buffer); return <td key={f.code} style={{ ...td, color: C.purple, fontWeight: 700 }}>{editing
                  ? <input type="number" value={c.orderSent ?? q} onChange={(e) => { setF(f.code, 'orderSent', Number(e.target.value)); mutate((s) => { s.weeks[idx].feeds[f.code].overridden = true; }); }} style={{ ...inputCell, fontWeight: 700, color: C.purple }} />
                  : <>{q}{!editing && c.overridden ? ' *' : ''}</>}</td>; })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {week.oil && week.oil.on && (
        <div style={{ marginBottom: 14 }}><Chip tone="gold" icon="droplet">Rice Bran Oil · billed to {ACCOUNT_LABEL[week.oil.account]}</Chip></div>
      )}

      <SectionLabel>Message sent</SectionLabel>
      <div style={{ background: C.whisperP, borderRadius: 12, padding: '13px 15px', fontFamily: FONT, fontSize: 14, color: C.ink, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{week.message || composeMessage(week, settings)}</div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {editing
          ? <><div style={{ flex: 1 }}><AppButton variant="soft" full icon="refresh" onClick={rebuildMsg}>Rebuild msg</AppButton></div><div style={{ flex: 1 }}><AppButton variant="primary" full icon="check" onClick={() => { setEditing(false); toast('Saved'); }}>Done</AppButton></div></>
          : <><div style={{ flex: 1 }}><AppButton variant="ghost" full icon="edit" onClick={() => setEditing(true)}>Edit week</AppButton></div><div style={{ flex: 1 }}><AppButton variant="soft" full onClick={onClose}>Close</AppButton></div></>}
      </div>

      {!editing && !isActive && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.warm}` }}>
          <SectionLabel style={{ color: C.alert }}>Remove this week</SectionLabel>
          <p style={{ fontSize: 12.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, margin: '0 0 11px' }}>Deletes this week’s record for good. Later weeks keep their saved numbers. <b style={{ color: C.ink }}>Press and hold</b> the button; a quick tap won’t do it.</p>
          <HoldButton icon="trash" onConfirm={() => onDelete(week.id)}>Hold to delete this week</HoldButton>
        </div>
      )}
      {!editing && isActive && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: C.whisperP, borderRadius: 9 }}>
          <AppIcon name="info" size={15} color={C.purple} />
          <span style={{ fontSize: 12, color: C.gray, fontFamily: FONT }}>This is the current week. Finish or send it before it can be deleted.</span>
        </div>
      )}
    </div>
  );
}
