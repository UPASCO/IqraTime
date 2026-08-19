import type { SupportedLocale } from "@/config/appConfig";
import type { ArabicAyahText, AyahId, AyahTranslation, CatalogEntry } from "@/domain/types";
import arabicData from "./arabic.json";
import catalogData from "./catalog.json";
import { getCorpusEnvironment, isProductionCorpusBuild } from "./demoWarning";
import { arabicSourceInfo, translationSources } from "./sources";

export interface CorpusEntry {
  readonly arabic: ArabicAyahText;
  readonly catalog: CatalogEntry;
}

const arabicEntries = arabicData.entries as readonly ArabicAyahText[];
const catalogEntries = catalogData.entries as readonly CatalogEntry[];

const arabicById = new Map(arabicEntries.map((entry) => [entry.id, entry]));

function buildCorpus(): CorpusEntry[] {
  const entries: CorpusEntry[] = [];
  for (const catalog of catalogEntries) {
    const arabic = arabicById.get(catalog.id);
    if (!arabic) {
      // Integrity is enforced by scripts/validateCorpus.ts; at runtime we
      // simply skip an entry that can't be resolved rather than crash.
      continue;
    }
    entries.push({ arabic, catalog });
  }
  return entries;
}

const allEntries: readonly CorpusEntry[] = buildCorpus();

/** Every catalog entry, regardless of editorial status. Use for admin/dev tooling only. */
export function getFullCorpus(): readonly CorpusEntry[] {
  return allEntries;
}

/** Only entries whose editorial status is "publishable". This is what a production build must be limited to. */
export function getPublishableCorpus(): readonly CorpusEntry[] {
  return allEntries.filter((entry) => entry.catalog.status === "publishable");
}

/**
 * The corpus the running app should actually select from: publishable-only
 * when EXPO_PUBLIC_CORPUS_ENV=production, everything (including drafts)
 * otherwise — so development builds can exercise the full pipeline while
 * production is hard-limited to reviewed content.
 */
export function getRuntimeCorpus(): readonly CorpusEntry[] {
  return isProductionCorpusBuild() ? getPublishableCorpus() : allEntries;
}

const entriesById = new Map(allEntries.map((entry) => [entry.arabic.id, entry]));

export function getCorpusEntry(id: AyahId): CorpusEntry | undefined {
  // Map lookup rather than a linear scan: this is called once per notification
  // slot and once per history row, over a corpus of several thousand āyāt.
  return entriesById.get(id);
}

interface TranslationFileShape {
  readonly sourceId: string;
  readonly entries: readonly { readonly id: string; readonly text: string }[];
}

function buildTranslationMap(locale: SupportedLocale, file: TranslationFileShape): ReadonlyMap<AyahId, AyahTranslation> {
  return new Map(file.entries.map((entry) => [entry.id, { id: entry.id, locale, text: entry.text, sourceId: file.sourceId }]));
}

/**
 * Loads one locale's translation file. Each path is a literal so Metro can
 * still resolve it statically, but the `require` runs on first use rather
 * than at import time — the app only ever reads the user's chosen
 * translation locale, and eagerly parsing all nine files (several MB of
 * JSON across a few thousand āyāt) would be paid on every cold start.
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
    // Arabic readers get the Arabic source text itself, not a translation.
    default: return undefined;
  }
}

const translationCache = new Map<SupportedLocale, ReadonlyMap<AyahId, AyahTranslation>>();

function getTranslationTable(locale: SupportedLocale): ReadonlyMap<AyahId, AyahTranslation> | undefined {
  const cached = translationCache.get(locale);
  if (cached) return cached;
  const file = loadTranslationFile(locale);
  if (!file) return undefined;
  const table = buildTranslationMap(locale, file);
  translationCache.set(locale, table);
  return table;
}

export function getTranslation(id: AyahId, locale: SupportedLocale): AyahTranslation | undefined {
  return getTranslationTable(locale)?.get(id);
}

export function hasAnyTranslations(locale: SupportedLocale): boolean {
  const table = getTranslationTable(locale);
  return !!table && table.size > 0;
}

export { arabicSourceInfo, translationSources, getCorpusEnvironment, isProductionCorpusBuild };
export type { CorpusEnvironment } from "./demoWarning";
