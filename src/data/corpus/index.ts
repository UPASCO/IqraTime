import type { SupportedLocale } from "@/config/appConfig";
import type { ArabicAyahText, AyahId, AyahTranslation, CatalogEntry } from "@/domain/types";
import arabicData from "./arabic.json";
import catalogData from "./catalog.json";
import { getCorpusEnvironment, isProductionCorpusBuild } from "./demoWarning";
import { arabicSourceInfo, translationSources } from "./sources";
import enTranslations from "./translations/en.json";
import frTranslations from "./translations/fr.json";
import esTranslations from "./translations/es.json";
import ptTranslations from "./translations/pt.json";
import hiTranslations from "./translations/hi.json";
import bnTranslations from "./translations/bn.json";
import zhCNTranslations from "./translations/zh-CN.json";
import itTranslations from "./translations/it.json";
import ruTranslations from "./translations/ru.json";

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

export function getCorpusEntry(id: AyahId): CorpusEntry | undefined {
  return allEntries.find((entry) => entry.arabic.id === id);
}

interface TranslationFileShape {
  readonly sourceId: string;
  readonly entries: readonly { readonly id: string; readonly text: string }[];
}

function buildTranslationMap(locale: SupportedLocale, file: TranslationFileShape): ReadonlyMap<AyahId, AyahTranslation> {
  return new Map(file.entries.map((entry) => [entry.id, { id: entry.id, locale, text: entry.text, sourceId: file.sourceId }]));
}

/**
 * Per-locale translation lookup tables. See docs/TRANSLATIONS.md and
 * scripts/importTranslation.ts for how these files are produced; Metro
 * requires each one to be statically imported above (dynamic
 * `require`/`import` of a locale-dependent path is not supported).
 */
const translationsByLocale: Partial<Record<SupportedLocale, ReadonlyMap<AyahId, AyahTranslation>>> = {
  en: buildTranslationMap("en", enTranslations),
  fr: buildTranslationMap("fr", frTranslations),
  es: buildTranslationMap("es", esTranslations),
  pt: buildTranslationMap("pt", ptTranslations),
  hi: buildTranslationMap("hi", hiTranslations),
  bn: buildTranslationMap("bn", bnTranslations),
  "zh-CN": buildTranslationMap("zh-CN", zhCNTranslations),
  it: buildTranslationMap("it", itTranslations),
  ru: buildTranslationMap("ru", ruTranslations),
};

export function getTranslation(id: AyahId, locale: SupportedLocale): AyahTranslation | undefined {
  return translationsByLocale[locale]?.get(id);
}

export function hasAnyTranslations(locale: SupportedLocale): boolean {
  const table = translationsByLocale[locale];
  return !!table && table.size > 0;
}

export { arabicSourceInfo, translationSources, getCorpusEnvironment, isProductionCorpusBuild };
export type { CorpusEnvironment } from "./demoWarning";
