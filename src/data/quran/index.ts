import type { SupportedLocale } from "@/config/appConfig";
import { makeAyahId, type AyahId } from "@/domain/types";
import type { SurahMeta, QuranAyahText } from "@/domain/quran";
import arabicData from "./arabic.json";
import surahsData from "./surahs.json";

/**
 * The complete Qur'an (114 surahs, 6236 āyāt) for the full-Qur'an reader —
 * entirely separate from src/data/corpus/, the curated 300-āyah set used
 * for notifications. Nothing here feeds the notification/selection engine;
 * this module exists purely so a reader can show every surah in full and so
 * an āyah shown anywhere in the app (from the curated set or not) can be
 * located here — see useAyahView's fallback to this module.
 */

interface SurahsFileShape {
  readonly surahs: readonly SurahMeta[];
}

const surahList: readonly SurahMeta[] = (surahsData as SurahsFileShape).surahs;
const surahByNumber = new Map(surahList.map((s) => [s.number, s]));

export function getSurahList(): readonly SurahMeta[] {
  return surahList;
}

export function getSurahMeta(surah: number): SurahMeta | undefined {
  return surahByNumber.get(surah);
}

interface ArabicEntryShape {
  readonly surah: number;
  readonly ayah: number;
  readonly text: string;
}

const arabicEntries: readonly ArabicEntryShape[] = (arabicData as { entries: readonly ArabicEntryShape[] }).entries;

const arabicById = new Map<AyahId, QuranAyahText>(
  arabicEntries.map((e) => [makeAyahId(e), { id: makeAyahId(e), surah: e.surah, ayah: e.ayah, text: e.text }]),
);

const arabicBySurah = new Map<number, QuranAyahText[]>();
for (const entry of arabicById.values()) {
  const list = arabicBySurah.get(entry.surah) ?? [];
  list.push(entry);
  arabicBySurah.set(entry.surah, list);
}
for (const list of arabicBySurah.values()) list.sort((a, b) => a.ayah - b.ayah);

/** All āyāt of one surah, in order. Empty array for an out-of-range surah number. */
export function getSurahAyat(surah: number): readonly QuranAyahText[] {
  return arabicBySurah.get(surah) ?? [];
}

export function getQuranAyah(id: AyahId): QuranAyahText | undefined {
  return arabicById.get(id);
}

interface TranslationFileShape {
  readonly sourceId: string;
  readonly entries: readonly { readonly surah: number; readonly ayah: number; readonly text: string }[];
}

/**
 * Same lazy-load-on-first-use strategy as src/data/corpus/index.ts's
 * loadTranslationFile — these files are ~1-2MB each across 11 locales, so
 * parsing all of them at import time would be wasted work on every cold
 * start when at most one is actually read.
 */
function loadTranslationFile(locale: SupportedLocale): TranslationFileShape | undefined {
  switch (locale) {
    case "en": return require("./translations/en.json");
    case "fr": return require("./translations/fr.json");
    case "es": return require("./translations/es.json");
    case "pt": return require("./translations/pt.json");
    case "hi": return require("./translations/hi.json");
    case "bn": return require("./translations/bn.json");
    case "zh-CN": return require("./translations/zh-CN.json");
    case "it": return require("./translations/it.json");
    case "ru": return require("./translations/ru.json");
    case "nl": return require("./translations/nl.json");
    case "de": return require("./translations/de.json");
    // Arabic readers get the Arabic source text itself, not a translation.
    default: return undefined;
  }
}

const translationCache = new Map<SupportedLocale, { sourceId: string; byId: ReadonlyMap<AyahId, string> }>();

function getTranslationTable(locale: SupportedLocale): { sourceId: string; byId: ReadonlyMap<AyahId, string> } | undefined {
  const cached = translationCache.get(locale);
  if (cached) return cached;
  const file = loadTranslationFile(locale);
  if (!file) return undefined;
  const byId = new Map(file.entries.map((e) => [makeAyahId(e), e.text]));
  const table = { sourceId: file.sourceId, byId };
  translationCache.set(locale, table);
  return table;
}

export function getQuranTranslationText(id: AyahId, locale: SupportedLocale): string | undefined {
  return getTranslationTable(locale)?.byId.get(id);
}

export function getQuranTranslationSourceId(locale: SupportedLocale): string | undefined {
  return getTranslationTable(locale)?.sourceId;
}

export function hasQuranTranslation(locale: SupportedLocale): boolean {
  return !!getTranslationTable(locale);
}
