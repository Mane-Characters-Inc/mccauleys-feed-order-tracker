/* History list — ported from app-screens-more.jsx. */
import { useState } from 'react';
import { C, FONT } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { SectionLabel, Chip, Sheet } from '../ui/primitives';
import { WeekDetail } from './WeekDetail';
import {
  weekFeedList, orderQty, shortLabel, parseISO, fmtLong, fmtSlash,
  deleteWeek, saveState, type AppState,
} from '../lib/data';

export function HistoryScreen({
  state, setState, toast,
}: {
  state: AppState; setState: (s: AppState) => void; toast: (m: string) => void;
}) {
  const { settings } = state;
  const [open, setOpen] = useState<string | null>(null);
  const weeks = [...state.weeks].reverse();
  const detailWeek = open ? state.weeks.find((w) => w.id === open) : null;
  const removeWeek = (id: string) => { const s = deleteWeek(state, id); saveState(s); setState(s); setOpen(null); toast('Week deleted'); };

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      <SectionLabel>All weeks · newest first</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {weeks.map((w) => {
          const lines = weekFeedList(w, settings).map((f) => ({ code: f.code, label: shortLabel(f.name), q: orderQty(w.feeds[f.code], settings.buffer) })).filter((l) => l.q > 0);
          const total = lines.reduce((a, l) => a + l.q, 0);
          return (
            <button key={w.id} onClick={() => setOpen(w.id)} style={{ textAlign: 'left', background: C.white, border: '1px solid rgba(44,26,62,0.05)', boxShadow: '0 2px 8px rgba(44,26,62,0.07)', borderRadius: 14, padding: '14px 15px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 16.5, color: C.purple }}>{fmtLong(w.date)}</span>
                  <span style={{ fontSize: 12, color: C.gray }}>{String(parseISO(w.date).getFullYear())}</span>
                </div>
                {w.sent ? <Chip tone="sent" icon="check">Sent</Chip> : <Chip tone="neutral">Active</Chip>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {lines.map((l) => (
                  <span key={l.code} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5, background: C.whisperP, borderRadius: 999, padding: '3px 9px', fontFamily: FONT, fontSize: 12.5 }}>
                    <b style={{ color: C.teal }}>{l.q}</b> <span style={{ color: C.gray }}>{l.label}</span>
                  </span>
                ))}
                {w.oil && w.oil.on && <AppIcon name="droplet" size={15} color={C.gold} />}
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.gray, fontFamily: FONT }}>{total} bags <AppIcon name="chev" size={15} color={C.purpleLight} /></span>
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={!!detailWeek} title={detailWeek ? `Week of ${fmtSlash(detailWeek.date)}` : ''} onClose={() => setOpen(null)}>
        {detailWeek && <WeekDetail state={state} setState={setState} week={detailWeek} onClose={() => setOpen(null)} onDelete={removeWeek} toast={toast} />}
      </Sheet>
    </div>
  );
}
