/* Order Message screen — ported from app-screens-week.jsx. */
import { useState } from 'react';
import { C, FONT } from '../ui/tokens';
import { AppIcon } from '../ui/icons';
import { Chip, SectionLabel, AppButton, Sheet } from '../ui/primitives';
import { ContactCard } from '../ui/ContactCard';
import { composeMessage, orderContact, smsHref, fmtSlash, fmtLong, toISO, parseISO, saveState, type AppState } from '../lib/data';
import { copyText } from '../lib/platform';

export function MessageScreen({
  state, setState, onBack, onSent, toast,
}: {
  state: AppState; setState: (s: AppState) => void; onBack: () => void; onSent: () => void; toast: (m: string) => void;
}) {
  const week = state.weeks[state.weeks.length - 1];
  const { settings } = state;
  const composed = composeMessage(week, settings);
  const edited = week.messageEdited && week.message != null;
  const text = edited ? (week.message as string) : composed;
  const [sending, setSending] = useState(false);
  const [earlyConfirm, setEarlyConfirm] = useState(false);
  const orderC = orderContact(settings);
  const others = (settings.contacts || []).filter((c) => c.id !== 'orderText');

  // Is today different from the order date? (Catches sending early / off-day.)
  const todayISO = toISO(new Date());
  const offDate = todayISO !== week.date;
  const daysToOrder = Math.round((+parseISO(week.date) - +parseISO(todayISO)) / 864e5);
  const beginSend = () => { if (offDate && !week.sent) setEarlyConfirm(true); else setSending(true); };

  const mutate = (fn: (s: AppState) => void) => { const s: AppState = JSON.parse(JSON.stringify(state)); fn(s); saveState(s); setState(s); };
  const last = (s: AppState) => s.weeks[s.weeks.length - 1];
  const onText = (v: string) => mutate((s) => { const w = last(s); w.message = v; w.messageEdited = true; });
  const rebuild = () => { mutate((s) => { const w = last(s); w.message = null; w.messageEdited = false; }); toast('Rebuilt from numbers'); };
  const copy = async () => { await copyText(text); toast('Copied to clipboard'); };
  const confirmSend = () => mutate((s) => { const w = last(s); w.message = text; w.sent = true; });

  return (
    <div style={{ padding: '16px 16px 28px' }}>
      {/* recipient: order text line */}
      <ContactCard contact={orderC} org={settings.supplierName} body={text} toast={toast} />

      {/* status note */}
      <div style={{ margin: '14px 2px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {edited
          ? <Chip tone="gold" icon="edit">Manually edited</Chip>
          : <Chip tone="teal" icon="check">Auto-composed from this week’s numbers</Chip>}
      </div>

      {/* editable message bubble */}
      <SectionLabel style={{ margin: '2px 2px 8px' }}>Message (tap to edit)</SectionLabel>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', maxWidth: '94%', width: '100%' }}>
          <textarea value={text} onChange={(e) => onText(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 220, resize: 'vertical', background: C.purple, color: C.off, border: 0, borderRadius: 20, borderBottomRightRadius: 6, padding: '15px 17px', fontFamily: FONT, fontSize: 15.5, lineHeight: 1.55, boxShadow: '0 2px 10px rgba(44,26,62,0.18)' }} />
        </div>
      </div>
      {week.sent && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <Chip tone="sent" icon="check">Sent · {fmtSlash(week.date)}</Chip>
        </div>
      )}

      {/* actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        {!week.sent && <AppButton variant="teal" full size="lg" icon="send" onClick={beginSend}>Send via text</AppButton>}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><AppButton variant="soft" full icon="copy" onClick={copy}>Copy</AppButton></div>
          <div style={{ flex: 1 }}><AppButton variant="soft" full icon="refresh" onClick={rebuild} disabled={!edited}>Rebuild</AppButton></div>
        </div>
        <AppButton variant="ghost" full icon="back" onClick={onBack}>Back to worksheet</AppButton>
      </div>

      {/* other supplier contacts */}
      {others.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <SectionLabel>More McCauley’s contacts</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {others.map((c) => <ContactCard key={c.id} contact={c} org={settings.supplierName} toast={toast} />)}
          </div>
        </div>
      )}

      {/* native Messages handoff sheet */}
      <Sheet open={sending} title="Send to supplier" onClose={() => setSending(false)}>
        <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>This opens your phone’s Messages app with the order pre-filled to <b style={{ color: C.ink }}>{orderC.name}</b> ({orderC.phone || 'no number set'}). You send it from there, no connection needed in the app.</p>
        <div style={{ background: C.whisperP, borderRadius: 12, padding: '12px 14px', fontFamily: FONT, fontSize: 13.5, color: C.ink, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 170, overflow: 'auto' }}>{text}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
          <a
            href={orderC.phone ? smsHref(orderC.phone, text) : undefined}
            onClick={(e) => { if (!orderC.phone) { e.preventDefault(); toast('Set the order text number in Settings'); return; } setSending(false); confirmSend(); onSent(); }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '15px 22px', borderRadius: 10, textDecoration: 'none', background: C.teal, color: C.off, fontFamily: FONT, fontWeight: 900, fontSize: 13.5, letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(44,26,62,0.14)' }}
          >
            <AppIcon name="send" size={17} color={C.off} stroke={2.2} /> Open Messages &amp; mark sent
          </a>
          <AppButton variant="ghost" full onClick={() => setSending(false)}>Cancel</AppButton>
        </div>
      </Sheet>

      {/* early / off-date send confirmation */}
      <Sheet open={earlyConfirm} title="Not the order date" onClose={() => setEarlyConfirm(false)}>
        <p style={{ fontSize: 13.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5, marginTop: 0 }}>
          Today is <b style={{ color: C.ink }}>{fmtLong(todayISO)}</b>, but this order is dated <b style={{ color: C.ink }}>{fmtLong(week.date)}</b>
          {daysToOrder > 0
            ? `, ${daysToOrder} day${daysToOrder === 1 ? '' : 's'} from now`
            : daysToOrder < 0
              ? `, which has already passed`
              : ''}. Send it now anyway?
        </p>
        <p style={{ fontSize: 12.5, color: C.gray, fontFamily: FONT, lineHeight: 1.5 }}>If you meant to order on a different day, tap Cancel and adjust the order date on the worksheet first.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1 }}><AppButton variant="ghost" full onClick={() => setEarlyConfirm(false)}>Cancel</AppButton></div>
          <div style={{ flex: 1 }}><AppButton variant="primary" full icon="send" onClick={() => { setEarlyConfirm(false); setSending(true); }}>Send anyway</AppButton></div>
        </div>
      </Sheet>
    </div>
  );
}
