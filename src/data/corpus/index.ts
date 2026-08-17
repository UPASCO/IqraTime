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

export function getCorpusEntry(id: AyahId): CorpusEntry | undefined {
  return allEntries.find((entry) => entry.arabic.id === id);
}

/**
 * Per-locale translation lookup tables. Empty until a real, licensed
 * translation file is imported via scripts/importTranslation.ts — see
 * docs/TRANSLATIONS.md. When a translation/<locale>.json file is added,
 * import it here explicitly (Metro requires static imports) following the
 * commented example below.
 */
const translationsByLocale: Partial<Record<SupportedLocale, ReadonlyMap<AyahId, AyahTranslation>>> = {
  // Example once a real file exists:
  // import enTranslations from "./translations/en.json";
  // en: new Map(enTranslations.entries.map((e) => [e.id, { id: e.id, locale: "en", text: e.text, sourceId: enTranslations.sourceId }])),
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
