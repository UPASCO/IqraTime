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
