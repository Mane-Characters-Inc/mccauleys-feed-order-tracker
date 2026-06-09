/* =====================================================================
   Feed Order Tracker — This Week + Order Message screens
   ===================================================================== */

/* ---- one feed's worksheet card ------------------------------------ */
function FeedCard({ feed, cell, buffer, overrideColor = C.gold, onEntry, onOrder, onRevert, onEditCarried }) {
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

/* ---- compact spreadsheet variant ---------------------------------- */
function GridSheet({ feeds, week, buffer, onEntry, onOrder }) {
  const cellStyle = { padding: '9px 8px', textAlign: 'center', fontFamily: FONT, fontSize: 14, borderBottom: '1px solid rgba(44,26,62,0.06)' };
  const rowLabel = { ...cellStyle, textAlign: 'left', fontWeight: 600, color: C.gray, fontSize: 12.5, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: C.white };
  const mini = (val, onChange, accent, warn) => (
    <input type="number" value={val === null || val === undefined ? '' : val} placeholder="–"
      onChange={(e) => { const v = e.target.value; onChange(v === '' ? null : Number(v)); }}
      style={{ width: 46, height: 32, textAlign: 'center', border: `1.5px solid ${warn ? C.alert : C.warm}`, borderRadius: 7, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: warn ? C.alert : accent, background: warn ? C.alertSoft : C.white }} />
  );
  return (
    <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 360 }}>
          <thead>
            <tr style={{ background: C.purpleDeep }}>
              <th style={{ ...rowLabel, background: C.purpleDeep, color: C.tealLight, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feed</th>
              {feeds.map(f => <th key={f.code} style={{ ...cellStyle, color: C.off, fontWeight: 700, fontSize: 12.5, borderBottom: 0 }}>{shortLabel(f.name)}</th>)}
            </tr>
          </thead>
          <tbody>
            {['Had','Ordered'].map(lbl => (
              <tr key={lbl}>
                <td style={rowLabel}>{lbl} last wk</td>
                {feeds.map(f => <td key={f.code} style={{ ...cellStyle, color: C.gray }}>{week.feeds[f.code][lbl === 'Had' ? 'had' : 'ordered']}</td>)}
              </tr>
            ))}
            <tr style={{ background: C.whisperT }}>
              <td style={{ ...rowLabel, background: C.whisperT, color: C.teal }}>Have today</td>
              {feeds.map(f => <td key={f.code} style={cellStyle}>{mini(week.feeds[f.code].have, (v) => onEntry(f.code, v), C.teal)}</td>)}
            </tr>
            <tr>
              <td style={rowLabel}>Used</td>
              {feeds.map(f => { const u = calcUsed(week.feeds[f.code]); return <td key={f.code} style={{ ...cellStyle, color: C.ink, fontWeight: 600 }}>{u === null ? '—' : u}</td>; })}
            </tr>
            <tr>
              <td style={rowLabel}>Suggested</td>
              {feeds.map(f => { const s = calcSuggested(week.feeds[f.code], buffer); return <td key={f.code} style={{ ...cellStyle, color: C.teal, fontWeight: 700 }}>{s === null ? '—' : s}</td>; })}
            </tr>
            <tr style={{ background: C.whisperP }}>
              <td style={{ ...rowLabel, background: C.whisperP, color: C.purple }}>Order</td>
              {feeds.map(f => { const c = week.feeds[f.code]; const q = orderQty(c, buffer); const odd = isOdd(q) && q > 0; const has = c.have !== null; return <td key={f.code} style={cellStyle}>{mini(has ? q : null, (v) => onOrder(f.code, v), C.purple, odd)}</td>; })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- This Week screen --------------------------------------------- */
function ThisWeekScreen({ state, setState, layout, overrideColor, oilReminder, onReview, onStartNext, toast }) {
  const week = state.weeks[state.weeks.length - 1];
  const { settings } = state;
  const [sheet, setSheet] = React.useState(null); // 'date' | feedCode for carried

  const mutate = (fn) => { const s = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };
  const setEntry = (code, v) => mutate(s => { const c = s.weeks[s.weeks.length-1].feeds[code]; c.have = v; if (!c.overridden) c.orderSent = null; });
  const setOrder = (code, v) => mutate(s => { const c = s.weeks[s.weeks.length-1].feeds[code]; c.orderSent = v; c.overridden = true; });
  const revert = (code) => mutate(s => { const c = s.weeks[s.weeks.length-1].feeds[code]; c.overridden = false; c.orderSent = null; });
  const setCarried = (code, field, v) => mutate(s => { s.weeks[s.weeks.length-1].feeds[code][field] = Math.max(0, v || 0); });
  const setOil = (patch) => mutate(s => { Object.assign(s.weeks[s.weeks.length-1].oil, patch); });
  const setDate = (iso) => mutate(s => { const w = s.weeks[s.weeks.length-1]; w.date = iso; w.id = iso; });

  // active feeds present in this week (archived feeds drop off going forward)
  const wkFeeds = activeFeeds(settings).filter(f => week.feeds[f.code] !== undefined);

  // order summary
  const lines = wkFeeds.map(f => ({ f, q: orderQty(week.feeds[f.code], settings.buffer), have: week.feeds[f.code].have })).filter(l => l.q > 0);
  const total = lines.reduce((a, l) => a + l.q, 0);
  const anyOdd = wkFeeds.some(f => { const q = orderQty(week.feeds[f.code], settings.buffer); return isOdd(q) && q > 0; });
  const counted = wkFeeds.filter(f => week.feeds[f.code].have !== null).length;
  const allCounted = counted === wkFeeds.length;

  // oil reminder (≈8wk since last oil)
  const lastOil = [...state.weeks].reverse().find(w => w.oil && w.oil.on && w.sent);
  const weeksSinceOil = lastOil ? Math.round((parseISO(week.date) - parseISO(lastOil.date)) / (7*864e5)) : 99;
  const showOilReminder = oilReminder && !week.oil.on && weeksSinceOil >= 8;

  const editFeed = sheet && sheet !== 'date' ? settings.feeds.find(f => f.code === sheet) : null;

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
          Delivery arrives <b style={{ color: C.ink }}>Thursday</b>. Size each order to last through <b style={{ color: C.ink }}>next Thursday morning’s feeding</b> — about 8 days. That’s what the safety buffer covers.
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
          {wkFeeds.map(f => (
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
            <Segmented value={week.oil.account} onChange={(v) => setOil({ account: v })} options={[{ value: 'mane', label: 'Mane Characters' }, { value: 'maple', label: 'Maplehurst' }]} />
          </div>
        )}
        {showOilReminder && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, padding: '9px 12px', background: '#F7EFD6', borderRadius: 9 }}>
            <AppIcon name="info" size={15} color="#8a6d12" />
            <span style={{ fontSize: 12, color: '#8a6d12', fontFamily: FONT, fontWeight: 600 }}>Last ordered {fmtSlash(lastOil.date)} — running low?</span>
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
          {lines.map(l => {
            const odd = isOdd(l.q);
            return (
              <div key={l.f.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT }}>
                <span style={{ fontSize: 14 }}>{l.f.name}</span>
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
      <Sheet open={!!editFeed} title={editFeed ? `Adjust — ${editFeed.name}` : ''} onClose={() => setSheet(null)}>
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

/* ---- Order Message screen ----------------------------------------- */
function MessageScreen({ state, setState, onBack, onSent, toast }) {
  const week = state.weeks[state.weeks.length - 1];
  const { settings } = state;
  const composed = composeMessage(week, settings);
  const edited = week.messageEdited && week.message != null;
  const text = edited ? week.message : composed;
  const [sending, setSending] = React.useState(false);
  const orderC = orderContact(settings);
  const others = (settings.contacts || []).filter(c => c.id !== 'orderText');

  const mutate = (fn) => { const s = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };
  const onText = (v) => mutate(s => { const w = s.weeks[s.weeks.length-1]; w.message = v; w.messageEdited = true; });
  const rebuild = () => mutate(s => { const w = s.weeks[s.weeks.length-1]; w.message = null; w.messageEdited = false; }) || toast('Rebuilt from numbers');
  const copy = () => { try { navigator.clipboard.writeText(text); } catch(e){} toast('Copied to clipboard'); };
  const confirmSend = () => mutate(s => { const w = s.weeks[s.weeks.length-1]; w.message = text; w.sent = true; });

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      {/* recipient: order text line */}
      <ContactCard contact={orderC} org={settings.supplierName} body={text} toast={toast} />

      {/* status note */}
      <div style={{ margin: '14px 2px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {edited
          ? <Chip tone="gold" icon="edit">Manually edited</Chip>
          : <Chip tone="teal" icon="check">Auto-composed from this week’s numbers</Chip>}
      </div>

      {/* editable message bubble */}
      <SectionLabel style={{ margin: '2px 2px 8px' }}>Message — tap to edit</SectionLabel>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', maxWidth: '94%', width: '100%' }}>
          <textarea value={text} onChange={(e) => onText(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 220, resize: 'vertical', background: C.purple, color: C.off, border: 0, borderRadius: 20, borderBottomRightRadius: 6, padding: '15px 17px', fontFamily: FONT, fontSize: 15.5, lineHeight: 1.55, boxShadow: '0 2px 10px rgba(44,26,62,0.18)' }} />
        </div>
      </div>
      {week.sent && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <Chip tone="sent" icon="check">Sent · {fmtSlash(week.date)}</Chip>
        </div>
      )}

      {/* actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        {!week.sent && <AppButton variant="teal" full size="lg" icon="send" onClick={() => setSending(true)}>Send via text</AppButton>}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><AppButton variant="soft" full icon="copy" onClick={copy}>Copy</AppButton></div>
          <div style={{ flex: 1 }}><AppButton variant="soft" full icon="refresh" onClick={rebuild} disabled={!edited}>Rebuild</AppButton></div>
        </div>
        <AppButton variant="ghost" full icon="back" onClick={onBack}>Back to worksheet</AppButton>
      </div>

      {/* other supplier contacts */}
      {others.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <SectionLabel>More McCauley’s contacts</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {others.map(c => <ContactCard key={c.id} contact={c} org={settings.supplierName} toast={toast} />)}
          </div>
        </div>
      )}

      {/* simulated Messages send sheet */}
      <Sheet open={sending} title="Send to supplier" onClose={() => setSending(false)}>
        <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>This opens your phone’s Messages app with the order pre-filled to <b style={{ color: C.ink }}>{orderC.name}</b> ({orderC.phone || 'no number set'}). You send it from there — no connection needed in the app.</p>
        <div style={{ background: C.whisperP, borderRadius: 12, padding: '12px 14px', fontFamily: FONT, fontSize: 13.5, color: C.ink, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 170, overflow: 'auto' }}>{text}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
          <a href={orderC.phone ? smsHref(orderC.phone, text) : undefined} onClick={(e) => { if (!orderC.phone) { e.preventDefault(); toast('Set the order text number in Settings'); return; } setSending(false); confirmSend(); onSent(); }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '15px 22px', borderRadius: 10, textDecoration: 'none', background: C.teal, color: C.off, fontFamily: FONT, fontWeight: 900, fontSize: 13.5, letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(44,26,62,0.14)' }}>
            <AppIcon name="send" size={17} color={C.off} stroke={2.2} /> Open Messages &amp; mark sent
          </a>
          <AppButton variant="ghost" full onClick={() => setSending(false)}>Cancel</AppButton>
        </div>
      </Sheet>
    </div>
  );
}

Object.assign(window, { FeedCard, GridSheet, ThisWeekScreen, MessageScreen });
