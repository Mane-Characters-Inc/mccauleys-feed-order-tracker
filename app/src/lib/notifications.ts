/* =====================================================================
   Weekly order reminder — on-device local notification (offline).
   Uses Capacitor LocalNotifications on the installed app; no-ops in a
   plain browser (dev/preview) where scheduled local notifications aren't
   reliably supported. Nothing is sent over a network.
   ===================================================================== */
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Reminder } from './data';

const ORDER_REMINDER_ID = 1001;

function isNative(): boolean {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
}

/** True if local notifications can actually be scheduled here. */
export function remindersSupported(): boolean {
  return isNative();
}

/**
 * Make the scheduled reminder match `reminder`. Cancels any existing one,
 * then (if enabled) requests permission and schedules a weekly repeat at the
 * chosen weekday + time. Returns:
 *   'scheduled' | 'cancelled' | 'denied' | 'unsupported' | 'error'
 */
export async function syncOrderReminder(reminder: Reminder): Promise<string> {
  if (!isNative()) return 'unsupported';
  try {
    await LocalNotifications.cancel({ notifications: [{ id: ORDER_REMINDER_ID }] });
    if (!reminder.enabled) return 'cancelled';

    let granted = (await LocalNotifications.checkPermissions()).display === 'granted';
    if (!granted) {
      granted = (await LocalNotifications.requestPermissions()).display === 'granted';
    }
    if (!granted) return 'denied';

    const [hour, minute] = reminder.time.split(':').map((n) => parseInt(n, 10));
    await LocalNotifications.schedule({
      notifications: [{
        id: ORDER_REMINDER_ID,
        title: 'Feed order day',
        body: 'Time to count feed and send this week’s order to McCauley’s.',
        // JS weekday 0–6 (Sun=0) -> Capacitor weekday 1–7 (Sun=1)
        schedule: { on: { weekday: reminder.weekday + 1, hour, minute }, allowWhileIdle: true },
      }],
    });
    return 'scheduled';
  } catch {
    return 'error';
  }
}
