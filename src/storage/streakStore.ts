import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ayahnow.streak";

export interface StreakInfo {
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly lastOpenDateIso: string;
}

function todayLocalDateKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Records that the app was opened on "today" (the device's local calendar
 * date) and returns the updated streak. Idempotent within the same local
 * day. A gap of exactly one day extends the streak; any larger gap (or
 * the clock moving backwards) resets it to 1, since the day this is
 * called on always counts as day one of a (possibly new) streak.
 */
export async function recordAppOpen(now: Date = new Date()): Promise<StreakInfo> {
  const today = todayLocalDateKey(now);
  const prev = await getStreak();

  let next: StreakInfo;
  if (!prev) {
    next = { currentStreak: 1, bestStreak: 1, lastOpenDateIso: today };
  } else if (prev.lastOpenDateIso === today) {
    next = prev;
  } else {
    const gap = daysBetween(prev.lastOpenDateIso, today);
    const currentStreak = gap === 1 ? prev.currentStreak + 1 : 1;
    next = { currentStreak, bestStreak: Math.max(prev.bestStreak, currentStreak), lastOpenDateIso: today };
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function getStreak(): Promise<StreakInfo | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StreakInfo) : null;
  } catch {
    return null;
  }
}

export async function clearStreak(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
