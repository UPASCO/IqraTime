import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import type { NotificationActionData } from "./notificationService";

export type NotificationActionKind = "favorite" | "another" | "open" | "tap";

export interface ParsedNotificationAction {
  readonly kind: NotificationActionKind;
  readonly data: NotificationActionData | null;
}

/**
 * Pure parsing of a native notification response — kept separate from the
 * listener wiring so it's unit-testable without expo-notifications running.
 *
 * Accepts both payload shapes: the current `{ kind, contentId }` and the
 * pre-1.9.5 `{ ayahId }`. Notifications scheduled by an older build stay
 * queued in the OS across an app update and can be tapped days later, so
 * the old shape must keep routing rather than being dropped as malformed.
 */
export function parseNotificationResponse(response: Notifications.NotificationResponse): ParsedNotificationAction {
  const raw = response.notification.request.content.data as (Partial<NotificationActionData> & { ayahId?: unknown }) | undefined;
  let data: NotificationActionData | null = null;
  if (raw && typeof raw.locale === "string" && typeof raw.slotId === "string") {
    const locale = raw.locale as NotificationActionData["locale"];
    if (typeof raw.contentId === "string" && (raw.kind === "ayah" || raw.kind === "hadith")) {
      data = { kind: raw.kind, contentId: raw.contentId, locale, slotId: raw.slotId };
    } else if (typeof raw.ayahId === "string") {
      data = { kind: "ayah", contentId: raw.ayahId, locale, slotId: raw.slotId };
    }
  }

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
