import type { SupportedLocale } from "@/config/appConfig";
import type { ArabicAyahText, AyahId, AyahTafsir, AyahTranslation, CatalogEntry } from "@/domain/types";
import arabicData from "./arabic.json";
import catalogData from "./catalog.json";
import { getCorpusEnvironment, isProductionCorpusBuild } from "./demoWarning";
import { arabicSourceInfo, translationSources, tafsirSources } from "./sources";

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

/**
 * The āyah used wherever the app needs one representative example — the
 * onboarding preview and the Diagnostics test notifications. 94:5 ("with
 * hardship comes ease") when the corpus has it: short, complete, and about
 * the most widely recognised line in the Qur'an; otherwise the first
 * notable entry, otherwise the first entry at all.
 */
export function getSampleAyahEntry(): CorpusEntry | undefined {
  const corpus = getRuntimeCorpus();
  return corpus.find((entry) => entry.arabic.id === "94:5") ?? corpus.find((entry) => entry.catalog.notable) ?? corpus[0];
}

/**
 * How many recent history entries the selection engine's anti-repeat
 * filter should exclude: one full rotation of the corpus, so no āyah
 * repeats until every other one has been shown.
 *
 * This used to be a user-facing "reduce repetition" number defaulting to
 * 30, which meant an āyah could come back after only 30 notifications —
 * about a day and a half at hourly delivery, and unmistakably repetitive.
 * It is derived rather than configurable now: there is no reason a user
 * would want *more* repetition, and the number was meaningless to them.
 * When a rotation is genuinely exhausted the engine's progressive
 * relaxation (selectionEngine.ts) drops this filter and the cycle
 * restarts, so this can never dead-end the feed.
 */
export function getAntiRepeatWindow(): number {
  return getRuntimeCorpus().length;
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
    case "nl": return require("./translations/nl.json");
    case "de": return require("./translations/de.json");
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

interface TafsirFileShape {
  readonly sourceId: string;
  readonly entries: readonly { readonly id: string; readonly text: string }[];
}

function buildTafsirMap(locale: SupportedLocale, file: TafsirFileShape): ReadonlyMap<AyahId, AyahTafsir> {
  return new Map(file.entries.map((entry) => [entry.id, { id: entry.id, locale, text: entry.text, sourceId: file.sourceId }]));
}

/**
 * Same lazy-load-on-first-use strategy as loadTranslationFile above. No
 * Portuguese case: no tafsir edition exists for it in the source dataset
 * (see scripts/fetchTafsir.mjs) — getTafsir() returns undefined for "pt"
 * and the UI shows an explicit "not available in this language" state
 * rather than silently substituting another language.
 */
function loadTafsirFile(locale: SupportedLocale): TafsirFileShape | undefined {
  switch (locale) {
    case "ar": return require("./tafsir/ar.json");
    case "en": return require("./tafsir/en.json");
    case "fr": return require("./tafsir/fr.json");
    case "es": return require("./tafsir/es.json");
    case "hi": return require("./tafsir/hi.json");
    case "bn": return require("./tafsir/bn.json");
    case "zh-CN": return require("./tafsir/zh-CN.json");
    case "it": return require("./tafsir/it.json");
    case "ru": return require("./tafsir/ru.json");
    default: return undefined;
  }
}

const tafsirCache = new Map<SupportedLocale, ReadonlyMap<AyahId, AyahTafsir>>();

function getTafsirTable(locale: SupportedLocale): ReadonlyMap<AyahId, AyahTafsir> | undefined {
  const cached = tafsirCache.get(locale);
  if (cached) return cached;
  const file = loadTafsirFile(locale);
  if (!file) return undefined;
  const table = buildTafsirMap(locale, file);
  tafsirCache.set(locale, table);
  return table;
}

export function getTafsir(id: AyahId, locale: SupportedLocale): AyahTafsir | undefined {
  return getTafsirTable(locale)?.get(id);
}

export { arabicSourceInfo, translationSources, tafsirSources, getCorpusEnvironment, isProductionCorpusBuild };
export type { CorpusEnvironment } from "./demoWarning";
