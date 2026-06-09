/* =====================================================================
   Feed Order Tracker — History, Backup, Settings screens
   ===================================================================== */

/* ---- History ------------------------------------------------------- */
function WeekDetail({ state, setState, week, onClose, onDelete, toast }) {
  const { settings } = state;
  const feeds = weekFeedList(week, settings);
  const isActive = state.weeks[state.weeks.length - 1].id === week.id;
  const [editing, setEditing] = React.useState(false);
  const mutate = (fn) => { const s = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };
  const idx = state.weeks.findIndex(w => w.id === week.id);
  const setF = (code, field, v) => mutate(s => { s.weeks[idx].feeds[code][field] = field === 'have' ? v : Math.max(0, v || 0); });
  const rebuildMsg = () => mutate(s => { s.weeks[idx].message = composeMessage(s.weeks[idx], s.settings); s.weeks[idx].messageEdited = false; }) || toast('Message rebuilt');

  const rowLabel = { padding: '8px 8px', textAlign: 'left', fontWeight: 600, color: C.gray, fontSize: 12, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: C.white };
  const td = { padding: '8px 6px', textAlign: 'center', fontFamily: FONT, fontSize: 13.5 };

  return (
    <div>
      {editing && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: '#F7EFD6', borderRadius: 9, marginBottom: 12 }}>
          <AppIcon name="info" size={15} color="#8a6d12" />
          <span style={{ fontSize: 12, color: '#8a6d12', fontFamily: FONT, fontWeight: 600 }}>Fixing a past entry won’t recompute later weeks — they keep their saved numbers.</span>
        </div>
      )}
      <div style={{ background: C.white, borderRadius: 12, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 320 }}>
            <thead><tr style={{ background: C.purpleDeep }}>
              <th style={{ ...rowLabel, background: C.purpleDeep, color: C.tealLight, fontSize: 11, textTransform: 'uppercase' }}>Feed</th>
              {feeds.map(f => <th key={f.code} style={{ ...td, color: C.off, fontWeight: 700, fontSize: 12 }}>{shortLabel(f.name)}</th>)}
            </tr></thead>
            <tbody>
              {[['Had','had'],['Ordered','ordered']].map(([lbl, field]) => (
                <tr key={field} style={{ borderBottom: '1px solid rgba(44,26,62,0.05)' }}>
                  <td style={rowLabel}>{lbl}</td>
                  {feeds.map(f => <td key={f.code} style={{ ...td, color: C.gray }}>{editing
                    ? <input type="number" value={week.feeds[f.code][field]} onChange={(e) => setF(f.code, field, Number(e.target.value))} style={{ width: 42, height: 28, textAlign: 'center', border: `1.5px solid ${C.warm}`, borderRadius: 6, fontFamily: FONT, fontSize: 13, fontWeight: 600 }} />
                    : week.feeds[f.code][field]}</td>)}
                </tr>
              ))}
              <tr style={{ background: C.whisperT, borderBottom: '1px solid rgba(44,26,62,0.05)' }}>
                <td style={{ ...rowLabel, background: C.whisperT, color: C.teal }}>Have</td>
                {feeds.map(f => <td key={f.code} style={td}>{editing
                  ? <input type="number" value={week.feeds[f.code].have ?? ''} onChange={(e) => setF(f.code, 'have', e.target.value === '' ? null : Number(e.target.value))} style={{ width: 42, height: 28, textAlign: 'center', border: `1.5px solid ${C.warm}`, borderRadius: 6, fontFamily: FONT, fontSize: 13, fontWeight: 600 }} />
                  : (week.feeds[f.code].have ?? '—')}</td>)}
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(44,26,62,0.05)' }}>
                <td style={rowLabel}>Used</td>
                {feeds.map(f => { const u = calcUsed(week.feeds[f.code]); return <td key={f.code} style={{ ...td, color: C.ink, fontWeight: 600 }}>{u === null ? '—' : u}</td>; })}
              </tr>
              <tr style={{ background: C.whisperP }}>
                <td style={{ ...rowLabel, background: C.whisperP, color: C.purple }}>Order</td>
                {feeds.map(f => { const c = week.feeds[f.code]; const q = orderQty(c, settings.buffer); return <td key={f.code} style={{ ...td, color: C.purple, fontWeight: 700 }}>{editing
                  ? <input type="number" value={c.orderSent ?? q} onChange={(e) => { setF(f.code, 'orderSent', Number(e.target.value)); mutate(s => { s.weeks[idx].feeds[f.code].overridden = true; }); }} style={{ width: 42, height: 28, textAlign: 'center', border: `1.5px solid ${C.warm}`, borderRadius: 6, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.purple }} />
                  : q}{!editing && c.overridden ? ' *' : ''}</td>; })}
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
          <p style={{ fontSize: 12.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, margin: '0 0 11px' }}>Deletes this week’s record for good. Later weeks keep their saved numbers. <b style={{ color: C.ink }}>Press and hold</b> the button — a quick tap won’t do it.</p>
          <HoldButton icon="trash" onConfirm={() => onDelete(week.id)}>Hold to delete this week</HoldButton>
        </div>
      )}
      {!editing && isActive && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: C.whisperP, borderRadius: 9 }}>
          <AppIcon name="info" size={15} color={C.purple} />
          <span style={{ fontSize: 12, color: C.gray, fontFamily: FONT }}>This is the current week — finish or send it before it can be deleted.</span>
        </div>
      )}
    </div>
  );
}

function HistoryScreen({ state, setState, toast }) {
  const { settings } = state;
  const [open, setOpen] = React.useState(null);
  const weeks = [...state.weeks].reverse();
  const detailWeek = open ? state.weeks.find(w => w.id === open) : null;
  const removeWeek = (id) => { const s = deleteWeek(state, id); saveState(s); setState(s); setOpen(null); toast('Week deleted'); };

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      <SectionLabel>All weeks · newest first</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {weeks.map(w => {
          const lines = weekFeedList(w, settings).map(f => ({ code: f.code, label: shortLabel(f.name), q: orderQty(w.feeds[f.code], settings.buffer) })).filter(l => l.q > 0);
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
                {lines.map(l => (
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

/* ---- Backup -------------------------------------------------------- */
function downloadText(filename, text, type) {
  try {
    const blob = new Blob([text], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    return true;
  } catch (e) { return false; }
}

function BackupScreen({ state, setState, toast }) {
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [preview, setPreview] = React.useState('json');
  const json = exportJSON(state);
  const csv = exportCSV(state);

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.weeks || !parsed.settings) throw new Error('bad');
      saveState(parsed); setState(parsed); setImportOpen(false); setImportText(''); toast('Data restored');
    } catch (e) { toast('Couldn’t read that JSON'); }
  };
  const doReset = () => { const s = resetState(); setState(s); toast('Reset to sample data'); };

  const card = (icon, title, sub, action) => (
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
        {card('download', 'Export as JSON', 'Complete data — every week, setting & message', <AppButton variant="soft" onClick={() => { downloadText('feed-tracker-backup.json', json, 'application/json'); toast('JSON exported'); }}>Share</AppButton>)}
        {card('download', 'Export as CSV', 'One row per feed per week — opens in Excel', <AppButton variant="soft" onClick={() => { downloadText('feed-tracker.csv', csv, 'text/csv'); toast('CSV exported'); }}>Share</AppButton>)}
        {card('upload', 'Import / Restore', 'Bring back a JSON backup', <AppButton variant="soft" onClick={() => setImportOpen(true)}>Restore</AppButton>)}
      </div>

      <SectionLabel style={{ margin: '20px 0 10px' }}>Preview</SectionLabel>
      <div style={{ display: 'inline-flex', marginBottom: 10 }}>
        <Segmented value={preview} onChange={setPreview} options={[{ value: 'json', label: 'JSON' }, { value: 'csv', label: 'CSV' }]} />
      </div>
      <pre style={{ background: C.purpleDeep, color: '#D9CFE6', borderRadius: 12, padding: '13px 14px', fontSize: 10.5, lineHeight: 1.5, overflow: 'auto', maxHeight: 200, margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre' }}>{preview === 'json' ? json.slice(0, 1400) + (json.length > 1400 ? '\n  …' : '') : csv}</pre>
      <div style={{ marginTop: 10 }}>
        <AppButton variant="ghost" full icon="copy" onClick={() => { try { navigator.clipboard.writeText(preview === 'json' ? json : csv); } catch(e){} toast('Copied to clipboard'); }}>Copy {preview.toUpperCase()}</AppButton>
      </div>

      <SectionLabel style={{ margin: '22px 0 10px' }}>Auto-backup</SectionLabel>
      {card('archive', 'On-device snapshot', 'A local copy is kept so a bad edit can be undone', <Chip tone="teal" icon="check">On</Chip>)}

      <div style={{ marginTop: 22 }}>
        <button onClick={doReset} style={{ width: '100%', padding: '12px', borderRadius: 10, border: `1.5px solid ${C.warm}`, background: 'transparent', color: C.alert, fontFamily: FONT, fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', cursor: 'pointer' }}>Reset to sample data</button>
      </div>

      <Sheet open={importOpen} title="Restore from backup" onClose={() => setImportOpen(false)}>
        <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>Paste the contents of a JSON backup. This replaces all current data.</p>
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder='{ "settings": …, "weeks": [ … ] }'
          style={{ width: '100%', boxSizing: 'border-box', minHeight: 130, resize: 'vertical', border: `1.5px solid ${C.warm}`, borderRadius: 11, padding: '12px 13px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: C.ink }} />
        <div style={{ marginTop: 12 }}><AppButton variant="primary" full icon="upload" onClick={doImport} disabled={!importText.trim()}>Restore data</AppButton></div>
      </Sheet>
    </div>
  );
}

/* ---- Settings ------------------------------------------------------ */
function SettingsScreen({ state, setState, toast, bufferControl }) {
  const { settings } = state;
  const [feedSheet, setFeedSheet] = React.useState(null); // code | 'new'
  const [draft, setDraft] = React.useState({ code: '', name: '' });
  const mutate = (fn) => { const s = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };

  const active = activeFeeds(settings);
  const archived = settings.feeds.filter(f => f.active === false);
  const latestId = state.weeks[state.weeks.length - 1].id;

  // reorder among active feeds (this is the message order)
  const move = (code, dir) => mutate(s => {
    const arr = s.settings.feeds;
    const act = arr.filter(f => f.active !== false);
    const ai = act.findIndex(f => f.code === code); const aj = ai + dir;
    if (aj < 0 || aj >= act.length) return;
    const i = arr.indexOf(act[ai]), j = arr.indexOf(act[aj]);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  });
  // archive = stop using, KEEP all history. Drops the feed from the current
  // (not-yet-sent) week only; past weeks are untouched.
  const archiveFeed = (code) => { mutate(s => {
    const f = s.settings.feeds.find(x => x.code === code); if (f) f.active = false;
    const last = s.weeks[s.weeks.length - 1];
    if (last && !last.sent && last.feeds[code]) delete last.feeds[code];
  }); setFeedSheet(null); toast('Feed archived'); };
  const reactivateFeed = (code) => { mutate(s => {
    const f = s.settings.feeds.find(x => x.code === code); if (f) f.active = true;
    const last = s.weeks[s.weeks.length - 1];
    if (last && !last.sent && !last.feeds[code]) last.feeds[code] = { had:0, ordered:0, have:null, orderSent:null, overridden:false };
  }); setFeedSheet(null); toast('Feed reactivated'); };
  // permanent delete = remove the feed AND its records from every week. Guarded.
  const deleteFeedForever = (code) => { mutate(s => {
    s.settings.feeds = s.settings.feeds.filter(f => f.code !== code);
    s.weeks.forEach(w => { delete w.feeds[code]; });
  }); setFeedSheet(null); toast('Feed deleted permanently'); };
  const saveFeed = () => {
    const name = draft.name.trim();
    if (!name) return;
    mutate(s => {
      if (feedSheet !== 'new') {
        const ex = s.settings.feeds.find(f => f.code === feedSheet);
        if (ex) { ex.name = name; ex.active = true; }
      } else {
        const code = slugifyFeed(name, s.settings.feeds);
        s.settings.feeds.push({ code, name, active: true });
        // add only to the current (not-yet-sent) week — never backfill history
        const last = s.weeks[s.weeks.length - 1];
        if (last && !last.sent) last.feeds[code] = { had:0, ordered:0, have:null, orderSent:null, overridden:false };
      }
    });
    setFeedSheet(null); toast('Feed saved');
  };
  const editing = feedSheet && feedSheet !== 'new' ? settings.feeds.find(f => f.code === feedSheet) : null;
  // contacts + supplier links
  const setContact = (id, field, v) => mutate(s => { const c = (s.settings.contacts || []).find(x => x.id === id); if (c) c[field] = v; });
  const saveAllContacts = () => { const list = (settings.contacts || []).filter(c => c.phone && c.phone.trim()); if (!list.length) { toast('Add a number first'); return; } list.forEach(c => downloadVCard(c, settings.supplierName)); toast('Saved to contacts'); };
  const setLink = (id, v) => mutate(s => { const l = (s.settings.links || []).find(x => x.id === id); if (l) l.url = v; });

  const block = (children) => <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden' }}>{children}</div>;
  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', gap: 12 };
  const inputStyle = { padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${C.warm}`, fontFamily: FONT, fontSize: 15, color: C.ink, textAlign: 'right', minWidth: 0 };

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      <SectionLabel>Order calculation</SectionLabel>
      {block(
        <div style={{ padding: '14px 15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15.5, color: C.ink }}>Safety buffer</div><div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>Extra bags added per feed before rounding to even</div></div>
            <span style={{ fontFamily: DISPLAY, fontSize: 30, color: C.teal, minWidth: 28, textAlign: 'right' }}>{settings.buffer}</span>
          </div>
          <div style={{ marginTop: 12 }}>{bufferControl}</div>
          <div style={{ fontSize: 11.5, color: C.gray, marginTop: 8, lineHeight: 1.5 }}>The client’s rule of thumb is “add 2 to 4” — enough to last through next Thursday morning’s feeding.</div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 10px' }}>
        <SectionLabel style={{ margin: 0 }}>Supplier contacts</SectionLabel>
        <button onClick={saveAllContacts} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 0, cursor: 'pointer', color: C.teal, fontFamily: FONT, fontWeight: 700, fontSize: 13 }}><AppIcon name="userPlus" size={16} color={C.teal} /> Save all</button>
      </div>
      {block(
        <div style={rowStyle}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>Supplier name</span>
          <input value={settings.supplierName} onChange={(e) => mutate(s => { s.settings.supplierName = e.target.value; })} style={{ ...inputStyle, flex: 1 }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 11 }}>
        {(settings.contacts || []).map(c => {
          const cap = c.canCall && c.canText ? 'Call or text' : (c.canCall ? 'Call only' : 'Text only');
          const capTone = c.canCall && c.canText ? 'teal' : (c.canCall ? 'neutral' : 'sent');
          const has = !!(c.phone && c.phone.trim());
          return (
            <div key={c.id} style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', padding: '13px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <input value={c.name} onChange={(e) => setContact(c.id, 'name', e.target.value)} style={{ flex: 1, border: 0, borderBottom: `1.5px solid ${C.whisperP}`, padding: '4px 0', fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: C.ink, minWidth: 0 }} />
                <Chip tone={capTone}>{cap}</Chip>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.gray, marginBottom: 6 }}>{c.role}</div>
              <input value={c.phone} onChange={(e) => setContact(c.id, 'phone', e.target.value)} placeholder={c.id === 'amy' ? 'Add Amy’s cell number' : 'Phone number'} inputMode="tel"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${C.warm}`, fontFamily: FONT, fontSize: 15, color: C.ink }} />
              <div style={{ display: 'flex', gap: 9, marginTop: 10 }}>
                {c.canCall && <a href={has ? telHref(c.phone) : undefined} onClick={(e) => { if (!has) { e.preventDefault(); toast('Add a number first'); } else { toast('Opening dialer…'); } }} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 9, textDecoration: 'none', border: `1.5px solid ${C.warm}`, background: C.white, color: C.purple, fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: has ? 1 : 0.5 }}><AppIcon name="phone" size={15} color={C.purple} stroke={2.2} /> Call</a>}
                {c.canText && <a href={has ? smsHref(c.phone) : undefined} onClick={(e) => { if (!has) { e.preventDefault(); toast('Add a number first'); } else { toast('Opening Messages…'); } }} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 9, textDecoration: 'none', border: 0, background: C.teal, color: C.off, fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: has ? 1 : 0.5 }}><AppIcon name="send" size={15} color={C.off} stroke={2.2} /> Text</a>}
                <button onClick={() => { if (!has) { toast('Add a number first'); return; } downloadVCard(c, settings.supplierName); toast('Saved to contacts'); }} title="Save to phone contacts" style={{ background: C.whisperP, border: 0, borderRadius: 9, width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: has ? 1 : 0.5 }}><AppIcon name="userPlus" size={17} color={C.purple} /></button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: C.gray, margin: '8px 4px 0', lineHeight: 1.5 }}>Numbers stay on this device. Call/Text just open your phone’s app pre-filled — you still tap to dial or send. The weekly order always texts the <b style={{ color: C.ink }}>order line</b>.</div>

      <SectionLabel style={{ margin: '22px 0 10px' }}>Supplier links</SectionLabel>
      {block((settings.links || []).map((l, i) => (
        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderBottom: i < settings.links.length - 1 ? '1px solid rgba(44,26,62,0.06)' : 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: C.whisperP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AppIcon name={l.icon || 'globe'} size={18} color={C.purple} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14.5, color: C.ink }}>{l.label}</div>
            <input value={l.url} onChange={(e) => setLink(l.id, e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: 0, padding: '2px 0 0', fontFamily: FONT, fontSize: 12, color: C.gray, background: 'transparent' }} />
          </div>
          <a href={l.url || undefined} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!l.url) { e.preventDefault(); toast('Add a URL first'); } }} style={{ background: C.teal, color: C.off, borderRadius: 9, height: 36, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}><AppIcon name="external" size={15} color={C.off} stroke={2.2} /> Open</a>
        </div>
      )))}

      <SectionLabel style={{ margin: '22px 0 10px' }}>Rice Bran Oil</SectionLabel>
      {block(
        <div style={rowStyle}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>Default billing</span>
          <Segmented value={settings.oilDefaultAccount} onChange={(v) => mutate(s => { s.settings.oilDefaultAccount = v; })} options={[{ value: 'mane', label: 'Mane Char.' }, { value: 'maple', label: 'Maplehurst' }]} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 10px' }}>
        <SectionLabel style={{ margin: 0 }}>Active feeds &amp; order</SectionLabel>
        <button onClick={() => { setDraft({ code: '', name: '' }); setFeedSheet('new'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 0, cursor: 'pointer', color: C.teal, fontFamily: FONT, fontWeight: 700, fontSize: 13 }}><AppIcon name="plusCircle" size={16} color={C.teal} /> Add feed</button>
      </div>
      {block(active.length === 0
        ? <div style={{ padding: '16px', fontSize: 13.5, color: C.gray, fontFamily: FONT, textAlign: 'center' }}>No active feeds. Add one to start ordering.</div>
        : active.map((f, i) => (
        <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderBottom: i < active.length - 1 ? '1px solid rgba(44,26,62,0.06)' : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <button onClick={() => move(f.code, -1)} disabled={i === 0} style={{ background: 'none', border: 0, cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.25 : 1, padding: 0, lineHeight: 0 }}><AppIcon name="chevDown" size={16} color={C.purpleLight} style={{ transform: 'rotate(180deg)' }} /></button>
            <button onClick={() => move(f.code, 1)} disabled={i === active.length - 1} style={{ background: 'none', border: 0, cursor: i === active.length - 1 ? 'default' : 'pointer', opacity: i === active.length - 1 ? 0.25 : 1, padding: 0, lineHeight: 0 }}><AppIcon name="chevDown" size={16} color={C.purpleLight} /></button>
          </div>
          <span style={{ flex: 1, fontFamily: FONT, fontSize: 15, color: C.ink, fontWeight: 500 }}>{f.name}</span>
          <button onClick={() => { setDraft({ code: f.code, name: f.name }); setFeedSheet(f.code); }} style={{ background: C.whisperP, border: 0, borderRadius: 8, height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: C.purple, fontFamily: FONT, fontWeight: 700, fontSize: 12 }}><AppIcon name="edit" size={14} color={C.purple} /> Manage</button>
        </div>
      )))}
      <div style={{ fontSize: 11.5, color: C.gray, margin: '8px 4px 0', lineHeight: 1.5 }}>Order here sets the order in the text message. “Cubes” stays in every name. Removing a feed <b style={{ color: C.ink }}>archives</b> it — its past orders are always kept.</div>

      {archived.length > 0 && (<>
        <SectionLabel style={{ margin: '22px 0 10px' }}>Archived feeds</SectionLabel>
        {block(archived.map((f, i) => (
          <div key={f.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderBottom: i < archived.length - 1 ? '1px solid rgba(44,26,62,0.06)' : 0, opacity: 0.85 }}>
            <AppIcon name="archive" size={17} color={C.purpleLight} />
            <span style={{ flex: 1, fontFamily: FONT, fontSize: 15, color: C.gray, fontWeight: 500 }}>{f.name}</span>
            <button onClick={() => reactivateFeed(f.code)} style={{ background: C.whisperT, border: 0, borderRadius: 8, height: 32, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: C.teal, fontFamily: FONT, fontWeight: 700, fontSize: 12 }}><AppIcon name="refresh" size={14} color={C.teal} /> Reactivate</button>
            <button onClick={() => { setDraft({ code: f.code, name: f.name }); setFeedSheet(f.code); }} style={{ background: C.whisperP, border: 0, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><AppIcon name="chev" size={15} color={C.purpleLight} /></button>
          </div>
        )))}
        <div style={{ fontSize: 11.5, color: C.gray, margin: '8px 4px 0', lineHeight: 1.5 }}>Archived feeds stay out of new orders but remain in every past week and export.</div>
      </>)}

      <Sheet open={!!feedSheet} title={feedSheet === 'new' ? 'Add a feed' : (editing && editing.active === false ? 'Archived feed' : 'Manage feed')} onClose={() => setFeedSheet(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feed name (exactly as it appears in messages)</label>
            <input value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Senior Balancer cubes"
              style={{ width: '100%', boxSizing: 'border-box', marginTop: 6, padding: '12px 13px', borderRadius: 10, border: `1.5px solid ${C.warm}`, fontFamily: FONT, fontSize: 16, color: C.ink }} />
            <div style={{ fontSize: 11.5, color: C.gray, marginTop: 6, lineHeight: 1.5 }}>Include the word “cubes”. {feedSheet !== 'new' ? 'Renaming applies to future orders; past orders keep what was actually sent.' : 'It joins this week’s order going forward — past weeks are untouched.'}</div>
          </div>
          <AppButton variant="primary" full icon="check" onClick={saveFeed} disabled={!draft.name.trim()}>{feedSheet === 'new' ? 'Add feed' : 'Save changes'}</AppButton>

          {editing && editing.active !== false && (
            <button onClick={() => archiveFeed(editing.code)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: `1.5px solid ${C.warm}`, background: 'transparent', color: C.purple, fontFamily: FONT, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AppIcon name="archive" size={16} color={C.purple} /> Archive (stop ordering, keep history)</button>
          )}
          {editing && editing.active === false && (
            <div style={{ marginTop: 4, paddingTop: 14, borderTop: `1px solid ${C.warm}` }}>
              <SectionLabel style={{ color: C.alert }}>Delete permanently</SectionLabel>
              <p style={{ fontSize: 12.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, margin: '0 0 11px' }}>This erases <b style={{ color: C.ink }}>{editing.name}</b> from every past week and export too — it can’t be undone. Reactivate instead if you might use it again. <b style={{ color: C.ink }}>Press and hold</b> to confirm.</p>
              <HoldButton icon="trash" onConfirm={() => deleteFeedForever(editing.code)}>Hold to delete forever</HoldButton>
            </div>
          )}
        </div>
      </Sheet>
    </div>
  );
}

Object.assign(window, { WeekDetail, HistoryScreen, BackupScreen, SettingsScreen, downloadText });
