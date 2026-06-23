// @vitest-environment jsdom
/* UI smoke test — mounts the real <App/>. Covers both a clean install
   (empty initial state, no history) and a state seeded with the historical
   fixture (so the composed 6/16 message + history render). Verifies the full
   React tree + wiring without a browser. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from './App';
import { STORAGE_KEY } from './lib/data';
import { sampleHistory } from './lib/sampleHistory.fixture';

const LIVE_616 =
  'Can we please get eight bags of Top Breeder cubes, four bags of Original 14 cubes, two bags of M10 Balancer cubes, and two bags of Alam cubes? Please split the order and bill half to Maplehurst and half to Mane Characters.';

function seedHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleHistory()));
}

beforeEach(() => { localStorage.clear(); });
afterEach(() => cleanup());

describe('clean install (no seeded history)', () => {
  it('keeps the 4 default feeds but starts uncounted with no past orders', () => {
    render(<App />);
    expect(screen.getByText('Feed Order')).toBeTruthy();
    expect(screen.getAllByText('Top Breeder cubes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Original 14 cubes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('M10 Balancer cubes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alam cubes').length).toBeGreaterThan(0);
    // nothing counted yet
    expect(screen.getByText('0/4 counted')).toBeTruthy();
    // History has just the one current (Active) week, no Sent weeks
    fireEvent.click(screen.getByText('History'));
    expect(screen.queryAllByText('Sent').length).toBe(0);
    expect(screen.getByText('Active')).toBeTruthy();
  });
});

describe('seeded with historical fixture', () => {
  it('opens the Order Message screen and shows the exact composed text', () => {
    seedHistory();
    render(<App />);
    fireEvent.click(screen.getByText('Review order message'));
    expect(screen.getByText('Order Message')).toBeTruthy();
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain(LIVE_616);
    expect(textarea.value).toContain('Thank you!');
  });

  it('History lists every seeded week (3 sent + 1 active)', () => {
    seedHistory();
    render(<App />);
    fireEvent.click(screen.getByText('History'));
    expect(screen.getAllByText('Sent').length).toBe(3);
    expect(screen.getByText('Active')).toBeTruthy();
  });
});

describe('Settings', () => {
  it('exposes buffer, the weekly reminder, contacts and feed management', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Safety buffer')).toBeTruthy();
    expect(screen.getByText('Weekly order reminder')).toBeTruthy();
    // documented McCauley's numbers seeded
    expect(screen.getByDisplayValue('(859) 537-2418')).toBeTruthy();
    expect(screen.getByDisplayValue('(859) 873-3333')).toBeTruthy();
    // nutritionist slot ships with a blank, editable name (no hardcoded person)
    expect(screen.getByText('Nutritionist, McCauley’s')).toBeTruthy();
    const nameInputs = screen.getAllByPlaceholderText('Add a name') as HTMLInputElement[];
    expect(nameInputs.some((i) => i.value === '')).toBe(true);
    // no editable "Supplier name" field anymore
    expect(screen.queryByText('Supplier name')).toBeNull();
  });

  it('reminder is off by default and reveals day/time when enabled', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.queryByText('Day')).toBeNull();
    // toggle the reminder on (its switch is the one after the low-oil switch)
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[switches.length - 1]);
    expect(screen.getByText('Day')).toBeTruthy();
    expect(screen.getByText('Time')).toBeTruthy();
  });
});

describe('worksheet entry', () => {
  it('entering an odd order quantity surfaces the split warning', () => {
    seedHistory();
    render(<App />);
    // Cards layout, Top Breeder is first card: [0]=Have today, [1]=Order this week
    const spinbuttons = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    fireEvent.change(spinbuttons[1], { target: { value: '7' } });
    expect(screen.getAllByText(/can’t be split evenly/i).length).toBeGreaterThan(0);
  });

  it('Reset this week clears Have to 0 behind a confirm sheet', () => {
    seedHistory();
    render(<App />);
    // confirm is required (deliberate, not accidental)
    fireEvent.click(screen.getByText('Reset this week'));
    expect(screen.getByText('Reset this week?')).toBeTruthy();
    fireEvent.click(screen.getByText('Reset week'));
    // first card's "Have today" stepper is now 0
    const spin = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(spin[0].value).toBe('0');
  });
});
