import type { SupportedLocale } from "@/config/appConfig";
import type { CorpusEntry } from "@/data/corpus";
import type { AyahTranslation, SelectionMode, ThemeKey } from "@/domain/types";
import {
  buildSelectable,
  filterByLength,
  filterByThemes,
  filterFavoritesOnly,
  filterHidden,
  filterLastSurah,
  filterRecentHistory,
  type SelectableAyah,
} from "./filters";
import { mulberry32, weightedPick, type RandomFn } from "./rng";
import { computeWeights } from "./weighting";

export interface SelectionInput {
  readonly corpus: readonly CorpusEntry[];
  readonly getTranslation: (id: string, locale: SupportedLocale) => AyahTranslation | undefined;
  readonly translationLocale: SupportedLocale;
  readonly showArabic: boolean;
  readonly requireTranslation: boolean;
  readonly localHour: number;
  readonly selectedThemes: readonly ThemeKey[];
  readonly recentAyahIds: readonly string[];
  readonly recentThemes: readonly ThemeKey[];
  readonly favoriteAyahIds: readonly string[];
  readonly hiddenAyahIds: readonly string[];
  readonly maxLength: number;
  readonly mode: SelectionMode;
  readonly lastSurah?: number;
  /** Injectable seed for deterministic tests. Omit in production to derive from Date.now(). */
  readonly randomSeed?: number;
}

export type SelectionResult =
  | {
      readonly status: "selected";
      readonly ayahId: string;
      readonly entry: CorpusEntry;
      readonly translation: AyahTranslation | undefined;
      /** Non-empty when one or more non-critical filters had to be relaxed to find a candidate — surfaced in Diagnostics. */
      readonly relaxedFilters: readonly string[];
    }
  | {
      readonly status: "no_candidates";
      readonly relaxedFilters: readonly string[];
    };

/**
 * Selects one ayah for a notification slot or an "another ayah" tap.
 *
 * Implements spec section 12 step-by-step, including the anti-repetition
 * rules and the progressive-relaxation fallback strategy: when the full
 * filter set yields no candidates, filters are dropped one at a time —
 * least important first — logging each relaxation, rather than looping
 * forever or crashing. The length filter is relaxed only as a last resort,
 * and even then the ayah text itself is never truncated — a longer ayah is
 * simply allowed to be selected rather than cut short.
 *
 * Order of relaxation: last-surah repeat → selected themes → recent-history
 * anti-repeat → explicitly hidden ayat → maximum length → required
 * translation (falls back to Arabic-only).
 */
export function selectAyah(input: SelectionInput): SelectionResult {
  const random: RandomFn = mulberry32(input.randomSeed ?? Date.now());
  const relaxed: string[] = [];

  const hiddenSet = new Set(input.hiddenAyahIds);
  const recentSet = new Set(input.recentAyahIds);
  const favoriteSet = new Set(input.favoriteAyahIds);

  const base = buildSelectable(input.corpus, {
    translationLocale: input.translationLocale,
    getTranslation: input.getTranslation,
    requireTranslation: input.requireTranslation,
    includeArabicLength: input.showArabic,
    includeTranslationLength: input.requireTranslation || !input.showArabic,
  });

  const attempt = (opts: {
    applyHidden: boolean;
    applyRecent: boolean;
    applyThemes: boolean;
    applyLastSurah: boolean;
    applyLength: boolean;
    requireTranslation: boolean;
  }): SelectableAyah[] => {
    let pool = opts.requireTranslation === input.requireTranslation
      ? base
      : buildSelectable(input.corpus, {
          translationLocale: input.translationLocale,
          getTranslation: input.getTranslation,
          requireTranslation: opts.requireTranslation,
          includeArabicLength: input.showArabic,
          includeTranslationLength: opts.requireTranslation || !input.showArabic,
        });

    if (input.mode === "favorites_only") {
      pool = filterFavoritesOnly(pool, favoriteSet);
    }
    if (opts.applyHidden) pool = filterHidden(pool, hiddenSet);
    if (opts.applyRecent) pool = filterRecentHistory(pool, recentSet);
    if (opts.applyThemes && (input.mode === "chosen_themes" || input.selectedThemes.length > 0)) {
      pool = filterByThemes(pool, input.selectedThemes);
    }
    if (opts.applyLastSurah) pool = filterLastSurah(pool, input.lastSurah);
    if (opts.applyLength) pool = filterByLength(pool, input.maxLength);
    return pool;
  };

  const stages: { label: string; opts: Parameters<typeof attempt>[0] }[] = [
    { label: "full", opts: { applyHidden: true, applyRecent: true, applyThemes: true, applyLastSurah: true, applyLength: true, requireTranslation: input.requireTranslation } },
    { label: "last_surah_repeat_allowed", opts: { applyHidden: true, applyRecent: true, applyThemes: true, applyLastSurah: false, applyLength: true, requireTranslation: input.requireTranslation } },
    { label: "theme_filter_relaxed", opts: { applyHidden: true, applyRecent: true, applyThemes: false, applyLastSurah: false, applyLength: true, requireTranslation: input.requireTranslation } },
    { label: "recent_history_repeat_allowed", opts: { applyHidden: true, applyRecent: false, applyThemes: false, applyLastSurah: false, applyLength: true, requireTranslation: input.requireTranslation } },
    { label: "hidden_ayat_included", opts: { applyHidden: false, applyRecent: false, applyThemes: false, applyLastSurah: false, applyLength: true, requireTranslation: input.requireTranslation } },
    { label: "length_limit_relaxed", opts: { applyHidden: false, applyRecent: false, applyThemes: false, applyLastSurah: false, applyLength: false, requireTranslation: input.requireTranslation } },
    { label: "translation_requirement_relaxed_arabic_only", opts: { applyHidden: false, applyRecent: false, applyThemes: false, applyLastSurah: false, applyLength: false, requireTranslation: false } },
  ];

  let pool: SelectableAyah[] = [];
  let found = false;
  for (const stage of stages) {
    pool = attempt(stage.opts);
    if (pool.length > 0) {
      if (stage.label !== "full") relaxed.push(stage.label);
      found = true;
      break;
    }
  }

  if (!found) {
    // Every stage — including the final, most relaxed one — yielded nothing.
    // This only happens with an empty or exhaustively-excluded corpus.
    return { status: "no_candidates", relaxedFilters: stages.map((s) => s.label) };
  }

  const weights = computeWeights(pool, { localHour: input.localHour, recentThemes: input.recentThemes });
  const picked = weightedPick(pool, weights, random);

  // Final consistency check (spec 12 step 14): the id must resolve back to
  // exactly the arabic/translation pair we just picked from.
  if (picked.entry.arabic.id !== picked.entry.catalog.id) {
    throw new Error(`Corpus consistency error: arabic id "${picked.entry.arabic.id}" != catalog id "${picked.entry.catalog.id}"`);
  }
  if (picked.translation && picked.translation.id !== picked.entry.arabic.id) {
    throw new Error(`Corpus consistency error: translation id "${picked.translation.id}" != ayah id "${picked.entry.arabic.id}"`);
  }

  return {
    status: "selected",
    ayahId: picked.entry.arabic.id,
    entry: picked.entry,
    translation: picked.translation,
    relaxedFilters: relaxed.filter((label) => label !== "full"),
  };
}
