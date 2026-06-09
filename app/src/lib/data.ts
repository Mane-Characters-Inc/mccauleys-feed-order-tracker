/* =====================================================================
   Feed Order Tracker — data layer (TypeScript port of app-data.jsx)
   Feeds, calculation logic, message composition, seed data, storage.
   All pure helpers + seed. Ported VERBATIM from the prototype — same
   STORAGE_KEY and JSON shape (BUILD_SPEC §16). Behavior must not change.
   ===================================================================== */

export const STORAGE_KEY = 'mc_feed_tracker_v4';

/* ---- types --------------------------------------------------------- */
export type Account = 'mane' | 'maple';

export interface FeedCell {
  had: number;
  ordered: number;
  have: number | null;
  orderSent: number | null;
  overridden: boolean;
}

export interface Feed {
  code: string;
  name: string;
  active: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  canCall: boolean;
  canText: boolean;
}

export interface SupplierLink {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export interface Settings {
  buffer: number;
  supplierName: string;
  contacts: Contact[];
  links: SupplierLink[];
  oilDefaultAccount: Account;
  feeds: Feed[];
  /** legacy single-phone field, migrated into contacts on load */
  supplierPhone?: string;
}

export interface Oil {
  on: boolean;
  account: Account;
}

export interface Week {
  id: string;
  date: string; // ISO yyyy-mm-dd
  feeds: Record<string, FeedCell>;
  oil: Oil;
  message: string | null;
  messageEdited: boolean;
  sent: boolean;
}

export interface AppState {
  settings: Settings;
  weeks: Week[];
}

/* ---- default feed list (order = message order) -------------------- */
/* Each feed is a registry entry. `active:false` = archived: it drops off the
   active worksheet and future orders, but every past week that referenced it
   keeps its record. Names are always resolvable from here (active or archived). */
export const DEFAULT_FEEDS: Feed[] = [
  { code: 'tb', name: 'Top Breeder cubes', active: true },
  { code: 'o', name: 'Original 14 cubes', active: true },
  { code: 'm', name: 'M10 Balancer cubes', active: true },
  { code: 'a', name: 'Alam cubes', active: true },
];

/* Supplier contacts. Each has its own allowed actions:
   - orderText:    TEXT only (this is where the weekly order is sent)
   - office:       CALL only
   - nutritionist: CALL or TEXT — name AND number blank by default; the
                   farm fills in their nutritionist's details in Settings.
   Names and numbers are NOT hardcoded into logic — they live here and are
   editable in Settings for privacy. Office/text default to McCauley's real
   numbers; the nutritionist slot ships empty (no name, no number). */
export const DEFAULT_CONTACTS: Contact[] = [
  { id: 'orderText', name: "McCauley's Feed — Orders", role: 'Order text line', phone: '(859) 537-2418', canCall: false, canText: true },
  { id: 'office', name: "McCauley's Feed — Office", role: 'Office', phone: '(859) 873-3333', canCall: true, canText: false },
  { id: 'nutritionist', name: '', role: 'Nutritionist, McCauley’s', phone: '', canCall: true, canText: true },
];

// Supplier web links (shown in-app; editable in Settings).
export const DEFAULT_LINKS: SupplierLink[] = [
  { id: 'web', label: 'Website', url: 'https://www.mccauleysfeeds.com/', icon: 'globe' },
  { id: 'fb', label: 'Facebook', url: 'https://www.facebook.com/mccauleysfeeds/', icon: 'facebook' },
];

export const DEFAULT_SETTINGS: Settings = {
  buffer: 2,
  supplierName: "McCauley's Feed",
  contacts: DEFAULT_CONTACTS.map((c) => ({ ...c })),
  links: DEFAULT_LINKS.map((l) => ({ ...l })),
  oilDefaultAccount: 'mane',
  feeds: DEFAULT_FEEDS.map((f) => ({ ...f })),
};

// the contact the weekly order is texted to
export function orderContact(settings: Settings): Contact {
  return (
    (settings.contacts || []).find((c) => c.id === 'orderText') ||
    (settings.contacts || [])[0] || {
      id: 'orderText',
      name: settings.supplierName,
      role: '',
      phone: '',
      canCall: false,
      canText: true,
    }
  );
}

export const ACCOUNT_LABEL: Record<Account, string> = { mane: 'Mane Characters', maple: 'Maplehurst' };

/* ---- feed registry helpers ---------------------------------------- */
// Feeds currently in use, in message order.
export function activeFeeds(settings: Settings): Feed[] {
  return settings.feeds.filter((f) => f.active !== false);
}
// Feeds (active OR archived) that actually have a record in THIS week, in
// registry order. This is what composes a week's message / renders its grid,
// so an archived feed still shows in the weeks it was ordered.
export function weekFeedList(week: Week, settings: Settings): Feed[] {
  return settings.feeds.filter((f) => week.feeds[f.code] !== undefined);
}
export function feedMeta(settings: Settings, code: string): Feed {
  return settings.feeds.find((f) => f.code === code) || { code, name: code, active: false };
}
// Display label for tight spots (grid headers, history chips): drop trailing "cubes".
export function shortLabel(name: string): string {
  return (name || '').replace(/\s*cubes\s*$/i, '').trim() || (name || '');
}
// Internal id for a new feed, derived from its name (the old tb/o/a/m codes are
// retired — ids are never shown to the user, they just key the records).
export function slugifyFeed(name: string, existingFeeds: Feed[]): string {
  const base = (name || 'feed').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'feed';
  let id = base;
  let n = 2;
  while (existingFeeds.some((f) => f.code === id)) {
    id = base + '-' + n;
    n++;
  }
  return id;
}

/* ---- number → words (lowercase, hyphenated above twenty) ---------- */
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function numToWords(n: number): string {
  n = Math.abs(Math.round(n));
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r === 0 ? TENS[t] : `${TENS[t]}-${ONES[r]}`;
  }
  return String(n); // beyond expected range
}

/* ---- calculation logic (spec §5) ---------------------------------- */
export function roundUpEven(x: number): number {
  if (x <= 0) return 0;
  const c = Math.ceil(x);
  return c % 2 === 0 ? c : c + 1;
}
// used = had + ordered − have
export function calcUsed(cell: FeedCell): number | null {
  if (cell.have === null || cell.have === undefined) return null;
  return cell.had + cell.ordered - cell.have;
}
// deficit = used − have + buffer ; suggested = max(roundUpEven(deficit), 0)
export function calcSuggested(cell: FeedCell, buffer: number): number | null {
  const used = calcUsed(cell);
  if (used === null) return null;
  return Math.max(roundUpEven(used - (cell.have as number) + buffer), 0);
}
export function isOdd(n: number): boolean {
  return typeof n === 'number' && Math.abs(n % 2) === 1;
}

/* ---- effective order quantity ------------------------------------- */
// If the cell is overridden, use its stored orderSent; otherwise track suggestion.
export function orderQty(cell: FeedCell, buffer: number): number {
  if (cell.overridden) return cell.orderSent ?? 0;
  const s = calcSuggested(cell, buffer);
  return s === null ? (cell.orderSent ?? 0) : s;
}

/* ---- message composition (spec §7) -------------------------------- */
export function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
export function composeMessage(week: Week, settings: Settings): string {
  const items: string[] = [];
  weekFeedList(week, settings).forEach((f) => {
    const cell = week.feeds[f.code];
    if (!cell) return;
    const q = orderQty(cell, settings.buffer);
    if (q > 0) items.push(`${numToWords(q)} ${q === 1 ? 'bag' : 'bags'} of ${f.name}`);
  });
  const paras: string[] = [];
  paras.push(`Can we please get ${joinList(items)}? Please split the order and bill half to Maplehurst and half to Mane Characters.`);
  if (week.oil && week.oil.on) {
    paras.push(`Also, one gallon of Rice Bran Oil billed to ${ACCOUNT_LABEL[week.oil.account] || 'Mane Characters'}.`);
  }
  paras.push('Thank you!');
  return paras.join('\n\n');
}

/* ---- date helpers -------------------------------------------------- */
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function toISO(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
export function addDays(iso: string, n: number): string {
  const dt = parseISO(iso);
  dt.setDate(dt.getDate() + n);
  return toISO(dt);
}
export function fmtLong(iso: string): string {
  const dt = parseISO(iso);
  return `${DOW[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
}
export function fmtShort(iso: string): string {
  const dt = parseISO(iso);
  return `${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`;
}
export function fmtSlash(iso: string): string {
  const dt = parseISO(iso);
  return `${dt.getMonth() + 1}/${dt.getDate()}/${String(dt.getFullYear()).slice(2)}`;
}

/* ---- seed data (spec Appendix A + active week) -------------------- */
function cell(had: number, ordered: number, have: number | null, orderSent: number | null, overridden?: boolean): FeedCell {
  return { had, ordered, have, orderSent, overridden: !!overridden };
}
export function buildSeed(): AppState {
  const settings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  settings.links = DEFAULT_LINKS.map((l) => ({ ...l }));
  const wk = (date: string, feeds: Record<string, FeedCell>, oil: Oil | undefined, sent: boolean): Week => ({
    id: date, date, feeds, oil: oil || { on: false, account: 'mane' }, message: null, messageEdited: false, sent,
  });

  // 5/26 — sent. Actual sent order (Appendix B) = tb6 o8 m2 a2. o/m/a were
  // judgment calls that differ from the raw suggestion, so stored as overrides.
  const w0 = wk('2026-05-26', {
    tb: cell(11, 10, 9, 6, false),
    o: cell(12, 14, 13, 8, true),
    m: cell(3, 2, 2, 2, true),
    a: cell(1, 0, 0, 2, true),
  }, { on: false, account: 'mane' }, true);
  w0.message = composeMessage(w0, settings);

  // 6/2 — sent, oil ON (Mane Characters). Actual sent order (Appendix B) =
  // tb8 o6 m2 (a omitted). o bumped from suggested 4 → 6 (judgment override).
  const w1 = wk('2026-06-02', {
    tb: cell(9, 6, 5, 8, false),
    o: cell(14, 8, 10, 6, true),
    m: cell(2, 2, 2, 2, false),
    a: cell(0, 2, 2, 0, false),
  }, { on: true, account: 'mane' }, true);
  w1.message = composeMessage(w1, settings);

  // 6/9 — sent. m bumped 2→4, alam dropped 2→0 (manual overrides per spec note)
  const w2 = wk('2026-06-09', {
    tb: cell(5, 8, 2, 12, false),
    o: cell(10, 6, 5, 8, false),
    m: cell(2, 2, 2, 4, true),
    a: cell(2, 0, 1, 0, true),
  }, { on: false, account: 'mane' }, true);
  w2.message = composeMessage(w2, settings);

  // 6/16 — ACTIVE (carried from 6/9, today's counts entered, not yet sent)
  const w3 = wk('2026-06-16', {
    tb: cell(2, 12, 4, null, false),
    o: cell(5, 8, 6, null, false),
    m: cell(2, 4, 3, null, false),
    a: cell(1, 0, 1, null, false),
  }, { on: false, account: 'mane' }, false);

  return { settings, weeks: [w0, w1, w2, w3] };
}

/* ---- phone actions + vCard ---------------------------------------- */
export function phoneDigits(phone: string): string {
  return (phone || '').replace(/[^\d+]/g, '');
}
export function telHref(phone: string): string {
  return 'tel:' + phoneDigits(phone);
}
export function smsHref(phone: string, body?: string): string {
  const d = phoneDigits(phone);
  return body ? `sms:${d}?&body=${encodeURIComponent(body)}` : `sms:${d}`;
}
export function vcardFor(contact: Contact, org?: string): string {
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
export function normalizeState(state: AppState | null | undefined): AppState {
  if (!state || !state.settings || !state.weeks) return buildSeed();
  const s = state;
  // feeds get an active flag
  (s.settings.feeds || []).forEach((f) => { if (f.active === undefined) f.active = true; });
  // migrate to contacts model
  if (!Array.isArray(s.settings.contacts)) {
    const legacy = s.settings.supplierPhone;
    s.settings.contacts = DEFAULT_CONTACTS.map((c) => ({ ...c }));
    if (legacy) s.settings.contacts[0].phone = legacy;
  }
  if (!Array.isArray(s.settings.links)) s.settings.links = DEFAULT_LINKS.map((l) => ({ ...l }));
  return s;
}

/* ---- storage ------------------------------------------------------- */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch {
    /* ignore — fall through to seed */
  }
  return buildSeed();
}
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — no-op */
  }
}
export function resetState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
  return buildSeed();
}

/* ---- start a new week (carry-forward, spec §4.3) ------------------ */
export function startNewWeek(state: AppState): Week {
  const prev = state.weeks[state.weeks.length - 1];
  const feeds: Record<string, FeedCell> = {};
  activeFeeds(state.settings).forEach((f) => {
    const p = prev.feeds[f.code] || cell(0, 0, 0, 0, false);
    feeds[f.code] = cell(p.have ?? 0, orderQty(p, state.settings.buffer), null, null, false);
  });
  const date = addDays(prev.date, 7);
  return { id: date, date, feeds, oil: { on: false, account: state.settings.oilDefaultAccount }, message: null, messageEdited: false, sent: false };
}

/* ---- delete a week (history removal) ------------------------------ */
export function deleteWeek(state: AppState, id: string): AppState {
  const s: AppState = JSON.parse(JSON.stringify(state));
  s.weeks = s.weeks.filter((w) => w.id !== id);
  return s;
}

/* ---- export builders ---------------------------------------------- */
export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}
export function exportCSV(state: AppState): string {
  const rows: (string | number)[][] = [['date', 'feed_code', 'feed_name', 'active', 'had', 'ordered', 'have', 'used', 'order_sent', 'overridden', 'oil', 'oil_account', 'message']];
  state.weeks.forEach((w) => {
    weekFeedList(w, state.settings).forEach((f) => {
      const c = w.feeds[f.code];
      if (!c) return;
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
  return rows.map((r) => r.join(',')).join('\n');
}
