/* This Week worksheet (cards + spreadsheet) — ported from app-screens-week.jsx. */
import { useState } from 'react';
import { C, FONT, STENCIL } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { Stepper, Segmented, Chip, SectionLabel, AppButton, Sheet, Toggle } from '../ui/primitives';
import { FeedCard } from './FeedCard';
import { GridSheet } from './GridSheet';
import {
  activeFeeds, orderQty, isOdd, parseISO, fmtShort, fmtLong, fmtSlash, feedFullName,
  saveState, ACCOUNT_LABEL, type AppState, type Account, type Oil,
} from '../lib/data';

export function ThisWeekScreen({
  state, setState, layout, overrideColor, oilReminder, onReview, onStartNext,
}: {
  state: AppState; setState: (s: AppState) => void; layout: 'cards' | 'grid'; overrideColor: string;
  oilReminder: boolean; onReview: () => void; onStartNext: () => void;
}) {
  const week = state.weeks[state.weeks.length - 1];
  const { settings } = state;
  const [sheet, setSheet] = useState<string | null>(null); // 'date' | feedCode for carried

  const mutate = (fn: (s: AppState) => void) => { const s: AppState = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };
  const last = (s: AppState) => s.weeks[s.weeks.length - 1];
  const setEntry = (code: string, v: number | null) => mutate((s) => { const c = last(s).feeds[code]; c.have = v; if (!c.overridden) c.orderSent = null; });
  const setOrder = (code: string, v: number | null) => mutate((s) => { const c = last(s).feeds[code]; c.orderSent = v; c.overridden = true; });
  const revert = (code: string) => mutate((s) => { const c = last(s).feeds[code]; c.overridden = false; c.orderSent = null; });
  const setCarried = (code: string, field: 'had' | 'ordered', v: number | null) => mutate((s) => { last(s).feeds[code][field] = Math.max(0, v || 0); });
  const setOil = (patch: Partial<Oil>) => mutate((s) => { Object.assign(last(s).oil, patch); });
  const setDate = (iso: string) => mutate((s) => { const w = last(s); w.date = iso; w.id = iso; });

  // active feeds present in this week (archived feeds drop off going forward)
  const wkFeeds = activeFeeds(settings).filter((f) => week.feeds[f.code] !== undefined);

  // order summary
  const lines = wkFeeds.map((f) => ({ f, q: orderQty(week.feeds[f.code], settings.buffer), have: week.feeds[f.code].have })).filter((l) => l.q > 0);
  const total = lines.reduce((a, l) => a + l.q, 0);
  const anyOdd = wkFeeds.some((f) => { const q = orderQty(week.feeds[f.code], settings.buffer); return isOdd(q) && q > 0; });
  const counted = wkFeeds.filter((f) => week.feeds[f.code].have !== null).length;
  const allCounted = counted === wkFeeds.length;

  // oil reminder (≈8wk since last oil)
  const lastOil = [...state.weeks].reverse().find((w) => w.oil && w.oil.on && w.sent);
  const weeksSinceOil = lastOil ? Math.round((+parseISO(week.date) - +parseISO(lastOil.date)) / (7 * 864e5)) : 99;
  const showOilReminder = oilReminder && !week.oil.on && weeksSinceOil >= 8 && !!lastOil;

  const editFeed = sheet && sheet !== 'date' ? settings.feeds.find((f) => f.code === sheet) : null;

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      {/* sent banner */}
      {week.sent && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.teal, borderRadius: 14, padding: '13px 15px', marginBottom: 14, color: C.off }}>
          <AppIcon name="check" size={22} color={C.off} stroke={2.4} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15 }}>Order sent for {fmtShort(week.date)}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Counts carry forward to next week.</div>
          </div>
          <button onClick={onStartNext} style={{ background: C.off, color: C.teal, border: 0, borderRadius: 9, padding: '9px 13px', fontFamily: FONT, fontWeight: 900, fontSize: 11.5, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>Next week</button>
        </div>
      )}
      {/* order date */}
      <button onClick={() => setSheet('date')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: C.white, border: '1px solid rgba(44,26,62,0.05)', boxShadow: '0 2px 8px rgba(44,26,62,0.07)', borderRadius: 14, padding: '13px 15px', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.whisperP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AppIcon name="calendar" size={21} color={C.purple} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.gray }}>Order date</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 18, color: C.purple, marginTop: 1 }}>{fmtLong(week.date)}</div>
        </div>
        <AppIcon name="edit" size={16} color={C.purpleLight} />
      </button>

      {/* delivery rationale */}
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '11px 2px 4px' }}>
        <AppIcon name="truck" size={16} color={C.teal} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5, fontFamily: FONT }}>
          Delivery arrives <b style={{ color: C.ink }}>Thursday</b>. Size each order to last through <b style={{ color: C.ink }}>next Thursday morning’s feeding</b>, about 8 days. That’s what the safety buffer covers.
        </div>
      </div>

      {/* count progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 2px 12px' }}>
        <SectionLabel style={{ margin: 0 }}>This week’s worksheet</SectionLabel>
        <Chip tone={allCounted ? 'teal' : 'neutral'} icon={allCounted ? 'check' : undefined}>{counted}/{wkFeeds.length} counted</Chip>
      </div>

      {/* worksheet */}
      {layout === 'grid' ? (
        <GridSheet feeds={wkFeeds} week={week} buffer={settings.buffer} onEntry={setEntry} onOrder={setOrder} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {wkFeeds.map((f) => (
            <FeedCard key={f.code} feed={f} cell={week.feeds[f.code]} buffer={settings.buffer} overrideColor={overrideColor}
              onEntry={(v) => setEntry(f.code, v)} onOrder={(v) => setOrder(f.code, v)} onRevert={() => revert(f.code)} onEditCarried={() => setSheet(f.code)} />
          ))}
        </div>
      )}

      {/* rice bran oil */}
      <div style={{ marginTop: 18, background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', padding: '14px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.whisperP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AppIcon name="droplet" size={19} color={C.purple} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15.5, color: C.ink }}>Rice Bran Oil</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>One gallon · not split · billed whole</div>
          </div>
          <Toggle on={week.oil.on} onChange={(v) => setOil({ on: v })} />
        </div>
        {week.oil.on && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, paddingTop: 13, borderTop: `1px solid ${C.warm}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.gray, fontFamily: FONT }}>Bill to</span>
            <Segmented<Account> value={week.oil.account} onChange={(v) => setOil({ account: v })} options={[{ value: 'mane', label: 'Mane Characters' }, { value: 'maple', label: 'Maplehurst' }]} />
          </div>
        )}
        {showOilReminder && lastOil && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, padding: '9px 12px', background: '#F7EFD6', borderRadius: 9 }}>
            <AppIcon name="info" size={15} color="#8a6d12" />
            <span style={{ fontSize: 12, color: '#8a6d12', fontFamily: FONT, fontWeight: 600 }}>Last ordered {fmtSlash(lastOil.date)}. Running low?</span>
          </div>
        )}
      </div>

      {/* summary + CTA */}
      <div style={{ marginTop: 18, background: C.purpleDeep, borderRadius: 16, padding: '16px 17px', color: C.off }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: STENCIL, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11.5, color: C.tealLight }}>Order summary</span>
          <span style={{ fontSize: 12.5, color: 'rgba(249,248,248,0.6)' }}>{total} bags{week.oil.on ? ' + 1 gal oil' : ''}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '12px 0 4px' }}>
          {lines.length === 0 && <div style={{ fontSize: 13.5, color: 'rgba(249,248,248,0.7)' }}>No feeds to order yet.</div>}
          {lines.map((l) => {
            const odd = isOdd(l.q);
            return (
              <div key={l.f.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT }}>
                <span style={{ fontSize: 14 }}>{feedFullName(l.f)}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: odd ? '#F2A88F' : C.tealLight }}>{l.q}{odd ? ' ⚠' : ''}</span>
              </div>
            );
          })}
          {week.oil.on && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, paddingTop: 6, marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: 14 }}>Rice Bran Oil · {ACCOUNT_LABEL[week.oil.account]}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.tealLight }}>1 gal</span>
            </div>
          )}
        </div>
        {anyOdd && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', margin: '10px 0 2px', padding: '8px 11px', background: 'rgba(192,73,47,0.22)', borderRadius: 9 }}>
            <AppIcon name="warn" size={15} color="#F2A88F" />
            <span style={{ fontSize: 11.5, color: '#F6C3B2', fontFamily: FONT, fontWeight: 600 }}>An odd quantity can’t be split evenly. Review before sending.</span>
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <AppButton variant="teal" full size="lg" iconRight="arrowR" onClick={onReview} disabled={lines.length === 0}>Review order message</AppButton>
        </div>
      </div>

      {/* date sheet */}
      <Sheet open={sheet === 'date'} title="Order date" onClose={() => setSheet(null)}>
        <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>Orders go out every Tuesday. Adjust if this week is different.</p>
        <input type="date" value={week.date} onChange={(e) => { if (e.target.value) setDate(e.target.value); }}
          style={{ width: '100%', padding: '13px 14px', borderRadius: 11, border: `1.5px solid ${C.warm}`, fontFamily: FONT, fontSize: 16, color: C.ink, marginBottom: 8 }} />
        <div style={{ marginTop: 6 }}><AppButton variant="primary" full onClick={() => setSheet(null)}>Done</AppButton></div>
      </Sheet>

      {/* carried-counts sheet */}
      <Sheet open={!!editFeed} title={editFeed ? `Adjust: ${editFeed.name}` : ''} onClose={() => setSheet(null)}>
        {editFeed && (() => {
          const c = week.feeds[editFeed.code];
          return (
            <div>
              <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>These carried forward from last week. Edit only if a count was off or feed came in outside the normal order.</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.warm}` }}>
                <div><div style={{ fontWeight: 600, color: C.ink, fontFamily: FONT }}>Had last week</div><div style={{ fontSize: 12, color: C.gray }}>Bags on hand at the last order</div></div>
                <Stepper value={c.had} onChange={(v) => setCarried(editFeed.code, 'had', v)} accent={C.purple} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                <div><div style={{ fontWeight: 600, color: C.ink, fontFamily: FONT }}>Ordered last week</div><div style={{ fontSize: 12, color: C.gray }}>Bags in the last order</div></div>
                <Stepper value={c.ordered} onChange={(v) => setCarried(editFeed.code, 'ordered', v)} accent={C.purple} />
              </div>
              <div style={{ marginTop: 10 }}><AppButton variant="primary" full onClick={() => setSheet(null)}>Done</AppButton></div>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
