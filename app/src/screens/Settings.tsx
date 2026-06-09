/* Settings — buffer, contacts, links, oil, feeds, display prefs.
   Ported from app-screens-more.jsx; Tweaks-panel options moved here. */
import { useState, type CSSProperties, type ReactNode } from 'react';
import { C, FONT, DISPLAY } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { SectionLabel, Segmented, AppButton, Sheet, Toggle, HoldButton } from '../ui/primitives';
import {
  activeFeeds, slugifyFeed, telHref, smsHref,
  saveState, type AppState, type Account, type FeedCell,
} from '../lib/data';
import { downloadVCard, openLink } from '../lib/platform';

const emptyCell = (): FeedCell => ({ had: 0, ordered: 0, have: null, orderSent: null, overridden: false });

export function SettingsScreen({
  state, setState, toast, bufferControl, layout, setLayout, oilReminder, setOilReminder,
}: {
  state: AppState; setState: (s: AppState) => void; toast: (m: string) => void; bufferControl: ReactNode;
  layout: 'cards' | 'grid'; setLayout: (v: 'cards' | 'grid') => void;
  oilReminder: boolean; setOilReminder: (v: boolean) => void;
}) {
  const { settings } = state;
  const [feedSheet, setFeedSheet] = useState<string | null>(null); // code | 'new'
  const [draft, setDraft] = useState<{ code: string; name: string }>({ code: '', name: '' });
  const mutate = (fn: (s: AppState) => void) => { const s: AppState = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };

  const active = activeFeeds(settings);
  const archived = settings.feeds.filter((f) => f.active === false);

  // reorder among active feeds (this is the message order)
  const move = (code: string, dir: number) => mutate((s) => {
    const arr = s.settings.feeds;
    const act = arr.filter((f) => f.active !== false);
    const ai = act.findIndex((f) => f.code === code);
    const aj = ai + dir;
    if (aj < 0 || aj >= act.length) return;
    const i = arr.indexOf(act[ai]);
    const j = arr.indexOf(act[aj]);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  });
  // archive = stop using, KEEP all history. Drops the feed from the current
  // (not-yet-sent) week only; past weeks are untouched.
  const archiveFeed = (code: string) => { mutate((s) => {
    const f = s.settings.feeds.find((x) => x.code === code); if (f) f.active = false;
    const last = s.weeks[s.weeks.length - 1];
    if (last && !last.sent && last.feeds[code]) delete last.feeds[code];
  }); setFeedSheet(null); toast('Feed archived'); };
  const reactivateFeed = (code: string) => { mutate((s) => {
    const f = s.settings.feeds.find((x) => x.code === code); if (f) f.active = true;
    const last = s.weeks[s.weeks.length - 1];
    if (last && !last.sent && !last.feeds[code]) last.feeds[code] = emptyCell();
  }); setFeedSheet(null); toast('Feed reactivated'); };
  // permanent delete = remove the feed AND its records from every week. Guarded.
  const deleteFeedForever = (code: string) => { mutate((s) => {
    s.settings.feeds = s.settings.feeds.filter((f) => f.code !== code);
    s.weeks.forEach((w) => { delete w.feeds[code]; });
  }); setFeedSheet(null); toast('Feed deleted permanently'); };
  const saveFeed = () => {
    const name = draft.name.trim();
    if (!name) return;
    mutate((s) => {
      if (feedSheet !== 'new') {
        const ex = s.settings.feeds.find((f) => f.code === feedSheet);
        if (ex) { ex.name = name; ex.active = true; }
      } else {
        const code = slugifyFeed(name, s.settings.feeds);
        s.settings.feeds.push({ code, name, active: true });
        // add only to the current (not-yet-sent) week — never backfill history
        const last = s.weeks[s.weeks.length - 1];
        if (last && !last.sent) last.feeds[code] = emptyCell();
      }
    });
    setFeedSheet(null);
    toast('Feed saved');
  };
  const editing = feedSheet && feedSheet !== 'new' ? settings.feeds.find((f) => f.code === feedSheet) : null;

  // contacts + supplier links
  const setContact = (id: string, field: 'name' | 'phone', v: string) => mutate((s) => { const c = (s.settings.contacts || []).find((x) => x.id === id); if (c) c[field] = v; });
  const saveAllContacts = () => { const list = (settings.contacts || []).filter((c) => c.phone && c.phone.trim()); if (!list.length) { toast('Add a number first'); return; } list.forEach((c) => downloadVCard(c, settings.supplierName)); toast('Saved to contacts'); };
  const setLink = (id: string, v: string) => mutate((s) => { const l = (s.settings.links || []).find((x) => x.id === id); if (l) l.url = v; });

  const block = (children: ReactNode) => <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', overflow: 'hidden' }}>{children}</div>;
  const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', gap: 12 };
  const inputStyle: CSSProperties = { padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${C.warm}`, fontFamily: FONT, fontSize: 15, color: C.ink, textAlign: 'right', minWidth: 0 };

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

      <SectionLabel style={{ margin: '22px 0 10px' }}>Worksheet display</SectionLabel>
      {block(<>
        <div style={rowStyle}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>Layout</span>
          <Segmented<'cards' | 'grid'> value={layout} onChange={setLayout} options={[{ value: 'cards', label: 'Cards' }, { value: 'grid', label: 'Spreadsheet' }]} />
        </div>
        <div style={{ ...rowStyle, borderTop: '1px solid rgba(44,26,62,0.06)' }}>
          <div><div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>Low-oil reminder</div><div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>Gentle nudge ~8 weeks after the last oil order</div></div>
          <Toggle on={oilReminder} onChange={setOilReminder} />
        </div>
      </>)}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 10px' }}>
        <SectionLabel style={{ margin: 0 }}>Supplier contacts</SectionLabel>
        <button onClick={saveAllContacts} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 0, cursor: 'pointer', color: C.teal, fontFamily: FONT, fontWeight: 700, fontSize: 13 }}><AppIcon name="userPlus" size={16} color={C.teal} /> Save all</button>
      </div>
      {block(
        <div style={rowStyle}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>Supplier name</span>
          <input value={settings.supplierName} onChange={(e) => mutate((s) => { s.settings.supplierName = e.target.value; })} style={{ ...inputStyle, flex: 1 }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 11 }}>
        {(settings.contacts || []).map((c) => {
          const cap = c.canCall && c.canText ? 'Call or text' : (c.canCall ? 'Call only' : 'Text only');
          const has = !!(c.phone && c.phone.trim());
          return (
            <div key={c.id} style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', padding: '13px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <input value={c.name} onChange={(e) => setContact(c.id, 'name', e.target.value)} placeholder={c.role || 'Contact name'} style={{ flex: 1, border: 0, borderBottom: `1.5px solid ${C.whisperP}`, padding: '4px 0', fontFamily: FONT, fontSize: 15.5, fontWeight: 600, color: C.ink, minWidth: 0 }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.whisperP, color: C.purple, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em' }}>{cap}</span>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.gray, marginBottom: 6 }}>{c.role}</div>
              <input value={c.phone} onChange={(e) => setContact(c.id, 'phone', e.target.value)} placeholder={c.name && c.name.trim() ? 'Phone number' : 'Add a cell number'} inputMode="tel"
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
          <button onClick={() => { if (!l.url) { toast('Add a URL first'); return; } openLink(l.url); }} style={{ background: C.teal, color: C.off, border: 0, borderRadius: 9, height: 36, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}><AppIcon name="external" size={15} color={C.off} stroke={2.2} /> Open</button>
        </div>
      )))}

      <SectionLabel style={{ margin: '22px 0 10px' }}>Rice Bran Oil</SectionLabel>
      {block(
        <div style={rowStyle}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink }}>Default billing</span>
          <Segmented<Account> value={settings.oilDefaultAccount} onChange={(v) => mutate((s) => { s.settings.oilDefaultAccount = v; })} options={[{ value: 'mane', label: 'Mane Char.' }, { value: 'maple', label: 'Maplehurst' }]} />
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
              <button onClick={() => move(f.code, -1)} disabled={i === 0} aria-label="Move up" style={{ background: 'none', border: 0, cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.25 : 1, padding: 0, lineHeight: 0 }}><AppIcon name="chevDown" size={16} color={C.purpleLight} style={{ transform: 'rotate(180deg)' }} /></button>
              <button onClick={() => move(f.code, 1)} disabled={i === active.length - 1} aria-label="Move down" style={{ background: 'none', border: 0, cursor: i === active.length - 1 ? 'default' : 'pointer', opacity: i === active.length - 1 ? 0.25 : 1, padding: 0, lineHeight: 0 }}><AppIcon name="chevDown" size={16} color={C.purpleLight} /></button>
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
            <button onClick={() => { setDraft({ code: f.code, name: f.name }); setFeedSheet(f.code); }} aria-label="Manage feed" style={{ background: C.whisperP, border: 0, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><AppIcon name="chev" size={15} color={C.purpleLight} /></button>
          </div>
        )))}
        <div style={{ fontSize: 11.5, color: C.gray, margin: '8px 4px 0', lineHeight: 1.5 }}>Archived feeds stay out of new orders but remain in every past week and export.</div>
      </>)}

      <Sheet open={!!feedSheet} title={feedSheet === 'new' ? 'Add a feed' : (editing && editing.active === false ? 'Archived feed' : 'Manage feed')} onClose={() => setFeedSheet(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.gray, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feed name (exactly as it appears in messages)</label>
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Senior Balancer cubes"
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
