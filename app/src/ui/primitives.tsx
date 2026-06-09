/* =====================================================================
   Shared UI primitives (brand-styled) — ported from app-ui.jsx.
   Device-frame paddings replaced with safe-area insets for a real PWA.
   ===================================================================== */
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { C, FONT, DISPLAY, STENCIL } from './tokens';
import { AppIcon } from './icons';

/* ---- top chrome bar (deep purple, brand) -------------------------- */
export function TopBar({
  title, subtitle, onBack, right, chrome = C.purpleDeep,
}: {
  title: string; subtitle?: string; onBack?: (() => void) | null; right?: ReactNode; chrome?: string;
}) {
  return (
    <div style={{ background: chrome, color: C.off, padding: 'calc(env(safe-area-inset-top) + 16px) 18px 14px', flexShrink: 0, position: 'relative', zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}>
        {onBack ? (
          <button onClick={onBack} aria-label="Back" style={{ background: 'rgba(255,255,255,0.10)', border: 0, borderRadius: 999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.off, flexShrink: 0 }}>
            <AppIcon name="back" size={20} />
          </button>
        ) : (
          <img src="/assets/round-white.png" alt="Mane Characters" style={{ height: 34, width: 'auto', flexShrink: 0, marginRight: 2 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: STENCIL, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 10.5, color: C.tealLight, lineHeight: 1.1 }}>{subtitle}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 25, lineHeight: 1.05, letterSpacing: '0.01em', marginTop: 2 }}>{title}</div>
        </div>
        {right}
      </div>
    </div>
  );
}

/* ---- bottom tab bar ----------------------------------------------- */
export type TabId = 'week' | 'history' | 'backup' | 'settings';
export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'week', label: 'This Week', icon: 'clipboard' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'backup', label: 'Backup', icon: 'archive' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];
export function TabBar({ active, onChange, chrome = C.purpleDeep }: { active: TabId; onChange: (id: TabId) => void; chrome?: string }) {
  return (
    <div style={{ background: chrome, paddingTop: 8, paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)', paddingInline: 6, display: 'flex', flexShrink: 0, position: 'relative', zIndex: 5, boxShadow: '0 -1px 0 rgba(255,255,255,0.06)' }}>
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{ flex: 1, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0', color: on ? C.tealLight : 'rgba(249,248,248,0.5)' }}>
            <AppIcon name={t.icon} size={23} stroke={on ? 2 : 1.7} />
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: '0.01em' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---- stepper (− value + with editable number) -------------------- */
export function Stepper({
  value, onChange, min = 0, accent = C.purple, warn = false, size = 'md',
}: {
  value: number | null | undefined; onChange: (v: number | null) => void; min?: number; accent?: string; warn?: boolean; size?: 'md' | 'lg';
}) {
  const has = value !== null && value !== undefined && (value as unknown) !== '';
  const num: number | '' = has ? Number(value) : '';
  const dim = size === 'lg' ? 38 : 32;
  const border = warn ? C.alert : C.warm;
  const btn = (icon: string, delta: number) => (
    <button
      onClick={() => onChange(Math.max(min, (Number(value) || 0) + delta))}
      aria-label={delta > 0 ? 'Increase' : 'Decrease'}
      style={{ width: dim, height: dim, borderRadius: 8, border: `1.5px solid ${border}`, background: C.white, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
    >
      <AppIcon name={icon} size={16} stroke={2.2} color={accent} />
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      {btn('minus', -1)}
      <input
        type="number" value={num} placeholder="–" inputMode="numeric"
        onChange={(e) => { const v = e.target.value; onChange(v === '' ? null : Number(v)); }}
        style={{ width: size === 'lg' ? 52 : 44, height: dim, textAlign: 'center', border: `1.5px solid ${border}`, borderRadius: 8, fontFamily: FONT, fontSize: size === 'lg' ? 20 : 17, fontWeight: 700, color: warn ? C.alert : accent, background: warn ? C.alertSoft : C.white }}
      />
      {btn('plus', +1)}
    </div>
  );
}

/* ---- toggle switch ------------------------------------------------- */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} style={{ width: 50, height: 30, borderRadius: 999, border: 0, cursor: 'pointer', padding: 3, background: on ? C.teal : C.warm, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 200ms cubic-bezier(.4,0,.2,1)' }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, background: C.white, boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 200ms cubic-bezier(.4,0,.2,1)' }} />
    </button>
  );
}

/* ---- segmented control -------------------------------------------- */
export function Segmented<T extends string>({
  value, options, onChange, accent = C.purple,
}: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; accent?: string;
}) {
  return (
    <div style={{ display: 'inline-flex', background: C.whisperP, borderRadius: 9, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{ border: 0, cursor: 'pointer', borderRadius: 7, padding: '7px 14px', fontFamily: FONT, fontSize: 13, fontWeight: on ? 700 : 500, background: on ? accent : 'transparent', color: on ? C.off : C.gray, transition: 'all 160ms' }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/* ---- chip ---------------------------------------------------------- */
type ChipTone = 'neutral' | 'teal' | 'gold' | 'alert' | 'sent' | 'code';
export function Chip({ children, tone = 'neutral', icon }: { children: ReactNode; tone?: ChipTone; icon?: string }) {
  const tones: Record<ChipTone, { bg: string; fg: string }> = {
    neutral: { bg: C.whisperP, fg: C.purple },
    teal: { bg: C.whisperT, fg: C.teal },
    gold: { bg: '#F7EFD6', fg: '#8a6d12' },
    alert: { bg: C.alertSoft, fg: C.alert },
    sent: { bg: C.whisperT, fg: C.teal },
    code: { bg: 'rgba(105,66,138,0.10)', fg: C.purple },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: t.bg, color: t.fg, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.2 }}>
      {icon && <AppIcon name={icon} size={12} stroke={2.2} color={t.fg} />}
      {children}
    </span>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gray, margin: '0 0 10px', ...style }}>{children}</div>;
}

/* ---- button -------------------------------------------------------- */
type BtnVariant = 'primary' | 'teal' | 'ghost' | 'soft';
export function AppButton({
  children, variant = 'primary', icon, iconRight, onClick, full, disabled, size = 'md', type = 'button',
}: {
  children: ReactNode; variant?: BtnVariant; icon?: string; iconRight?: string;
  onClick?: () => void; full?: boolean; disabled?: boolean; size?: 'md' | 'lg'; type?: 'button' | 'submit';
}) {
  const styles = {
    primary: { bg: C.purple, fg: C.off, bd: 'transparent' },
    teal: { bg: C.teal, fg: C.off, bd: 'transparent' },
    ghost: { bg: 'transparent', fg: C.purple, bd: C.purple },
    soft: { bg: C.whisperP, fg: C.purple, bd: 'transparent' },
  }[variant];
  const pad = size === 'lg' ? '15px 22px' : '12px 18px';
  return (
    <button onClick={onClick} disabled={disabled} type={type} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      width: full ? '100%' : undefined, padding: pad, borderRadius: 10,
      border: `2px solid ${styles.bd}`, background: styles.bg, color: styles.fg,
      fontFamily: FONT, fontWeight: 900, fontSize: size === 'lg' ? 13.5 : 12.5, letterSpacing: '0.07em', textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, transition: 'all 180ms',
      boxShadow: variant === 'primary' || variant === 'teal' ? '0 2px 8px rgba(44,26,62,0.14)' : 'none',
    }}>
      {icon && <AppIcon name={icon} size={17} color={styles.fg} stroke={2.2} />}
      {children}
      {iconRight && <AppIcon name={iconRight} size={17} color={styles.fg} stroke={2.2} />}
    </button>
  );
}

/* ---- bottom sheet -------------------------------------------------- */
export function Sheet({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(44,26,62,0.42)', display: 'flex', alignItems: 'flex-end', animation: 'mcFade 180ms ease' }}>
      <div onClick={(e) => e.stopPropagation()} className="mc-scroll" style={{ background: C.off, width: '100%', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '86%', overflow: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom) + 34px)', animation: 'mcRise 240ms cubic-bezier(.2,.7,.2,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}><div style={{ width: 38, height: 5, borderRadius: 999, background: C.warm }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 8px' }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 19, color: C.purple }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ background: C.whisperP, border: 0, borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><AppIcon name="x" size={18} color={C.gray} /></button>
        </div>
        <div style={{ padding: '4px 20px 0' }}>{children}</div>
      </div>
    </div>
  );
}

/* ---- hold-to-confirm button (accident-proof destructive action) --- */
export function HoldButton({
  children, onConfirm, holdMs = 1100, tone = C.alert, icon = 'trash',
}: {
  children: ReactNode; onConfirm: () => void; holdMs?: number; tone?: string; icon?: string;
}) {
  const [pct, setPct] = useState(0);
  const ref = useRef({ raf: 0, start: 0, fired: false });
  const stop = () => { cancelAnimationFrame(ref.current.raf); ref.current.fired = false; setPct(0); };
  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    ref.current.start = performance.now();
    ref.current.fired = false;
    const tick = () => {
      const p = Math.min(1, (performance.now() - ref.current.start) / holdMs);
      setPct(p);
      if (p >= 1) {
        if (!ref.current.fired) { ref.current.fired = true; setPct(0); onConfirm(); }
        return;
      }
      ref.current.raf = requestAnimationFrame(tick);
    };
    ref.current.raf = requestAnimationFrame(tick);
  };
  return (
    <button
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '14px 18px', borderRadius: 10, border: `2px solid ${tone}`, background: C.white, color: tone, fontFamily: FONT, fontWeight: 900, fontSize: 12.5, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', touchAction: 'none', userSelect: 'none' }}
    >
      <span style={{ position: 'absolute', inset: 0, width: `${pct * 100}%`, background: tone, transition: pct === 0 ? 'width 160ms ease' : 'none' }} />
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: pct > 0.5 ? C.white : tone, transition: 'color 120ms' }}>
        <AppIcon name={icon} size={16} color={pct > 0.5 ? C.white : tone} stroke={2.2} />
        {pct > 0 ? 'Keep holding…' : children}
      </span>
    </button>
  );
}

/* ---- toast --------------------------------------------------------- */
export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 90, pointerEvents: 'none' }}>
      <div style={{ background: C.purpleDeep, color: C.off, padding: '11px 18px', borderRadius: 999, fontFamily: FONT, fontSize: 13.5, fontWeight: 600, boxShadow: '0 8px 24px rgba(44,26,62,0.35)', display: 'flex', alignItems: 'center', gap: 8, animation: 'mcFade 180ms ease' }}>
        <AppIcon name="check" size={16} color={C.tealLight} stroke={2.4} /> {msg}
      </div>
    </div>
  );
}
