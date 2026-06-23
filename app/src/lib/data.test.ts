/* =====================================================================
   Validation harness — BUILD_SPEC §18.
   The port must reproduce every derived value and the exact Appendix B
   messages BEFORE any UI is built. Buffer = 2.
   ===================================================================== */
import { describe, it, expect } from 'vitest';
import {
  calcUsed, calcSuggested, orderQty, composeMessage,
  numToWords, roundUpEven, joinList, startNewWeek, isOdd, formatUsPhone,
  feedFullName, initialState, nextTuesday, syncCarriedForward,
  type AppState, type Week,
} from './data';
import { sampleHistory } from './sampleHistory.fixture';

const state: AppState = sampleHistory();
const buffer = state.settings.buffer;
const wk = (date: string): Week => state.weeks.find((w) => w.date === date)!;

/* §18 validation table — had/ordered/have/used/suggested/order-sent per feed. */
const TABLE: Record<string, Record<string, { had: number; ordered: number; have: number | null; used: number | null; suggested: number | null; sent: number }>> = {
  '2026-05-26': {
    tb: { had: 11, ordered: 10, have: 9, used: 12, suggested: 6, sent: 6 },
    o: { had: 12, ordered: 14, have: 13, used: 13, suggested: 2, sent: 8 },
    m: { had: 3, ordered: 2, have: 2, used: 3, suggested: 4, sent: 2 },
    a: { had: 1, ordered: 0, have: 0, used: 1, suggested: 4, sent: 2 },
  },
  '2026-06-02': {
    tb: { had: 9, ordered: 6, have: 5, used: 10, suggested: 8, sent: 8 },
    o: { had: 14, ordered: 8, have: 10, used: 12, suggested: 4, sent: 6 },
    m: { had: 2, ordered: 2, have: 2, used: 2, suggested: 2, sent: 2 },
    a: { had: 0, ordered: 2, have: 2, used: 0, suggested: 0, sent: 0 },
  },
  '2026-06-09': {
    tb: { had: 5, ordered: 8, have: 2, used: 11, suggested: 12, sent: 12 },
    o: { had: 10, ordered: 6, have: 5, used: 11, suggested: 8, sent: 8 },
    m: { had: 2, ordered: 2, have: 2, used: 2, suggested: 2, sent: 4 },
    a: { had: 2, ordered: 0, have: 1, used: 1, suggested: 2, sent: 0 },
  },
  '2026-06-16': {
    tb: { had: 2, ordered: 12, have: 4, used: 10, suggested: 8, sent: 8 },
    o: { had: 5, ordered: 8, have: 6, used: 7, suggested: 4, sent: 4 },
    m: { had: 2, ordered: 4, have: 3, used: 3, suggested: 2, sent: 2 },
    a: { had: 1, ordered: 0, have: 1, used: 0, suggested: 2, sent: 2 },
  },
};

describe('§18 validation table — derived values reproduce exactly', () => {
  for (const [date, feeds] of Object.entries(TABLE)) {
    for (const [code, exp] of Object.entries(feeds)) {
      it(`${date} ${code}: had/ordered/have/used/suggested/order`, () => {
        const c = wk(date).feeds[code];
        expect(c.had).toBe(exp.had);
        expect(c.ordered).toBe(exp.ordered);
        expect(c.have).toBe(exp.have);
        expect(calcUsed(c)).toBe(exp.used);
        expect(calcSuggested(c, buffer)).toBe(exp.suggested);
        expect(orderQty(c, buffer)).toBe(exp.sent);
      });
    }
  }
});

describe('Appendix B — composed messages match the supplier format exactly', () => {
  it('5/26', () => {
    expect(composeMessage(wk('2026-05-26'), state.settings)).toBe(
      'Can we please get six bags of Top Breeder cubes, eight bags of Original 14 cubes, two bags of M10 Balancer cubes, and two bags of Alam cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.\n\nThank you!'
    );
  });

  it('6/2 (with Rice Bran Oil → Mane Characters)', () => {
    expect(composeMessage(wk('2026-06-02'), state.settings)).toBe(
      'Can we please get eight bags of Top Breeder cubes, six bags of Original 14 cubes, and two bags of M10 Balancer cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.\n\nAlso, one gallon of Rice Bran Oil billed to Mane Characters.\n\nThank you!'
    );
  });

  it('6/9', () => {
    expect(composeMessage(wk('2026-06-09'), state.settings)).toBe(
      'Can we please get twelve bags of Top Breeder cubes, eight bags of Original 14 cubes, and four bags of M10 Balancer cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.\n\nThank you!'
    );
  });

  it('6/16 live (not yet sent)', () => {
    expect(composeMessage(wk('2026-06-16'), state.settings)).toBe(
      'Can we please get eight bags of Top Breeder cubes, four bags of Original 14 cubes, two bags of M10 Balancer cubes, and two bags of Alam cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.\n\nThank you!'
    );
  });
});

describe('§10 carry-forward — first new week after 6/9 matches seed of 6/16', () => {
  it('had ← prev have, ordered ← prev order qty', () => {
    // Build a fresh state that ends at 6/9 (drop the seeded 6/16) and carry forward.
    const upTo69: AppState = { settings: state.settings, weeks: state.weeks.slice(0, 3) };
    const next = startNewWeek(upTo69);
    expect(next.date).toBe('2026-06-16');
    expect(next.feeds.tb.had).toBe(2);
    expect(next.feeds.tb.ordered).toBe(12);
    expect(next.feeds.o.had).toBe(5);
    expect(next.feeds.o.ordered).toBe(8);
    expect(next.feeds.m.had).toBe(2);
    expect(next.feeds.m.ordered).toBe(4);
    expect(next.feeds.a.had).toBe(1);
    expect(next.feeds.a.ordered).toBe(0);
    // have resets to null, override cleared
    expect(next.feeds.tb.have).toBeNull();
    expect(next.feeds.m.overridden).toBe(false);
  });
});

describe('§5 / §7 unit behaviors', () => {
  it('roundUpEven rounds up to nearest even, floors at 0', () => {
    expect(roundUpEven(-3)).toBe(0);
    expect(roundUpEven(0)).toBe(0);
    expect(roundUpEven(1)).toBe(2);
    expect(roundUpEven(2)).toBe(2);
    expect(roundUpEven(2.1)).toBe(4);
    expect(roundUpEven(5)).toBe(6);
  });

  it('numToWords: lowercase, hyphenated above twenty', () => {
    expect(numToWords(1)).toBe('one');
    expect(numToWords(12)).toBe('twelve');
    expect(numToWords(20)).toBe('twenty');
    expect(numToWords(22)).toBe('twenty-two');
  });

  it('joinList: Oxford comma rules', () => {
    expect(joinList(['a'])).toBe('a');
    expect(joinList(['a', 'b'])).toBe('a and b');
    expect(joinList(['a', 'b', 'c'])).toBe('a, b, and c');
  });

  it('isOdd flags odd order quantities', () => {
    expect(isOdd(3)).toBe(true);
    expect(isOdd(4)).toBe(false);
  });

  it('singular "bag" for a quantity of one', () => {
    const w: Week = {
      id: 'x', date: '2026-06-23',
      feeds: { tb: { had: 0, ordered: 0, have: 0, orderSent: 1, overridden: true } },
      oil: { on: false, account: 'mane' }, message: null, messageEdited: false, sent: false,
    };
    expect(composeMessage(w, state.settings)).toContain('one bag of Top Breeder cubes');
  });

  it('formatUsPhone formats progressively and matches the seeded format', () => {
    expect(formatUsPhone('')).toBe('');
    expect(formatUsPhone('8')).toBe('(8');
    expect(formatUsPhone('859')).toBe('(859');
    expect(formatUsPhone('859537')).toBe('(859) 537');
    expect(formatUsPhone('8595372418')).toBe('(859) 537-2418');
    // already-formatted input is stable (idempotent)
    expect(formatUsPhone('(859) 537-2418')).toBe('(859) 537-2418');
    // leading US country code
    expect(formatUsPhone('18595372418')).toBe('+1 (859) 537-2418');
    // foreign / extension input is left untouched
    expect(formatUsPhone('+44 20 7946 0958')).toBe('+44 20 7946 0958');
  });

  it('feeds with order quantity 0 are omitted from the message', () => {
    const w: Week = {
      id: 'x', date: '2026-06-23',
      feeds: {
        tb: { had: 0, ordered: 0, have: 0, orderSent: 2, overridden: true },
        o: { had: 0, ordered: 0, have: 0, orderSent: 0, overridden: true },
      },
      oil: { on: false, account: 'mane' }, message: null, messageEdited: false, sent: false,
    };
    const msg = composeMessage(w, state.settings);
    expect(msg).toContain('Top Breeder cubes');
    expect(msg).not.toContain('Original 14');
  });
});

describe('feed model — base name + form word', () => {
  it('feedFullName appends the form word', () => {
    expect(feedFullName({ name: 'Top Breeder', form: 'cubes' })).toBe('Top Breeder cubes');
    expect(feedFullName({ name: 'Top Breeder', form: 'pellet' })).toBe('Top Breeder pellets');
    expect(feedFullName({ name: 'Top Breeder', form: 'textured' })).toBe('Top Breeder textured');
  });

  it('default feeds are base names with cubes form (compose Appendix B names)', () => {
    const feeds = initialState().settings.feeds;
    expect(feeds.map((f) => f.name)).toEqual(['Top Breeder', 'Original 14', 'M10 Balancer', 'Alam']);
    expect(feeds.every((f) => f.form === 'cubes')).toBe(true);
    expect(feedFullName(feeds[0])).toBe('Top Breeder cubes');
  });
});

describe('live carry-forward (syncCarriedForward)', () => {
  it('current unsent week tracks the prior week’s have', () => {
    const s = sampleHistory(); // last week 6/16 (unsent), prior 6/9
    const prev = s.weeks.find((w) => w.date === '2026-06-09')!;
    prev.feeds.tb.have = 9; // was 2
    syncCarriedForward(s);
    expect(s.weeks[s.weeks.length - 1].feeds.tb.had).toBe(9);
  });

  it('leaves a manually adjusted (carriedEdited) cell alone', () => {
    const s = sampleHistory();
    const cur = s.weeks[s.weeks.length - 1];
    cur.feeds.tb.had = 4;
    cur.feeds.tb.carriedEdited = true;
    s.weeks.find((w) => w.date === '2026-06-09')!.feeds.tb.have = 9;
    syncCarriedForward(s);
    expect(cur.feeds.tb.had).toBe(4); // not overwritten
  });

  it('does not touch a sent current week', () => {
    const s = sampleHistory();
    const cur = s.weeks[s.weeks.length - 1];
    cur.sent = true;
    const before = cur.feeds.tb.had;
    s.weeks[s.weeks.length - 2].feeds.tb.have = 99;
    syncCarriedForward(s);
    expect(cur.feeds.tb.had).toBe(before);
  });
});

describe('initialState — clean install has no history', () => {
  it('keeps the 4 default feeds but only one empty current week', () => {
    const s = initialState();
    expect(s.settings.feeds).toHaveLength(4);
    expect(s.weeks).toHaveLength(1);
    const wk0 = s.weeks[0];
    expect(wk0.sent).toBe(false);
    // every feed starts uncounted (have = null), no carried numbers
    expect(Object.values(wk0.feeds).every((c) => c.have === null && c.had === 0 && c.ordered === 0)).toBe(true);
  });

  it('default reminder is off / Tuesday / 09:00', () => {
    const r = initialState().settings.reminder;
    expect(r).toEqual({ enabled: false, weekday: 2, time: '09:00' });
  });

  it('nextTuesday returns a Tuesday', () => {
    // 2026-06-15 is a Monday -> next Tuesday 2026-06-16
    expect(nextTuesday(new Date(2026, 5, 15))).toBe('2026-06-16');
    // on a Tuesday, returns that day
    expect(nextTuesday(new Date(2026, 5, 16))).toBe('2026-06-16');
  });
});
