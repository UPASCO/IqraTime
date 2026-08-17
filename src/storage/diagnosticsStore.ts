import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ayahnow.diagnostics.lastReschedule";

export interface LastRescheduleInfo {
  readonly atUtcIso: string;
  readonly status: "success" | "partial" | "disabled" | "failed";
  readonly scheduledCount: number;
}

export async function saveLastRescheduleInfo(info: LastRescheduleInfo): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(info));
}

export async function loadLastRescheduleInfo(): Promise<LastRescheduleInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastRescheduleInfo) : null;
  } catch {
    return null;
  }
}
