import duasData from "./duas.json";
import { mulberry32 } from "@/services/selectionEngine";

/**
 * 110 well-known authentic invocations: five Hisn-style categories fetched
 * verbatim from the MIT-licensed fitrahive/dua-dhikr dataset, plus the
 * famous Quranic ("Rabbanā") duas copied verbatim from the app's own
 * licensed full-Qur'an dataset. See scripts/fetchNamesAndDuas.mjs and the
 * generated file's _readme for the full provenance note.
 */
export interface DuaEntry {
  readonly id: string;
  readonly category: DuaCategory;
  readonly order: number;
  readonly title: { readonly en: string; readonly fr: string };
  readonly arabic: string;
  readonly transliteration?: string;
  readonly translation?: { readonly en?: string; readonly fr?: string };
  readonly benefits?: { readonly en: string };
  /** Attribution line (hadith collection or Qur'an reference); a few upstream tasbih entries ship without one. */
  readonly source?: string;
}

export type DuaCategory = "daily-dua" | "morning-dhikr" | "evening-dhikr" | "dhikr-after-salah" | "selected-dua" | "quranic-dua";

export const DUA_CATEGORIES: readonly DuaCategory[] = [
  "daily-dua",
  "morning-dhikr",
  "evening-dhikr",
  "dhikr-after-salah",
  "quranic-dua",
  "selected-dua",
];

const entries = duasData.entries as readonly DuaEntry[];
const byId = new Map(entries.map((entry) => [entry.id, entry]));

export function getAllDuas(): readonly DuaEntry[] {
  return entries;
}

export function getDua(id: string): DuaEntry | undefined {
  return byId.get(id);
}

export function getDuasByCategory(category: DuaCategory): readonly DuaEntry[] {
  return entries.filter((entry) => entry.category === category);
}

/** The localized functional title: French for French readers, English otherwise. */
export function duaTitleFor(dua: DuaEntry, locale: string): string {
  return locale === "fr" ? dua.title.fr : dua.title.en;
}

/**
 * The dua text's translation for the reader: French where a real one
 * exists (the Quranic entries, Hamidullah), English otherwise. English is
 * the only translated edition for the Hisn-style entries — shown to every
 * non-French locale as an explicit fallback, same policy as the hadith
 * corpus's language gaps (docs/CORPUS.md), never a silent substitution.
 */
export function duaTranslationFor(dua: DuaEntry, locale: string): string | undefined {
  if (locale === "fr" && dua.translation?.fr) return dua.translation.fr;
  return dua.translation?.en ?? dua.translation?.fr;
}

/** Same local-calendar day arithmetic as the daily āyah/name. */
function localDayNumber(now: Date): number {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

/**
 * Entries suitable for a one-glance daily notification: translated, and
 * short enough that the lock screen shows the whole text rather than the
 * first line of Āyat al-Kursī.
 */
const DAILY_POOL_MAX_ARABIC = 340;

export function getDailyDuaPool(): readonly DuaEntry[] {
  return entries.filter((entry) => entry.translation?.en && entry.arabic.length <= DAILY_POOL_MAX_ARABIC);
}

/**
 * The invocation of the day — deterministic and identical for every user
 * on the same local calendar day, exactly like the daily āyah: a seeded
 * shuffle over the pool per period of pool-length days, so every dua
 * appears exactly once before any repeats.
 */
export function getDailyDuaId(now: Date = new Date()): string | undefined {
  const pool = getDailyDuaPool();
  if (pool.length === 0) return undefined;
  const day = localDayNumber(now);
  const period = Math.floor(day / pool.length);
  const offset = day % pool.length;
  const random = mulberry32(period);
  const indices = Array.from({ length: pool.length }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = indices[i] as number;
    indices[i] = indices[j] as number;
    indices[j] = a;
  }
  return pool[indices[offset] as number]?.id;
}

export function getDailyDua(now: Date = new Date()): DuaEntry | undefined {
  const id = getDailyDuaId(now);
  return id ? byId.get(id) : undefined;
}
