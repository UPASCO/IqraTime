import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ayahnow.shareCount";

/**
 * Counts how many times this device's user has tapped "share" on an ayah or
 * hadith — shown back to them on the Progress screen as a running "sadaqah
 * jariyah" (ongoing good deed) tally, per the Islamic principle that sharing
 * beneficial knowledge is itself a rewarded act, not just a growth metric.
 * Purely local and self-reported (no backend, no attribution, no proof a
 * share was ever opened by anyone) — consistent with this app's no-account,
 * no-analytics architecture; the count only ever describes the user's own
 * actions back to them.
 */
export async function incrementShareCount(): Promise<number> {
  const current = await getShareCount();
  const next = current + 1;
  try {
    await AsyncStorage.setItem(KEY, String(next));
  } catch {
    // Best-effort — a failed write just means the next share re-attempts from the same count.
  }
  return next;
}

export async function getShareCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}
