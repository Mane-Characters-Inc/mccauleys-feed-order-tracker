/* =====================================================================
   Feed Order Tracker — data layer
   Feeds, calculation logic, message composition, seed data, storage.
   All pure helpers + seed; exported to window for the screen scripts.
   ===================================================================== */

const STORAGE_KEY = 'mc_feed_tracker_v4';

/* ---- default feed list (order = message order) -------------------- */
/* Each feed is a registry entry. `active:false` = archived: it drops off the
   active worksheet and future orders, but every past week that referenced it
   keeps its record. Names are always resolvable from here (active or archived). */
const DEFAULT_FEEDS = [
  { code: 'tb', name: 'Top Breeder cubes',  active: true },
  { code: 'o',  name: 'Original 14 cubes',  active: true },
  { code: 'm',  name: 'M10 Balancer cubes', active: true },
  { code: 'a',  name: 'Alam cubes',          active: true },
];

/* Supplier contacts. Each has its own allowed actions:
   - orderText: TEXT only (this is where the weekly order is sent)
   - office:    CALL only
   - amy:       CALL or TEXT (nutritionist)
   Numbers are NOT hardcoded into logic — they live here and are editable in
   Settings for privacy. Office/text default to McCauley's real numbers. */
const DEFAULT_CONTACTS = [
  { id: 'orderText', name: "McCauley's Feed — Orders", role: 'Order text line', phone: '(859) 537-2418', canCall: false, canText: true },
  { id: 'office',    name: "McCauley's Feed — Office", role: 'Office',          phone: '(859) 873-3333', canCall: true,  canText: false },
  { id: 'amy',       name: 'Amy Parker',               role: 'Nutritionist, McCauley\u2019s', phone: '', canCall: true, canText: true },
];

const DEFAULT_SETTINGS = {
  buffer: 2,
  supplierName: "McCauley's Feed",
  contacts: DEFAULT_CONTACTS.map(c => ({ ...c })),
  oilDefaultAccount: 'mane',          // 'mane' | 'maple'
  feeds: DEFAULT_FEEDS.map(f => ({ ...f })),
};

// the contact the weekly order is texted to
function orderContact(settings) {
  return (settings.contacts || []).find(c => c.id === 'orderText') || (settings.contacts || [])[0] || { name: settings.supplierName, phone: '', canText: true };
}

const ACCOUNT_LABEL = { mane: 'Mane Characters', maple: 'Maplehurst' };

/* ---- feed registry helpers ---------------------------------------- */
// Feeds currently in use, in message order.
function activeFeeds(settings) { return settings.feeds.filter(f => f.active !== false); }
// Feeds (active OR archived) that actually have a record in THIS week, in
// registry order. This is what composes a week's message / renders its grid,
// so an archived feed still shows in the weeks it was ordered.
function weekFeedList(week, settings) { return settings.feeds.filter(f => week.feeds[f.code] !== undefined); }
function feedMeta(settings, code) { return settings.feeds.find(f => f.code === code) || { code, name: code, active: false }; }
// Display label for tight spots (grid headers, history chips): drop trailing "cubes".
function shortLabel(name) { return ((name || '').replace(/\s*cubes\s*$/i, '').trim()) || (name || ''); }
// Internal id for a new feed, derived from its name (the old tb/o/a/m codes are
// retired — ids are never shown to the user, they just key the records).
function slugifyFeed(name, existingFeeds) {
  let base = (name || 'feed').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'feed';
  let id = base, n = 2;
  while (existingFeeds.some(f => f.code === id)) { id = base + '-' + n; n++; }
  return id;
}

// Supplier web links (shown in-app; editable in Settings).
const DEFAULT_LINKS = [
  { id: 'web', label: 'Website', url: 'https://www.mccauleysfeeds.com/', icon: 'globe' },
  { id: 'fb',  label: 'Facebook', url: 'https://www.facebook.com/mccauleysfeeds/', icon: 'facebook' },
];

/* ---- number → words (lowercase, hyphenated above twenty) ---------- */
const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numToWords(n) {
  n = Math.abs(Math.round(n));
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10), r = n % 10;
    return r === 0 ? TENS[t] : `${TENS[t]}-${ONES[r]}`;
  }
  return String(n); // beyond expected range
}

/* ---- calculation logic (spec §5) ---------------------------------- */
function roundUpEven(x) {
  if (x <= 0) return 0;
  const c = Math.ceil(x);
  return c % 2 === 0 ? c : c + 1;
}
// used = had + ordered − have
function calcUsed(cell) {
  if (cell.have === null || cell.have === undefined) return null;
  return cell.had + cell.ordered - cell.have;
}
// deficit = used − have + buffer ; suggested = max(roundUpEven(deficit), 0)
function calcSuggested(cell, buffer) {
  const used = calcUsed(cell);
  if (used === null) return null;
  return Math.max(roundUpEven(used - cell.have + buffer), 0);
}
function isOdd(n) { return typeof n === 'number' && Math.abs(n % 2) === 1; }

/* ---- effective order quantity ------------------------------------- */
// If the cell is overridden, use its stored orderSent; otherwise track suggestion.
function orderQty(cell, buffer) {
  if (cell.overridden) return cell.orderSent ?? 0;
  const s = calcSuggested(cell, buffer);
  return s === null ? (cell.orderSent ?? 0) : s;
}

/* ---- message composition (spec §7) -------------------------------- */
function joinList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
function composeMessage(week, settings) {
  const items = [];
  weekFeedList(week, settings).forEach(f => {
    const cell = week.feeds[f.code];
    if (!cell) return;
    const q = orderQty(cell, settings.buffer);
    if (q > 0) items.push(`${numToWords(q)} ${q === 1 ? 'bag' : 'bags'} of ${f.name}`);
  });
  const paras = [];
  paras.push(`Can we please get ${joinList(items)}? Please split the order and bill half to Maplehurst and half to Mane Characters.`);
  if (week.oil && week.oil.on) {
    paras.push(`Also, one gallon of Rice Bran Oil billed to ${ACCOUNT_LABEL[week.oil.account] || 'Mane Characters'}.`);
  }
  paras.push('Thank you!');
  return paras.join('\n\n');
}

/* ---- date helpers -------------------------------------------------- */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function parseISO(iso) { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); }
function toISO(dt) {
  const y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,'0'), d = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function addDays(iso, n) { const dt = parseISO(iso); dt.setDate(dt.getDate()+n); return toISO(dt); }
function fmtLong(iso) { const dt = parseISO(iso); return `${DOW[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}`; }
function fmtShort(iso) { const dt = parseISO(iso); return `${MONTHS[dt.getMonth()].slice(0,3)} ${dt.getDate()}`; }
function fmtSlash(iso) { const dt = parseISO(iso); return `${dt.getMonth()+1}/${dt.getDate()}/${String(dt.getFullYear()).slice(2)}`; }

/* ---- seed data (spec Appendix A + active week) -------------------- */
function cell(had, ordered, have, orderSent, overridden) {
  return { had, ordered, have, orderSent, overridden: !!overridden };
}
function buildSeed() {
  const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  settings.links = DEFAULT_LINKS.map(l => ({ ...l }));
  const wk = (date, feeds, oil, sent) => ({ id: date, date, feeds, oil: oil || { on:false, account:'mane' }, message: null, messageEdited:false, sent });

  // 5/26 — sent. Actual sent order (Appendix B) = tb6 o8 m2 a2. o/m/a were
  // judgment calls that differ from the raw suggestion, so stored as overrides.
  const w0 = wk('2026-05-26', {
    tb: cell(11,10,9,6,false),
    o:  cell(12,14,13,8,true),
    m:  cell(3,2,2,2,true),
    a:  cell(1,0,0,2,true),
  }, { on:false, account:'mane' }, true);
  w0.message = composeMessage(w0, settings);

  // 6/2 — sent, oil ON (Mane Characters). Actual sent order (Appendix B) =
  // tb8 o6 m2 (a omitted). o bumped from suggested 4 → 6 (judgment override).
  const w1 = wk('2026-06-02', {
    tb: cell(9,6,5,8,false),
    o:  cell(14,8,10,6,true),
    m:  cell(2,2,2,2,false),
    a:  cell(0,2,2,0,false),
  }, { on:true, account:'mane' }, true);
  w1.message = composeMessage(w1, settings);

  // 6/9 — sent. m bumped 2→4, alam dropped 2→0 (manual overrides per spec note)
  const w2 = wk('2026-06-09', {
    tb: cell(5,8,2,12,false),
    o:  cell(10,6,5,8,false),
    m:  cell(2,2,2,4,true),
    a:  cell(2,0,1,0,true),
  }, { on:false, account:'mane' }, true);
  w2.message = composeMessage(w2, settings);

  // 6/16 — ACTIVE (carried from 6/9, today's counts entered, not yet sent)
  const w3 = wk('2026-06-16', {
    tb: cell(2,12,4,null,false),
    o:  cell(5,8,6,null,false),
    m:  cell(2,4,3,null,false),
    a:  cell(1,0,1,null,false),
  }, { on:false, account:'mane' }, false);

  return { settings, weeks: [w0, w1, w2, w3] };
}

/* ---- phone actions + vCard ---------------------------------------- */
function phoneDigits(phone) { return (phone || '').replace(/[^\d+]/g, ''); }
function telHref(phone) { return 'tel:' + phoneDigits(phone); }
function smsHref(phone, body) {
  const d = phoneDigits(phone);
  return body ? `sms:${d}?&body=${encodeURIComponent(body)}` : `sms:${d}`;
}
function vcardFor(contact, org) {
  const parts = (contact.name || '').trim().split(/\s+/);
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const first = parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] || '');
  const type = contact.canText && !contact.canCall ? 'CELL' : (contact.canCall && !contact.canText ? 'WORK,VOICE' : 'CELL');
  return [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:${last};${first};;;`, `FN:${contact.name || ''}`,
    org ? `ORG:${org}` : '',
    contact.role ? `TITLE:${contact.role}` : '',
    contact.phone ? `TEL;TYPE=${type}:${phoneDigits(contact.phone)}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}

/* ---- normalize older/partial saved state -------------------------- */
function normalizeState(state) {
  if (!state || !state.settings || !state.weeks) return buildSeed();
  const s = state;
  // feeds get an active flag
  (s.settings.feeds || []).forEach(f => { if (f.active === undefined) f.active = true; });
  // migrate to contacts model
  if (!Array.isArray(s.settings.contacts)) {
    const legacy = s.settings.supplierPhone;
    s.settings.contacts = DEFAULT_CONTACTS.map(c => ({ ...c }));
    if (legacy) s.settings.contacts[0].phone = legacy;
  }
  if (!Array.isArray(s.settings.links)) s.settings.links = DEFAULT_LINKS.map(l => ({ ...l }));
  return s;
}

/* ---- storage ------------------------------------------------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (e) {}
  return buildSeed();
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}
function resetState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  return buildSeed();
}

/* ---- start a new week (carry-forward, spec §4.3) ------------------ */
function startNewWeek(state) {
  const prev = state.weeks[state.weeks.length - 1];
  const feeds = {};
  activeFeeds(state.settings).forEach(f => {
    const p = prev.feeds[f.code] || cell(0,0,0,0,false);
    feeds[f.code] = cell(p.have ?? 0, orderQty(p, state.settings.buffer), null, null, false);
  });
  const date = addDays(prev.date, 7);
  return { id: date, date, feeds, oil: { on:false, account: state.settings.oilDefaultAccount }, message:null, messageEdited:false, sent:false };
}

/* ---- delete a week (history removal) ------------------------------ */
function deleteWeek(state, id) {
  const s = JSON.parse(JSON.stringify(state));
  s.weeks = s.weeks.filter(w => w.id !== id);
  return s;
}

/* ---- export builders ---------------------------------------------- */
function exportJSON(state) { return JSON.stringify(state, null, 2); }
function exportCSV(state) {
  const rows = [['date','feed_code','feed_name','active','had','ordered','have','used','order_sent','overridden','oil','oil_account','message']];
  state.weeks.forEach(w => {
    weekFeedList(w, state.settings).forEach(f => {
      const c = w.feeds[f.code]; if (!c) return;
      const used = calcUsed(c);
      const q = orderQty(c, state.settings.buffer);
      rows.push([
        fmtSlash(w.date), f.code, f.name, f.active === false ? 'archived' : 'active',
        c.had, c.ordered,
        c.have === null ? '' : c.have, used === null ? '' : used, q,
        c.overridden ? 'yes' : 'no',
        w.oil.on ? 'yes' : 'no', w.oil.on ? ACCOUNT_LABEL[w.oil.account] : '',
        JSON.stringify(w.message || ''),
      ]);
    });
  });
  return rows.map(r => r.join(',')).join('\n');
}

Object.assign(window, {
  STORAGE_KEY, DEFAULT_FEEDS, DEFAULT_SETTINGS, DEFAULT_CONTACTS, DEFAULT_LINKS, ACCOUNT_LABEL,
  activeFeeds, weekFeedList, feedMeta, orderContact, shortLabel, slugifyFeed,
  phoneDigits, telHref, smsHref, vcardFor, normalizeState,
  numToWords, roundUpEven, calcUsed, calcSuggested, isOdd, orderQty,
  joinList, composeMessage,
  parseISO, toISO, addDays, fmtLong, fmtShort, fmtSlash, DOW, MONTHS,
  buildSeed, loadState, saveState, resetState, startNewWeek, deleteWeek,
  exportJSON, exportCSV,
});
