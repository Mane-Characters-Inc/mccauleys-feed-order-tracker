/* =====================================================================
   Feed Order Tracker — shared UI primitives (brand-styled for mobile)
   Exported to window. Styled against the Mane Characters tokens.
   ===================================================================== */

const C = {
  purple: '#69428A', purpleDeep: '#2C1A3E', purpleLight: '#B4A0C5',
  teal: '#108A81', tealBright: '#14A99F', tealLight: '#8CD4CF',
  gold: '#C9A84C', alert: '#C0492F', alertSoft: '#FBEDE9',
  off: '#F9F8F8', white: '#FFFFFF', ink: '#221A2B',
  gray: '#585858', warm: '#D7CCCC', whisperP: '#F5F0FA', whisperT: '#E8F7F6',
};
const FONT = "'Roboto', system-ui, -apple-system, sans-serif";
const DISPLAY = "'Britannic Bold', 'Libre Franklin', Georgia, serif";
const STENCIL = "'American Captain', 'Oswald', sans-serif";

/* ---- icons (Lucide-style, 1.75 stroke) ---------------------------- */
const ICON_PATHS = {
  back:   '<path d="M15 18l-6-6 6-6"/>',
  chev:   '<path d="M9 18l6-6-6-6"/>',
  chevDown:'<path d="M6 9l6 6 6-6"/>',
  clipboard:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12l2 2 4-4"/>',
  history:'<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>',
  archive:'<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  gear:   '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  minus:  '<path d="M5 12h14"/>',
  check:  '<path d="M20 6L9 17l-5-5"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  send:   '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  copy:   '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  edit:   '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  warn:   '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  trash:  '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  grip:   '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
  x:      '<path d="M18 6L6 18M6 6l12 12"/>',
  droplet:'<path d="M12 2.7l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  info:   '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  truck:  '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  phone:  '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  plusCircle:'<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
  userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  facebook:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  external:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>',
};
function AppIcon({ name, size = 20, color = 'currentColor', stroke = 1.75, style }) {
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    style, dangerouslySetInnerHTML: { __html: ICON_PATHS[name] || '' },
  });
}

/* ---- top chrome bar (deep purple, brand) -------------------------- */
function TopBar({ title, subtitle, onBack, right, chrome = C.purpleDeep }) {
  return (
    <div style={{ background: chrome, color: C.off, padding: '52px 18px 14px', flexShrink: 0, position: 'relative', zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}>
        {onBack ? (
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.10)', border: 0, borderRadius: 999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.off, flexShrink: 0 }}>
            <AppIcon name="back" size={20} />
          </button>
        ) : (
          <img src="assets/round-white.png" alt="Mane Characters" style={{ height: 34, width: 'auto', flexShrink: 0, marginRight: 2 }} />
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
const TABS = [
  { id: 'week', label: 'This Week', icon: 'clipboard' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'backup', label: 'Backup', icon: 'archive' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];
function TabBar({ active, onChange, chrome = C.purpleDeep }) {
  return (
    <div style={{ background: chrome, paddingTop: 8, paddingBottom: 26, paddingInline: 6, display: 'flex', flexShrink: 0, position: 'relative', zIndex: 5, boxShadow: '0 -1px 0 rgba(255,255,255,0.06)' }}>
      {TABS.map(t => {
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
function Stepper({ value, onChange, min = 0, accent = C.purple, warn = false, size = 'md' }) {
  const has = value !== null && value !== undefined && value !== '';
  const num = has ? Number(value) : '';
  const dim = size === 'lg' ? 38 : 32;
  const border = warn ? C.alert : C.warm;
  const btn = (icon, delta) => (
    <button onClick={() => onChange(Math.max(min, (Number(value) || 0) + delta))}
      style={{ width: dim, height: dim, borderRadius: 8, border: `1.5px solid ${border}`, background: C.white, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <AppIcon name={icon} size={16} stroke={2.2} color={accent} />
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      {btn('minus', -1)}
      <input type="number" value={num} placeholder="–"
        onChange={(e) => { const v = e.target.value; onChange(v === '' ? null : Number(v)); }}
        style={{ width: size === 'lg' ? 52 : 44, height: dim, textAlign: 'center', border: `1.5px solid ${border}`, borderRadius: 8, fontFamily: FONT, fontSize: size === 'lg' ? 20 : 17, fontWeight: 700, color: warn ? C.alert : accent, background: warn ? C.alertSoft : C.white, MozAppearance: 'textfield' }} />
      {btn('plus', +1)}
    </div>
  );
}

/* ---- toggle switch ------------------------------------------------- */
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 50, height: 30, borderRadius: 999, border: 0, cursor: 'pointer', padding: 3, background: on ? C.teal : C.warm, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 200ms cubic-bezier(.4,0,.2,1)' }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, background: C.white, boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 200ms cubic-bezier(.4,0,.2,1)' }} />
    </button>
  );
}

/* ---- segmented control -------------------------------------------- */
function Segmented({ value, options, onChange, accent = C.purple }) {
  return (
    <div style={{ display: 'inline-flex', background: C.whisperP, borderRadius: 9, padding: 3, gap: 3 }}>
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{ border: 0, cursor: 'pointer', borderRadius: 7, padding: '7px 14px', fontFamily: FONT, fontSize: 13, fontWeight: on ? 700 : 500, background: on ? accent : 'transparent', color: on ? C.off : C.gray, transition: 'all 160ms' }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/* ---- chip ---------------------------------------------------------- */
function Chip({ children, tone = 'neutral', icon }) {
  const tones = {
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

function SectionLabel({ children, style }) {
  return <div style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gray, margin: '0 0 10px', ...style }}>{children}</div>;
}

function AppButton({ children, variant = 'primary', icon, iconRight, onClick, full, disabled, size = 'md' }) {
  const styles = {
    primary: { bg: C.purple, fg: C.off, bd: 'transparent' },
    teal: { bg: C.teal, fg: C.off, bd: 'transparent' },
    ghost: { bg: 'transparent', fg: C.purple, bd: C.purple },
    soft: { bg: C.whisperP, fg: C.purple, bd: 'transparent' },
  }[variant];
  const pad = size === 'lg' ? '15px 22px' : '12px 18px';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      width: full ? '100%' : undefined, padding: pad, borderRadius: 10,
      border: `2px solid ${styles.bd}`, background: styles.bg, color: styles.fg,
      fontFamily: FONT, fontWeight: 900, fontSize: size === 'lg' ? 13.5 : 12.5, letterSpacing: '0.07em', textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, transition: 'all 180ms', boxShadow: variant === 'primary' || variant === 'teal' ? '0 2px 8px rgba(44,26,62,0.14)' : 'none',
    }}>
      {icon && <AppIcon name={icon} size={17} color={styles.fg} stroke={2.2} />}
      {children}
      {iconRight && <AppIcon name={iconRight} size={17} color={styles.fg} stroke={2.2} />}
    </button>
  );
}

/* ---- bottom sheet -------------------------------------------------- */
function Sheet({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(44,26,62,0.42)', display: 'flex', alignItems: 'flex-end', animation: 'mcFade 180ms ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.off, width: '100%', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '86%', overflow: 'auto', paddingBottom: 34, animation: 'mcRise 240ms cubic-bezier(.2,.7,.2,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}><div style={{ width: 38, height: 5, borderRadius: 999, background: C.warm }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 8px' }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 19, color: C.purple }}>{title}</div>
          <button onClick={onClose} style={{ background: C.whisperP, border: 0, borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><AppIcon name="x" size={18} color={C.gray} /></button>
        </div>
        <div style={{ padding: '4px 20px 0' }}>{children}</div>
      </div>
    </div>
  );
}

/* ---- hold-to-confirm button (accident-proof destructive action) --- */
function HoldButton({ children, onConfirm, holdMs = 1100, tone = C.alert, icon = 'trash' }) {
  const [pct, setPct] = React.useState(0);
  const ref = React.useRef({ raf: 0, start: 0, fired: false });
  const stop = () => { cancelAnimationFrame(ref.current.raf); ref.current.fired = false; setPct(0); };
  const start = (e) => {
    e.preventDefault();
    ref.current.start = performance.now(); ref.current.fired = false;
    const tick = () => {
      const p = Math.min(1, (performance.now() - ref.current.start) / holdMs);
      setPct(p);
      if (p >= 1) { if (!ref.current.fired) { ref.current.fired = true; setPct(0); onConfirm(); } return; }
      ref.current.raf = requestAnimationFrame(tick);
    };
    ref.current.raf = requestAnimationFrame(tick);
  };
  return (
    <button onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '14px 18px', borderRadius: 10, border: `2px solid ${tone}`, background: C.white, color: tone, fontFamily: FONT, fontWeight: 900, fontSize: 12.5, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', touchAction: 'none', userSelect: 'none' }}>
      <span style={{ position: 'absolute', inset: 0, width: `${pct * 100}%`, background: tone, transition: pct === 0 ? 'width 160ms ease' : 'none' }} />
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: pct > 0.5 ? C.white : tone, transition: 'color 120ms' }}>
        <AppIcon name={icon} size={16} color={pct > 0.5 ? C.white : tone} stroke={2.2} />
        {pct > 0 ? 'Keep holding…' : children}
      </span>
    </button>
  );
}

/* ---- contact card (call / text / save-to-phone per capability) ---- */
function downloadVCard(contact, org) {
  try {
    const blob = new Blob([vcardFor(contact, org)], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(contact.name || 'contact').replace(/[^\w]+/g, '-')}.vcf`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  } catch (e) {}
}
function ContactCard({ contact, org, body, toast }) {
  const has = !!(contact.phone && contact.phone.trim());
  const actBtn = (href, label, icon, primary) => (
    <a href={has ? href : undefined} onClick={(e) => { if (!has) { e.preventDefault(); toast && toast('Set this number in Settings'); } else { toast && toast(`${label === 'Call' ? 'Dialing' : 'Texting'} ${contact.phone}`); } }}
      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 12px', borderRadius: 9, textDecoration: 'none',
        border: primary ? '0' : `1.5px solid ${C.warm}`, background: primary ? C.teal : C.white, color: primary ? C.off : C.purple,
        fontFamily: FONT, fontWeight: 800, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: has ? 1 : 0.5 }}>
      <AppIcon name={icon} size={15} color={primary ? C.off : C.purple} stroke={2.2} /> {label}
    </a>
  );
  return (
    <div style={{ background: C.white, borderRadius: 14, boxShadow: '0 2px 8px rgba(44,26,62,0.07)', padding: '13px 15px', border: '1px solid rgba(44,26,62,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 999, background: contact.canText && contact.canCall ? C.teal : C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AppIcon name={contact.canText && !contact.canCall ? 'send' : 'phone'} size={19} color={C.off} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15.5, color: C.ink }}>{contact.name}</div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{contact.role}{has ? ` · ${contact.phone}` : ' · no number set'}</div>
        </div>
        <button onClick={() => { if (!has) { toast && toast('Set this number in Settings'); return; } downloadVCard(contact, org); toast && toast('Saved to contacts'); }}
          title="Save to phone contacts" style={{ background: C.whisperP, border: 0, borderRadius: 9, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: has ? 1 : 0.5 }}>
          <AppIcon name="userPlus" size={18} color={C.purple} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
        {contact.canCall && actBtn(telHref(contact.phone), 'Call', 'phone', false)}
        {contact.canText && actBtn(smsHref(contact.phone, body), 'Text', 'send', !contact.canCall)}
      </div>
    </div>
  );
}

/* ---- toast --------------------------------------------------------- */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 90, pointerEvents: 'none' }}>
      <div style={{ background: C.purpleDeep, color: C.off, padding: '11px 18px', borderRadius: 999, fontFamily: FONT, fontSize: 13.5, fontWeight: 600, boxShadow: '0 8px 24px rgba(44,26,62,0.35)', display: 'flex', alignItems: 'center', gap: 8, animation: 'mcFade 180ms ease' }}>
        <AppIcon name="check" size={16} color={C.tealLight} stroke={2.4} /> {msg}
      </div>
    </div>
  );
}

Object.assign(window, {
  C, FONT, DISPLAY, STENCIL, AppIcon, TopBar, TabBar, TABS,
  Stepper, Toggle, Segmented, Chip, SectionLabel, AppButton, Sheet, Toast, HoldButton,
  ContactCard, downloadVCard,
});
