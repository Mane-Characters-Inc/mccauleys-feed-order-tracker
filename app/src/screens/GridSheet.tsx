/* Compact spreadsheet worksheet variant — ported from app-screens-week.jsx. */
import type { CSSProperties } from 'react';
import { C, FONT } from '../ui/tokens';
import { calcUsed, calcSuggested, orderQty, isOdd, shortLabel, type Feed, type Week } from '../lib/data';

export function GridSheet({
  feeds, week, buffer, onEntry, onOrder,
}: {
  feeds: Feed[]; week: Week; buffer: number;
  onEntry: (code: string, v: number | null) => void; onOrder: (code: string, v: number | null) => void;
}) {
  const cellStyle: CSSProperties = { padding: '9px 8px', textAlign: 'center', fontFamily: FONT, fontSize: 14, borderBottom: '1px solid rgba(44,26,62,0.06)' };
  const rowLabel: CSSProperties = { ...cellStyle, textAlign: 'left', fontWeight: 600, color: C.gray, fontSize: 12.5, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: C.white };
  const mini = (val: number | null | undefined, onChange: (v: number | null) => void, accent: string, warn?: boolean) => (
    <input
      type="number" value={val === null || val === undefined ? '' : val} placeholder="–" inputMode="numeric"
      onChange={(e) => { const v = e.target.value; onChange(v === '' ? null : Number(v)); }}
      style={{ width: 46, height: 32, textAlign: 'center', border: `1.5px solid ${warn ? C.alert : C.warm}`, borderRadius: 7, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: warn ? C.alert : accent, background: warn ? C.alertSoft : C.white }}
    />
  );
  return (
    <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden' }}>
      <div className="mc-scroll" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
          <thead>
            <tr style={{ background: C.purpleDeep }}>
              <th style={{ ...rowLabel, background: C.purpleDeep, color: C.tealLight, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feed</th>
              {feeds.map((f) => <th key={f.code} style={{ ...cellStyle, color: C.off, fontWeight: 700, fontSize: 12.5, borderBottom: 0 }}>{shortLabel(f.name)}</th>)}
            </tr>
          </thead>
          <tbody>
            {(['Had', 'Ordered'] as const).map((lbl) => (
              <tr key={lbl}>
                <td style={rowLabel}>{lbl} last wk</td>
                {feeds.map((f) => <td key={f.code} style={{ ...cellStyle, color: C.gray }}>{week.feeds[f.code][lbl === 'Had' ? 'had' : 'ordered']}</td>)}
              </tr>
            ))}
            <tr style={{ background: C.whisperT }}>
              <td style={{ ...rowLabel, background: C.whisperT, color: C.teal }}>Have today</td>
              {feeds.map((f) => <td key={f.code} style={cellStyle}>{mini(week.feeds[f.code].have, (v) => onEntry(f.code, v), C.teal)}</td>)}
            </tr>
            <tr>
              <td style={rowLabel}>Used</td>
              {feeds.map((f) => { const u = calcUsed(week.feeds[f.code]); return <td key={f.code} style={{ ...cellStyle, color: C.ink, fontWeight: 600 }}>{u === null ? '—' : u}</td>; })}
            </tr>
            <tr>
              <td style={rowLabel}>Suggested</td>
              {feeds.map((f) => { const s = calcSuggested(week.feeds[f.code], buffer); return <td key={f.code} style={{ ...cellStyle, color: C.teal, fontWeight: 700 }}>{s === null ? '—' : s}</td>; })}
            </tr>
            <tr style={{ background: C.whisperP }}>
              <td style={{ ...rowLabel, background: C.whisperP, color: C.purple }}>Order</td>
              {feeds.map((f) => { const c = week.feeds[f.code]; const q = orderQty(c, buffer); const odd = isOdd(q) && q > 0; const has = c.have !== null; return <td key={f.code} style={cellStyle}>{mini(has ? q : null, (v) => onOrder(f.code, v), C.purple, odd)}</td>; })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
