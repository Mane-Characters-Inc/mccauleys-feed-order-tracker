/* One feed's worksheet card (cards layout) — ported from app-screens-week.jsx. */
import { C, FONT } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { Stepper } from '../ui/primitives';
import { calcUsed, calcSuggested, orderQty, isOdd, type Feed, type FeedCell } from '../lib/data';

export function FeedCard({
  feed, cell, buffer, overrideColor = C.gold, onEntry, onOrder, onRevert, onEditCarried,
}: {
  feed: Feed; cell: FeedCell; buffer: number; overrideColor?: string;
  onEntry: (v: number | null) => void; onOrder: (v: number | null) => void; onRevert: () => void; onEditCarried: () => void;
}) {
  const used = calcUsed(cell);
  const suggested = calcSuggested(cell, buffer);
  const order = orderQty(cell, buffer);
  const hasHave = cell.have !== null && cell.have !== undefined;
  const odd = isOdd(order) && order > 0;
  const edited = cell.overridden && hasHave;

  return (
    <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden', border: odd ? `1.5px solid ${C.alert}` : '1px solid rgba(44,26,62,0.05)' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px 0' }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 17, color: C.purple }}>{feed.name}</div>
      </div>

      {/* carried strip */}
      <button onClick={onEditCarried} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 15px 0', padding: '7px 11px', background: C.whisperP, border: 0, borderRadius: 9, cursor: 'pointer', width: 'calc(100% - 30px)', textAlign: 'left' }}>
        <span style={{ fontSize: 12.5, color: C.gray, fontFamily: FONT }}>
          Carried in · <b style={{ color: C.purple }}>Had {cell.had}</b> · <b style={{ color: C.purple }}>Ordered {cell.ordered}</b>
        </span>
        <AppIcon name="edit" size={13} color={C.purpleLight} style={{ marginLeft: 'auto' }} />
      </button>

      {/* have today — the one required entry */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '11px 15px 0', padding: '10px 12px', background: C.whisperT, borderRadius: 10 }}>
        <div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: C.teal, letterSpacing: '0.01em' }}>Have today</div>
          <div style={{ fontSize: 11.5, color: C.gray, marginTop: 1 }}>Count the bags on hand</div>
        </div>
        <Stepper value={cell.have} onChange={(v) => onEntry(v)} accent={C.teal} size="lg" />
      </div>

      {/* derived */}
      <div style={{ display: 'flex', gap: 18, padding: '11px 16px 0', fontFamily: FONT }}>
        <div style={{ fontSize: 13 }}>
          <span style={{ color: C.gray }}>Used </span>
          <b style={{ color: C.ink }}>{used === null ? '—' : used}</b>
        </div>
        <div style={{ fontSize: 13 }}>
          <span style={{ color: C.gray }}>Suggests </span>
          <b style={{ color: C.teal }}>{suggested === null ? '—' : suggested}</b>
        </div>
      </div>

      {/* order this week */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '9px 15px 14px', padding: '11px 12px', background: edited ? `${overrideColor}1A` : C.off, borderRadius: 10, border: edited ? `1.5px solid ${overrideColor}` : '1px solid transparent' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13.5, color: C.purple, letterSpacing: '0.01em' }}>Order this week</span>
            {edited && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: overrideColor, color: '#fff', borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}><AppIcon name="edit" size={11} color="#fff" stroke={2.4} />Edited</span>}
          </div>
          {edited
            ? <button onClick={onRevert} style={{ marginTop: 3, background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: C.gray, fontSize: 11.5, fontFamily: FONT }}><AppIcon name="refresh" size={12} color={C.gray} /> Revert to {suggested}</button>
            : <div style={{ fontSize: 11.5, color: C.gray, marginTop: 1 }}>Auto-filled from suggestion</div>}
        </div>
        <Stepper value={hasHave ? order : null} onChange={onOrder} accent={C.purple} size="lg" warn={odd} />
      </div>

      {odd && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '-4px 15px 13px', padding: '9px 12px', background: C.alertSoft, borderRadius: 9 }}>
          <AppIcon name="warn" size={16} color={C.alert} />
          <span style={{ fontSize: 12, color: C.alert, fontFamily: FONT, fontWeight: 600 }}>Odd number — can’t be split evenly between the two accounts.</span>
        </div>
      )}
    </div>
  );
}
