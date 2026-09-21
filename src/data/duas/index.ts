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
  /** Per-locale translations. The quranic entries carry every reader edition (11 locales); the Hisn-style entries only exist in English. */
  readonly translation?: { readonly [locale: string]: string | undefined };
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
 * The dua text's translation for the reader: their own language whenever
 * a real licensed edition exists (the quranic entries carry all 11 reader
 * editions), English otherwise. English is the only translated edition
 * for the Hisn-style entries — shown to other locales as an explicit
 * fallback, same policy as the hadith corpus's language gaps
 * (docs/CORPUS.md), never a silent substitution. Use isDuaTranslationFallback
 * to surface the notice.
 */
export function duaTranslationFor(dua: DuaEntry, locale: string): string | undefined {
  return dua.translation?.[locale] ?? dua.translation?.en ?? dua.translation?.fr;
}

/** True when duaTranslationFor had to fall back to another language for this reader. */
export function isDuaTranslationFallback(dua: DuaEntry, locale: string): boolean {
  return locale !== "en" && !!duaTranslationFor(dua, locale) && !dua.translation?.[locale];
}

/**
 * The entries a reader of `locale` can be SERVED without a language
 * fallback: everything for Arabic readers (the Arabic is the original
 * text), otherwise only entries carrying a real translation in that
 * locale — 13 fully-localized quranic duas everywhere, the full 110 for
 * English. The feed rotation and the notification pools draw from this,
 * so nothing lands on a lock screen or a feed slide in the wrong
 * language; the LIBRARY still lists all 110 with the explicit
 * English-fallback notice.
 */
export function duasTranslatedFor(locale: string): readonly DuaEntry[] {
  if (locale === "ar") return entries;
  const translated = entries.filter((entry) => entry.translation?.[locale]);
  return translated.length > 0 ? translated : entries.filter((entry) => entry.translation?.en);
}

/**
 * The source line for display. The dataset stores it verbatim; this only
 * strips the upstream "HR." prefix (Indonesian "Hadits Riwayat" — the
 * fitrahive dataset's citation convention), which reads as noise in every
 * other language. Purely presentational — the citation itself is untouched.
 */
export function duaSourceLabel(dua: DuaEntry): string | undefined {
  return dua.source?.replace(/^HR\.?\s+/, "");
}

/** Same local-calendar day arithmetic as the daily āyah/name. */
function localDayNumber(now: Date): number {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

/**
 * Entries suitable for a one-glance daily notification: readable in the
 * reader's own language (see duasTranslatedFor), and short enough that
 * the lock screen shows the whole text rather than the first line of a
 * multi-verse passage.
 */
const DAILY_POOL_MAX_ARABIC = 340;

export function getDailyDuaPool(locale: string = "en"): readonly DuaEntry[] {
  return duasTranslatedFor(locale).filter((entry) => entry.arabic.length <= DAILY_POOL_MAX_ARABIC);
}

/**
 * The invocation of the day — deterministic and identical for every user
 * of the same language on the same local calendar day, exactly like the
 * daily āyah: a seeded shuffle over the pool per period of pool-length
 * days, so every dua appears exactly once before any repeats.
 */
export function getDailyDuaId(now: Date = new Date(), locale: string = "en"): string | undefined {
  const pool = getDailyDuaPool(locale);
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

export function getDailyDua(now: Date = new Date(), locale: string = "en"): DuaEntry | undefined {
  const id = getDailyDuaId(now, locale);
  return id ? byId.get(id) : undefined;
}
