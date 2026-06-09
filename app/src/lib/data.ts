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

/** Physical form of a feed. Mane Characters uses cubes by default, but each
    feed can be set to pellet or textured. The form word is appended to the
    base name in composed messages (BUILD_SPEC §3.2). */
export type FeedForm = 'cubes' | 'pellet' | 'textured';

export interface Feed {
  code: string;
  name: string;        // base name, e.g. "Top Breeder" (no form word)
  active: boolean;
  form: FeedForm;      // cubes | pellet | textured
  url?: string;        // optional manufacturer page / spec-sheet PDF link
}

/** The word appended to a feed's base name in messages/labels. */
export const FORM_WORD: Record<FeedForm, string> = {
  cubes: 'cubes',
  pellet: 'pellets',
  textured: 'textured',
};
export const FORM_OPTIONS: { value: FeedForm; label: string }[] = [
  { value: 'cubes', label: 'Cubes' },
  { value: 'pellet', label: 'Pellets' },
  { value: 'textured', label: 'Textured' },
];
/** Full feed name as it must appear in messages, e.g. "Top Breeder cubes". */
export function feedFullName(feed: { name: string; form?: FeedForm }): string {
  const word = FORM_WORD[feed.form || 'cubes'];
  const base = (feed.name || '').trim();
  return word ? `${base} ${word}` : base;
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

/** Weekly order reminder. weekday uses JS convention: 0=Sun … 2=Tue … 6=Sat.
    time is "HH:MM" 24h. Notifications fire on-device (offline) when enabled. */
export interface Reminder {
  enabled: boolean;
  weekday: number; // 0–6, Sunday = 0
  time: string;    // "HH:MM"
}

export interface Settings {
  buffer: number;
  supplierName: string;
  contacts: Contact[];
  links: SupplierLink[];
  oilDefaultAccount: Account;
  feeds: Feed[];
  reminder: Reminder;
  /** legacy single-phone field, migrated into contacts on load */
  supplierPhone?: string;
}

/** Default weekly reminder — off, Tuesday, 9:00 AM (user-editable). */
export const DEFAULT_REMINDER: Reminder = { enabled: false, weekday: 2, time: '09:00' };

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
  { code: 'tb', name: 'Top Breeder', active: true, form: 'cubes', url: '' },
  { code: 'o', name: 'Original 14', active: true, form: 'cubes', url: '' },
  { code: 'm', name: 'M10 Balancer', active: true, form: 'cubes', url: '' },
  { code: 'a', name: 'Alam', active: true, form: 'cubes', url: '' },
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
  reminder: { ...DEFAULT_REMINDER },
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
  return settings.feeds.find((f) => f.code === code) || { code, name: code, active: false, form: 'cubes' };
}
// Display label for tight spots (grid headers, history chips): the base name,
// without the form word. (Names no longer carry the form word, but strip a
// trailing form word defensively in case of older data.)
export function shortLabel(name: string): string {
  return (name || '').replace(/\s*(cubes|pellets?|textured)\s*$/i, '').trim() || (name || '');
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
    if (q > 0) items.push(`${numToWords(q)} ${q === 1 ? 'bag' : 'bags'} of ${feedFullName(f)}`);
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

/* ---- initial state for a fresh install ----------------------------- */
function cell(had: number, ordered: number, have: number | null, orderSent: number | null, overridden?: boolean): FeedCell {
  return { had, ordered, have, orderSent, overridden: !!overridden };
}
// The next Tuesday on/after `from` (today, if today is Tuesday). Orders go out
// Tuesdays; this is just the editable default for a brand-new week.
export function nextTuesday(from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const add = (2 - d.getDay() + 7) % 7; // 0 if already Tuesday
  d.setDate(d.getDate() + add);
  return toISO(d);
}
// A clean starting state: default settings/feeds + one empty current week.
// No historical data is baked into the app; past orders accrue as the user
// sends them (or are restored from a JSON backup).
export function initialState(): AppState {
  const settings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  settings.links = DEFAULT_LINKS.map((l) => ({ ...l }));
  const feeds: Record<string, FeedCell> = {};
  activeFeeds(settings).forEach((f) => { feeds[f.code] = cell(0, 0, null, null, false); });
  const date = nextTuesday();
  const week: Week = { id: date, date, feeds, oil: { on: false, account: settings.oilDefaultAccount }, message: null, messageEdited: false, sent: false };
  return { settings, weeks: [week] };
}

/* ---- phone actions + vCard ---------------------------------------- */
export function phoneDigits(phone: string): string {
  return (phone || '').replace(/[^\d+]/g, '');
}
/* Progressive US phone formatting for as-you-type entry, e.g.
   8595372418 -> "(859) 537-2418". Leaves foreign/extension numbers
   (anything that isn't a plain <=11-digit US number) untouched so the
   user can still type them. */
export function formatUsPhone(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith('+');
  // Foreign international (not +1) — don't fight the user.
  if (hasPlus && !trimmed.startsWith('+1')) return input;
  let d = trimmed.replace(/\D/g, '');
  let prefix = '';
  if (d.length === 11 && d.startsWith('1')) { prefix = '+1 '; d = d.slice(1); }
  if (d.length > 10) return input; // too long for US format — leave as typed
  if (d.length === 0) return hasPlus ? input : '';
  if (d.length <= 3) return `${prefix}(${d}`;
  if (d.length <= 6) return `${prefix}(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `${prefix}(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
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
  if (!state || !state.settings || !state.weeks) return initialState();
  const s = state;
  // feeds: active flag, and the form/url model. Older feeds stored the form
  // word inside the name (e.g. "Top Breeder cubes"); split it out so the form
  // selector and message composition work, without changing the message text.
  (s.settings.feeds || []).forEach((f) => {
    if (f.active === undefined) f.active = true;
    if (!f.form) {
      const m = (f.name || '').match(/\s*(cubes|pellets?|textured)\s*$/i);
      if (m) {
        const word = m[1].toLowerCase();
        f.form = word.startsWith('pellet') ? 'pellet' : (word === 'textured' ? 'textured' : 'cubes');
        f.name = (f.name || '').replace(/\s*(cubes|pellets?|textured)\s*$/i, '').trim();
      } else {
        f.form = 'cubes';
      }
    }
    if (f.url === undefined) f.url = '';
  });
  // migrate to contacts model
  if (!Array.isArray(s.settings.contacts)) {
    const legacy = s.settings.supplierPhone;
    s.settings.contacts = DEFAULT_CONTACTS.map((c) => ({ ...c }));
    if (legacy) s.settings.contacts[0].phone = legacy;
  }
  if (!Array.isArray(s.settings.links)) s.settings.links = DEFAULT_LINKS.map((l) => ({ ...l }));
  // weekly reminder defaults (off, Tuesday, 09:00)
  if (!s.settings.reminder) s.settings.reminder = { ...DEFAULT_REMINDER };
  return s;
}

/* ---- storage ------------------------------------------------------- */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch {
    /* ignore — fall through to a clean start */
  }
  return initialState();
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
  return initialState();
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
  const rows: (string | number)[][] = [['date', 'feed_code', 'feed_name', 'feed_form', 'feed_url', 'active', 'had', 'ordered', 'have', 'used', 'order_sent', 'overridden', 'oil', 'oil_account', 'message']];
  state.weeks.forEach((w) => {
    weekFeedList(w, state.settings).forEach((f) => {
      const c = w.feeds[f.code];
      if (!c) return;
      const used = calcUsed(c);
      const q = orderQty(c, state.settings.buffer);
      rows.push([
        fmtSlash(w.date), f.code, feedFullName(f), f.form || 'cubes', f.url || '', f.active === false ? 'archived' : 'active',
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
