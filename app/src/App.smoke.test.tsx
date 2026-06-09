// @vitest-environment jsdom
/* UI smoke test — mounts the real <App/>, walks the tabs, opens the Order
   Message screen, and asserts the live 6/16 composed order text renders.
   Verifies the full React tree + wiring without a browser. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from './App';
import { STORAGE_KEY } from './lib/data';

const LIVE_616 =
  'Can we please get eight bags of Top Breeder cubes, four bags of Original 14 cubes, two bags of M10 Balancer cubes, and two bags of Alam cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.';

beforeEach(() => { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem('mc_feed_tracker_ui'); });
afterEach(() => cleanup());

describe('App UI smoke', () => {
  it('mounts on the This Week screen with seeded feeds', () => {
    render(<App />);
    expect(screen.getByText('Feed Order')).toBeTruthy();
    // each seeded feed appears at least once (worksheet card + order summary)
    expect(screen.getAllByText('Top Breeder cubes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Original 14 cubes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('M10 Balancer cubes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alam cubes').length).toBeGreaterThan(0);
    // worksheet progress chip shows all four counted (seed has have-counts)
    expect(screen.getByText('4/4 counted')).toBeTruthy();
  });

  it('opens the Order Message screen and shows the exact composed text', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Review order message'));
    expect(screen.getByText('Order Message')).toBeTruthy();
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toContain(LIVE_616);
    expect(textarea.value).toContain('Thank you!');
  });

  it('navigates to History and lists every seeded week', () => {
    render(<App />);
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('All weeks · newest first')).toBeTruthy();
    // sent weeks show a Sent chip; the active week shows Active
    expect(screen.getAllByText('Sent').length).toBe(3);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('Settings exposes buffer, contacts and feed management', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Safety buffer')).toBeTruthy();
    // documented order/office numbers seeded
    expect(screen.getByDisplayValue('(859) 537-2418')).toBeTruthy();
    expect(screen.getByDisplayValue('(859) 873-3333')).toBeTruthy();
    // nutritionist slot ships with a blank, editable name (no hardcoded person)
    expect(screen.getByText('Nutritionist, McCauley’s')).toBeTruthy();
    const nameInput = screen.getByPlaceholderText('Nutritionist, McCauley’s') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('entering an odd order quantity surfaces the split warning', () => {
    render(<App />);
    // Cards layout, registry order: Top Breeder is the first card with two
    // steppers — [0] = Have today, [1] = Order this week. Set order to odd.
    const spinbuttons = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    fireEvent.change(spinbuttons[1], { target: { value: '7' } });
    // warning surfaces on the feed card and in the order summary
    expect(screen.getAllByText(/can’t be split evenly/i).length).toBeGreaterThan(0);
  });
});
