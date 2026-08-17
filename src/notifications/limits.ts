import { Platform } from "react-native";

import { appConfig } from "@/config/appConfig";

/**
 * iOS enforces an *effective* ceiling on a per-app basis for locally
 * scheduled notifications; Apple does not publish an exact guaranteed
 * number and it has changed across OS versions in practice (widely
 * observed in the 64 range). We stay well under any plausible ceiling by
 * applying a safety margin, and we tell the user in onboarding/Diagnostics
 * that periodically opening the app is what keeps the sliding queue full
 * (see docs/NOTIFICATIONS.md "iOS limits").
 *
 * Android has no comparable hard OS ceiling on scheduled notifications,
 * but we still cap generation to a sane bound to avoid excessive
 * AlarmManager usage and battery-optimization scrutiny.
 */
export function getMaxPendingNotifications(): number {
  if (Platform.OS === "ios") {
    return Math.max(1, appConfig.notificationLimits.iosEffectivePendingLimit - appConfig.notificationLimits.iosSafetyMargin);
  }
  return appConfig.notificationLimits.androidSoftLimit;
}

/** How many days ahead the scheduler is allowed to look when filling the sliding queue. */
export function getSchedulingHorizonDays(): number {
  return Platform.OS === "ios" ? 21 : 30;
}
