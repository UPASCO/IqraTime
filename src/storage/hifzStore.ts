import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AyahId } from "@/domain/types";

const KEY = "ayahnow.hifz";

/**
 * Spaced-repetition memorization (hifz) of individual āyāt.
 *
 * Same storage tier as hadith favorites (a small AsyncStorage-backed JSON
 * list, see hadithFavoritesStore.ts for the rationale): this deliberately
 * does not touch the SQLite schema the notification pipeline depends on.
 *
 * The schedule is a plain graded-interval ladder (the SM-2 family's
 * simplest useful member): each successful review moves the entry one
 * stage up the ladder, each failed review sends it back to the start.
 * Intervals grow 1 → 3 → 7 → 14 → 30 → 60 days; an entry that reaches the
 * top stays on a 60-day maintenance cycle rather than "graduating" out —
 * memorized Qur'an is kept fresh, not archived.
 */
export interface HifzEntry {
  readonly ayahId: AyahId;
  /** Index into REVIEW_INTERVALS_DAYS. 0 = just added / failed last review. */
  readonly stage: number;
  readonly addedAtUtcIso: string;
  /** The entry is due when now >= this instant. New entries are due immediately. */
  readonly nextReviewAtUtcIso: string;
  readonly lastReviewedAtUtcIso?: string;
  /** Lifetime successful reviews, shown as gentle progress. */
  readonly successCount: number;
}

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60] as const;

const DAY_MS = 86_400_000;

async function readAll(): Promise<HifzEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HifzEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(entries: readonly HifzEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function listHifzEntries(): Promise<readonly HifzEntry[]> {
  return readAll();
}

export async function isInHifz(ayahId: AyahId): Promise<boolean> {
  const list = await readAll();
  return list.some((e) => e.ayahId === ayahId);
}

/** Entries whose review is due at `now` (or overdue), soonest-due first. */
export async function listDueHifzEntries(now: Date = new Date()): Promise<readonly HifzEntry[]> {
  const list = await readAll();
  return list
    .filter((e) => e.nextReviewAtUtcIso <= now.toISOString())
    .sort((a, b) => (a.nextReviewAtUtcIso < b.nextReviewAtUtcIso ? -1 : 1));
}

/** Adds an āyah to memorization. Idempotent; a new entry is due immediately so the first review can happen right away. */
export async function addToHifz(ayahId: AyahId, now: Date = new Date()): Promise<void> {
  const list = await readAll();
  if (list.some((e) => e.ayahId === ayahId)) return;
  const nowIso = now.toISOString();
  list.push({
    ayahId,
    stage: 0,
    addedAtUtcIso: nowIso,
    nextReviewAtUtcIso: nowIso,
    successCount: 0,
  });
  await writeAll(list);
}

export async function removeFromHifz(ayahId: AyahId): Promise<void> {
  const list = await readAll();
  await writeAll(list.filter((e) => e.ayahId !== ayahId));
}

/**
 * Records one self-graded review. `remembered: true` climbs one stage (or
 * stays at the top for its 60-day maintenance cycle); `false` returns the
 * entry to stage 0, due again in 1 day.
 */
export async function recordHifzReview(ayahId: AyahId, remembered: boolean, now: Date = new Date()): Promise<HifzEntry | undefined> {
  const list = await readAll();
  const index = list.findIndex((e) => e.ayahId === ayahId);
  if (index < 0) return undefined;
  const entry = list[index] as HifzEntry;

  // The interval is indexed by the stage BEFORE incrementing: the first
  // success earns intervals[0] (1 day), the second intervals[1] (3 days),
  // and so on — indexing by the incremented stage would skip the 1-day
  // step entirely and jump a brand-new āyah straight to 3 days.
  const nextStage = remembered ? Math.min(entry.stage + 1, REVIEW_INTERVALS_DAYS.length - 1) : 0;
  const intervalIndex = remembered ? Math.min(entry.stage, REVIEW_INTERVALS_DAYS.length - 1) : 0;
  const intervalDays = REVIEW_INTERVALS_DAYS[intervalIndex] as number;
  const updated: HifzEntry = {
    ...entry,
    stage: nextStage,
    lastReviewedAtUtcIso: now.toISOString(),
    nextReviewAtUtcIso: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    successCount: entry.successCount + (remembered ? 1 : 0),
  };
  list[index] = updated;
  await writeAll(list);
  return updated;
}

export async function clearHifz(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
