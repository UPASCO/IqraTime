import type { SupportedLocale } from "@/config/appConfig";
import type { CorpusEntry } from "@/data/corpus";
import type { AyahTranslation, ThemeKey } from "@/domain/types";

export interface SelectableAyah {
  readonly entry: CorpusEntry;
  readonly translation: AyahTranslation | undefined;
  readonly displayLength: number;
}

export interface BuildSelectableOptions {
  readonly translationLocale: SupportedLocale;
  readonly getTranslation: (id: string, locale: SupportedLocale) => AyahTranslation | undefined;
  readonly requireTranslation: boolean;
  readonly includeArabicLength: boolean;
  readonly includeTranslationLength: boolean;
}

/** Step 2-4: resolve translations, verify completeness, and compute the display length used for the length filter. */
export function buildSelectable(entries: readonly CorpusEntry[], options: BuildSelectableOptions): SelectableAyah[] {
  const result: SelectableAyah[] = [];
  for (const entry of entries) {
    if (!entry.arabic.text.trim()) continue; // never select an entry with incomplete Arabic text

    const translation = options.getTranslation(entry.arabic.id, options.translationLocale);
    if (options.requireTranslation && (!translation || !translation.text.trim())) continue;

    let length = 0;
    if (options.includeArabicLength) length += entry.arabic.text.length;
    if (options.includeTranslationLength && translation) length += translation.text.length;
    if (!options.includeArabicLength && !options.includeTranslationLength) {
      length = translation?.text.length ?? entry.arabic.text.length;
    }

    result.push({ entry, translation, displayLength: length });
  }
  return result;
}

/** Step 5: exclude ayat exceeding the maximum notification length. Never truncates — excludes instead. */
export function filterByLength(items: readonly SelectableAyah[], maxLength: number): SelectableAyah[] {
  return items.filter((item) => item.displayLength <= maxLength);
}

/** Step 6: exclude ayat the user has explicitly hidden. */
export function filterHidden(items: readonly SelectableAyah[], hiddenAyahIds: ReadonlySet<string>): SelectableAyah[] {
  return items.filter((item) => !hiddenAyahIds.has(item.entry.arabic.id));
}

/** Step 7: exclude ayat present in the anti-repeat window, when enough alternatives remain. */
export function filterRecentHistory(items: readonly SelectableAyah[], recentAyahIds: ReadonlySet<string>): SelectableAyah[] {
  return items.filter((item) => !recentAyahIds.has(item.entry.arabic.id));
}

/** Step 8: restrict to the user's chosen themes, when any are selected. */
export function filterByThemes(items: readonly SelectableAyah[], selectedThemes: readonly ThemeKey[]): SelectableAyah[] {
  if (selectedThemes.length === 0) return items.slice();
  const themeSet = new Set(selectedThemes);
  return items.filter((item) => item.entry.catalog.themes.some((theme) => themeSet.has(theme)));
}

/** Restrict to only the user's favorited ayat (favorites_only selection mode). */
export function filterFavoritesOnly(items: readonly SelectableAyah[], favoriteAyahIds: ReadonlySet<string>): SelectableAyah[] {
  return items.filter((item) => favoriteAyahIds.has(item.entry.arabic.id));
}

/** Avoid repeating the same surah as the immediately preceding notification, when alternatives exist. */
export function filterLastSurah(items: readonly SelectableAyah[], lastSurah: number | undefined): SelectableAyah[] {
  if (lastSurah == null) return items.slice();
  const filtered = items.filter((item) => item.entry.arabic.surah !== lastSurah);
  return filtered.length > 0 ? filtered : items.slice();
}
