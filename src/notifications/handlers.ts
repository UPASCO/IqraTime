import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import type { NotificationActionData } from "./notificationService";

export type NotificationActionKind = "favorite" | "another" | "open" | "tap";

export interface ParsedNotificationAction {
  readonly kind: NotificationActionKind;
  readonly data: NotificationActionData | null;
}

/** Pure parsing of a native notification response — kept separate from the listener wiring so it's unit-testable without expo-notifications running. */
export function parseNotificationResponse(response: Notifications.NotificationResponse): ParsedNotificationAction {
  const raw = response.notification.request.content.data as Partial<NotificationActionData> | undefined;
  const data: NotificationActionData | null =
    raw && typeof raw.ayahId === "string" && typeof raw.locale === "string" && typeof raw.slotId === "string"
      ? { ayahId: raw.ayahId, locale: raw.locale as NotificationActionData["locale"], slotId: raw.slotId }
      : null;

  const actionIdentifier = response.actionIdentifier;
  if (actionIdentifier === "favorite" || actionIdentifier === "another" || actionIdentifier === "open") {
    return { kind: actionIdentifier, data };
  }
  return { kind: "tap", data };
}

/**
 * Wires the native notification-tap/action listener to an app-level
 * callback. Registered once near the navigation root (app/_layout.tsx) so
 * a tap can route to the ayah detail screen regardless of which screen was
 * active when the notification arrived.
 */
export function useNotificationResponseHandler(onAction: (action: ParsedNotificationAction) => void): void {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      onAction(parseNotificationResponse(response));
    });
    return () => subscription.remove();
  }, [onAction]);
}
