import * as Notifications from "expo-notifications";

import type { SupportedLocale } from "@/config/appConfig";
import type { AyahReference, NotificationSlot } from "@/domain/types";
import { translate } from "@/i18n";

export const NOTIFICATION_CATEGORY = "ayahnow.ayah";

export interface NotificationActionData {
  readonly ayahId: string;
  readonly locale: SupportedLocale;
  readonly slotId: string;
  readonly [key: string]: unknown;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the notification action category once at app startup.
 *
 * All three actions open the app to the foreground rather than acting
 * silently in the background: iOS gives a notification-service extension
 * only a few seconds of background time and Android's background execution
 * is similarly constrained and battery-optimization-dependent, so a
 * "Favorite" or "Another ayah" action that silently succeeds or fails
 * in the background cannot be made reliable. Opening the app guarantees
 * the action actually completes and gives the user visible feedback. This
 * trade-off is documented in docs/NOTIFICATIONS.md "Notification actions".
 */
export async function registerNotificationCategory(locale: SupportedLocale): Promise<void> {
  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY, [
    {
      identifier: "favorite",
      buttonTitle: translate(locale, "notifications.actionFavorite"),
      options: { opensAppToForeground: true },
    },
    {
      identifier: "another",
      buttonTitle: translate(locale, "notifications.actionAnother"),
      options: { opensAppToForeground: true },
    },
    {
      identifier: "open",
      buttonTitle: translate(locale, "notifications.actionOpen"),
      options: { opensAppToForeground: true },
    },
  ]);
}

export interface ScheduleContentInput {
  readonly slot: NotificationSlot;
  readonly reference: AyahReference;
  readonly bodyText: string;
  readonly locale: SupportedLocale;
  readonly soundEnabled: boolean;
}

export async function scheduleOsNotification(input: ScheduleContentInput): Promise<void> {
  const title = translate(input.locale, "notifications.titleTemplate", {
    surah: input.reference.surah,
    ayah: input.reference.ayah,
  });

  const data: NotificationActionData = {
    ayahId: `${input.reference.surah}:${input.reference.ayah}`,
    locale: input.locale,
    slotId: input.slot.id,
  };

  await Notifications.scheduleNotificationAsync({
    identifier: input.slot.id,
    content: {
      title,
      body: input.bodyText,
      sound: input.soundEnabled,
      categoryIdentifier: NOTIFICATION_CATEGORY,
      data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(input.slot.fireAtUtcIso),
    },
  });
}

export async function cancelOsNotifications(ids: readonly string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function cancelAllOsNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedules a test notification 60 seconds out using the *same* DATE
 * trigger the real queue uses — unlike sendTestNotification(), which fires
 * immediately and therefore proves nothing about date-triggered delivery.
 * This is the decisive check when the app believes notifications are
 * scheduled but none arrive: see docs/NOTIFICATIONS.md.
 */
export async function sendDelayedTestNotification(locale: SupportedLocale, bodyText: string): Promise<Date> {
  const fireAt = new Date(Date.now() + 60_000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: translate(locale, "common.appName"),
      body: bodyText,
      sound: true,
      categoryIdentifier: NOTIFICATION_CATEGORY,
      data: { test: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });
  return fireAt;
}

export interface OsScheduledSummary {
  /** The ground-truth count of notifications iOS/Android actually has queued — compare against the app's own DB count to catch a "the DB thinks it's scheduled but the OS never got it" mismatch. */
  readonly count: number;
  readonly nextFireDateIso: string | null;
}

/**
 * Reads the OS's own pending-notification list directly, bypassing the
 * app's local SQLite bookkeeping entirely. See docs/NOTIFICATIONS.md
 * "Diagnosing a DB/OS mismatch".
 */
export async function getOsScheduledSummary(): Promise<OsScheduledSummary> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  const dates = requests
    .map((r) => triggerToDate(r.trigger))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  return { count: requests.length, nextFireDateIso: dates[0]?.toISOString() ?? null };
}

interface DateComponentsShape {
  readonly year?: number;
  readonly month?: number;
  readonly day?: number;
  readonly hour?: number;
  readonly minute?: number;
  readonly second?: number;
}

function triggerToDate(trigger: Notifications.NotificationTrigger): Date | null {
  if (!trigger || typeof trigger !== "object" || !("type" in trigger)) return null;
  if (trigger.type === "calendar" && "dateComponents" in trigger) {
    const c = (trigger as { dateComponents: DateComponentsShape }).dateComponents;
    if (c.year != null && c.month != null && c.day != null) {
      return new Date(c.year, c.month - 1, c.day, c.hour ?? 0, c.minute ?? 0, c.second ?? 0);
    }
  }
  // iOS reads back a `type: DATE` scheduled trigger as a `UNTimeIntervalNotificationTrigger`
  // (an elapsed-seconds-from-now trigger), not a calendar trigger — `seconds` here is a
  // countdown, not an absolute date, so "now" must be added back to recover the fire time.
  if (trigger.type === "timeInterval" && "seconds" in trigger && typeof (trigger as { seconds?: unknown }).seconds === "number") {
    return new Date(Date.now() + (trigger as { seconds: number }).seconds * 1000);
  }
  if ("value" in trigger && typeof (trigger as { value?: unknown }).value === "number") {
    return new Date((trigger as { value: number }).value);
  }
  return null;
}

export async function sendTestNotification(locale: SupportedLocale, bodyText: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: translate(locale, "common.appName"),
      body: bodyText,
      sound: true,
      categoryIdentifier: NOTIFICATION_CATEGORY,
      data: { test: true },
    },
    trigger: null, // fire immediately
  });
}

export async function getOsScheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
