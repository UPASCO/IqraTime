import type { SupportedLocale } from "@/config/appConfig";
import type { ArabicHadithText, HadithCatalogEntry, HadithId, HadithTranslation } from "@/domain/types";
import arabicData from "./arabic.json";
import catalogData from "./catalog.json";
import { isProductionCorpusBuild } from "../demoWarning";
import { hadithTranslationSources } from "../sources";

export interface HadithEntry {
  readonly arabic: ArabicHadithText;
  readonly catalog: HadithCatalogEntry;
}

const arabicEntries = arabicData.entries as readonly ArabicHadithText[];
const catalogEntries = catalogData.entries as readonly HadithCatalogEntry[];
const arabicById = new Map(arabicEntries.map((entry) => [entry.id, entry]));

function buildHadithCorpus(): HadithEntry[] {
  const entries: HadithEntry[] = [];
  for (const catalog of catalogEntries) {
    const arabic = arabicById.get(catalog.id);
    if (!arabic) continue;
    entries.push({ arabic, catalog });
  }
  return entries;
}

const allEntries: readonly HadithEntry[] = buildHadithCorpus();

export function getFullHadithCorpus(): readonly HadithEntry[] {
  return allEntries;
}

export function getPublishableHadithCorpus(): readonly HadithEntry[] {
  return allEntries.filter((entry) => entry.catalog.status === "publishable");
}

/** Same production/development gating as getRuntimeCorpus() for the ayah corpus. */
export function getRuntimeHadithCorpus(): readonly HadithEntry[] {
  return isProductionCorpusBuild() ? getPublishableHadithCorpus() : allEntries;
}

const entriesById = new Map(allEntries.map((entry) => [entry.arabic.id, entry]));

export function getHadithEntry(id: HadithId): HadithEntry | undefined {
  return entriesById.get(id);
}

interface HadithTranslationFileShape {
  readonly sourceId: string;
  readonly entries: readonly { readonly id: string; readonly text: string }[];
}

function buildTranslationMap(locale: SupportedLocale, file: HadithTranslationFileShape): ReadonlyMap<HadithId, HadithTranslation> {
  return new Map(file.entries.map((entry) => [entry.id, { id: entry.id, locale, text: entry.text, sourceId: file.sourceId }]));
}

/**
 * Only en/fr/bn/ru have a translation file — no hadith edition exists for
 * ar (Arabic readers use arabic.json itself), es, pt, hi, it, or zh-CN in
 * the source dataset (see scripts/buildHadithCorpus.mjs). getHadithTranslation()
 * returns undefined for those, and the UI shows an explicit "not available
 * in this language" state rather than silently substituting another one.
 */
function loadTranslationFile(locale: SupportedLocale): HadithTranslationFileShape | undefined {
  switch (locale) {
    case "en": return require("./translations/en.json");
    case "fr": return require("./translations/fr.json");
    case "bn": return require("./translations/bn.json");
    case "ru": return require("./translations/ru.json");
    default: return undefined;
  }
}

const translationCache = new Map<SupportedLocale, ReadonlyMap<HadithId, HadithTranslation>>();

function getTranslationTable(locale: SupportedLocale): ReadonlyMap<HadithId, HadithTranslation> | undefined {
  const cached = translationCache.get(locale);
  if (cached) return cached;
  const file = loadTranslationFile(locale);
  if (!file) return undefined;
  const table = buildTranslationMap(locale, file);
  translationCache.set(locale, table);
  return table;
}

export function getHadithTranslation(id: HadithId, locale: SupportedLocale): HadithTranslation | undefined {
  return getTranslationTable(locale)?.get(id);
}

/** Whether the hadith feature has any text at all (Arabic or a translation) for this locale. */
export function hasAnyHadithContent(locale: SupportedLocale): boolean {
  if (locale === "ar") return true;
  const table = getTranslationTable(locale);
  return !!table && table.size > 0;
}

export { hadithTranslationSources };
