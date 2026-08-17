import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

export type PermissionState = "granted" | "denied" | "undetermined";

export interface PermissionSnapshot {
  readonly state: PermissionState;
  readonly canAskAgain: boolean;
  /**
   * Whether the OS reports it will show an alert/banner (a prerequisite
   * for a lock-screen preview). Not the same as the user having enabled
   * previews specifically — the OS does not expose that separately on
   * either platform, so Diagnostics shows this as "best available signal"
   * rather than a guarantee. See docs/NOTIFICATIONS.md "What we can't detect".
   */
  readonly alertStyleEnabled: boolean;
}

function toState(status: Notifications.PermissionStatus): PermissionState {
  if (status === Notifications.PermissionStatus.GRANTED) return "granted";
  if (status === Notifications.PermissionStatus.DENIED) return "denied";
  return "undetermined";
}

export async function getPermissionSnapshot(): Promise<PermissionSnapshot> {
  const result = await Notifications.getPermissionsAsync();
  return {
    state: toState(result.status),
    canAskAgain: result.canAskAgain,
    alertStyleEnabled: result.ios?.allowsAlert !== false,
  };
}

export async function requestPermission(): Promise<PermissionSnapshot> {
  const result = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowDisplayInCarPlay: false,
      allowCriticalAlerts: false,
      provideAppNotificationSettings: false,
      allowProvisional: false,
    },
  });
  return {
    state: toState(result.status),
    canAskAgain: result.canAskAgain,
    alertStyleEnabled: result.ios?.allowsAlert !== false,
  };
}

/**
 * Android 12+ (API 31+) requires SCHEDULE_EXACT_ALARM for precisely-timed
 * one-shot alarms. Expo's notification APIs do not currently expose a way
 * to query `AlarmManager.canScheduleExactAlarms()` from JS, so we cannot
 * report an exact/inexact status here — Diagnostics instead links the user
 * to the relevant system settings screen so they can check/grant it
 * themselves. See docs/NOTIFICATIONS.md "Android exact alarms".
 */
export function isExactAlarmStatusDetectable(): boolean {
  return false;
}

export async function openSystemNotificationSettings(): Promise<void> {
  if (Platform.OS === "ios") {
    await Linking.openSettings();
    return;
  }
  // Android: opens the app's notification settings screen when available.
  await Linking.openSettings();
}
