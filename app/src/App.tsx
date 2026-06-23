/* =====================================================================
   App shell — routing, toast, buffer + UI prefs, start-new-week.
   Replaces the prototype's device frame / Tweaks panel (BUILD_SPEC §20).
   ===================================================================== */
import { useEffect, useRef, useState } from 'react';
import { C } from './ui/tokens';
import { TopBar, TabBar, Toast, type TabId } from './ui/primitives';
import { ThisWeekScreen } from './screens/ThisWeek';
import { MessageScreen } from './screens/Message';
import { HistoryScreen } from './screens/History';
import { BackupScreen } from './screens/Backup';
import { SettingsScreen } from './screens/Settings';
import { loadState, saveState, startNewWeek, type AppState } from './lib/data';
import { syncOrderReminder } from './lib/notifications';

const UI_KEY = 'mc_feed_tracker_ui';
interface UiPrefs { layout: 'cards' | 'grid'; oilReminder: boolean }
const DEFAULT_UI: UiPrefs = { layout: 'cards', oilReminder: true };

function loadUi(): UiPrefs {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (raw) return { ...DEFAULT_UI, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_UI };
}

export function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [tab, setTab] = useState<TabId>('week');
  const [view, setView] = useState<'message' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [ui, setUi] = useState<UiPrefs>(() => loadUi());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch { /* ignore */ } }, [ui]);

  // On launch, make the OS reminder schedule match saved settings (e.g. after
  // a reinstall). No-ops in the browser preview. Runs once.
  useEffect(() => { void syncOrderReminder(state.settings.reminder); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const toast = (m: string) => {
    setToastMsg(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1900);
  };

  const overrideColor = C.gold; // BUILD_SPEC §19 — gold override flags

  const setBuffer = (v: number) => {
    const s: AppState = JSON.parse(JSON.stringify(state));
    s.settings.buffer = Math.max(0, Math.round(v));
    saveState(s);
    setState(s);
  };

  const startNext = () => {
    const s: AppState = JSON.parse(JSON.stringify(state));
    s.weeks.push(startNewWeek(s));
    saveState(s);
    setState(s);
    setTab('week');
    setView(null);
    toast('Next week started');
  };

  let title: string;
  let subtitle: string;
  let onBack: (() => void) | null = null;
  let showTabs = true;
  let content: React.ReactNode;

  if (view === 'message') {
    title = 'Order Message'; subtitle = 'Review · edit · send'; onBack = () => setView(null); showTabs = false;
    content = <MessageScreen state={state} setState={setState} onBack={() => setView(null)} onSent={() => { setView(null); setTab('week'); toast('Order marked sent'); }} toast={toast} />;
  } else if (tab === 'week') {
    title = 'Feed Order'; subtitle = 'Weekly · McCauley’s';
    content = <ThisWeekScreen state={state} setState={setState} layout={ui.layout} overrideColor={overrideColor} oilReminder={ui.oilReminder} onReview={() => setView('message')} onStartNext={startNext} toast={toast} />;
  } else if (tab === 'history') {
    title = 'History'; subtitle = 'Every past order';
    content = <HistoryScreen state={state} setState={setState} toast={toast} />;
  } else if (tab === 'backup') {
    title = 'Backup & Export'; subtitle = 'Offline · portable';
    content = <BackupScreen state={state} setState={setState} toast={toast} />;
  } else {
    title = 'Settings'; subtitle = 'Configuration';
    const bufferControl = (
      <input type="range" min={0} max={6} step={1} value={state.settings.buffer}
        onChange={(e) => setBuffer(Number(e.target.value))}
        style={{ width: '100%', accentColor: C.teal }} />
    );
    content = (
      <SettingsScreen
        state={state} setState={setState} toast={toast} bufferControl={bufferControl}
        layout={ui.layout} setLayout={(v) => setUi((u) => ({ ...u, layout: v }))}
        oilReminder={ui.oilReminder} setOilReminder={(v) => setUi((u) => ({ ...u, oilReminder: v }))}
      />
    );
  }

  const screenKey = view === 'message' ? 'message' : tab;

  return (
    <div style={{ position: 'relative', height: '100dvh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', background: C.off, overflow: 'hidden', boxShadow: '0 0 60px rgba(0,0,0,0.35)' }}>
      <TopBar title={title} subtitle={subtitle} onBack={onBack} />
      <div key={screenKey} className="mc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', animation: 'mcFade 220ms ease', WebkitOverflowScrolling: 'touch' }}>
        {content}
      </div>
      {showTabs && <TabBar active={tab} onChange={(id) => { setTab(id); setView(null); }} />}
      <Toast msg={toastMsg} />
    </div>
  );
}
