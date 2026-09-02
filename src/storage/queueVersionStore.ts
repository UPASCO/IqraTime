import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "iqratime.notificationQueueVersion";

/**
 * The NOTIFICATION_QUEUE_VERSION (src/notifications/rescheduleService.ts)
 * the queue on this device was last built with, or undefined on a fresh
 * install / before the first run of a build that records it. Read errors
 * count as "unknown" so a corrupted value triggers one harmless full
 * renewal rather than a crash.
 */
export async function loadQueueVersion(): Promise<number | undefined> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return undefined;
    const parsed = Number(raw);
    return Number.isInteger(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export async function saveQueueVersion(version: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, String(version));
}
