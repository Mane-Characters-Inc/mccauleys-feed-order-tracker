/* =====================================================================
   Validation harness — BUILD_SPEC §18.
   The port must reproduce every derived value and the exact Appendix B
   messages BEFORE any UI is built. Buffer = 2.
   ===================================================================== */
import { describe, it, expect } from 'vitest';
import {
  buildSeed, calcUsed, calcSuggested, orderQty, composeMessage,
  numToWords, roundUpEven, joinList, startNewWeek, isOdd,
  type AppState, type Week,
} from './data';

const state: AppState = buildSeed();
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
