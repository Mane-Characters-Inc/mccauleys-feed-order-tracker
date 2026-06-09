/* =====================================================================
   TEST-ONLY fixture — the BUILD_SPEC Appendix A historical weeks.
   This is imported ONLY by tests, never by production code, so it is
   tree-shaken out of the shipped app bundle. The production app no longer
   pre-loads any history (see initialState in data.ts); a fresh install
   starts with one empty current week.
   Kept here so the §18 validation table + Appendix B messages stay tested.
   ===================================================================== */
import {
  DEFAULT_SETTINGS, DEFAULT_LINKS, composeMessage,
  type AppState, type Settings, type Week, type FeedCell, type Oil,
} from './data';

function cell(had: number, ordered: number, have: number | null, orderSent: number | null, overridden?: boolean): FeedCell {
  return { had, ordered, have, orderSent, overridden: !!overridden };
}

/** The exact validated seed the prototype shipped (Appendix A + active week). */
export function sampleHistory(): AppState {
  const settings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  settings.links = DEFAULT_LINKS.map((l) => ({ ...l }));
  const wk = (date: string, feeds: Record<string, FeedCell>, oil: Oil | undefined, sent: boolean): Week => ({
    id: date, date, feeds, oil: oil || { on: false, account: 'mane' }, message: null, messageEdited: false, sent,
  });

  const w0 = wk('2026-05-26', {
    tb: cell(11, 10, 9, 6, false),
    o: cell(12, 14, 13, 8, true),
    m: cell(3, 2, 2, 2, true),
    a: cell(1, 0, 0, 2, true),
  }, { on: false, account: 'mane' }, true);
  w0.message = composeMessage(w0, settings);

  const w1 = wk('2026-06-02', {
    tb: cell(9, 6, 5, 8, false),
    o: cell(14, 8, 10, 6, true),
    m: cell(2, 2, 2, 2, false),
    a: cell(0, 2, 2, 0, false),
  }, { on: true, account: 'mane' }, true);
  w1.message = composeMessage(w1, settings);

  const w2 = wk('2026-06-09', {
    tb: cell(5, 8, 2, 12, false),
    o: cell(10, 6, 5, 8, false),
    m: cell(2, 2, 2, 4, true),
    a: cell(2, 0, 1, 0, true),
  }, { on: false, account: 'mane' }, true);
  w2.message = composeMessage(w2, settings);

  const w3 = wk('2026-06-16', {
    tb: cell(2, 12, 4, null, false),
    o: cell(5, 8, 6, null, false),
    m: cell(2, 4, 3, null, false),
    a: cell(1, 0, 1, null, false),
  }, { on: false, account: 'mane' }, false);

  return { settings, weeks: [w0, w1, w2, w3] };
}
