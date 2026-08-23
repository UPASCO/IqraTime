import { useMemo } from "react";

import type { SupportedLocale } from "@/config/appConfig";
import { getCorpusEntry, getTranslation, translationSources } from "@/data/corpus";
import { getQuranAyah, getQuranTranslationText, getQuranTranslationSourceId } from "@/data/quran";
import type { AyahId } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";

export interface AyahView {
  readonly found: boolean;
  readonly surah: number;
  readonly ayah: number;
  readonly arabicText?: string;
  readonly translationText?: string;
  readonly translatorLabel?: string;
  readonly themeLabels: readonly string[];
}

const NOT_FOUND: AyahView = { found: false, surah: 0, ayah: 0, themeLabels: [] };

export function useAyahView(ayahId: AyahId | undefined, locale: SupportedLocale): AyahView {
  const { t } = useI18n();

  return useMemo(() => {
    if (!ayahId) return NOT_FOUND;
    const entry = getCorpusEntry(ayahId);
    if (entry) {
      const translation = getTranslation(ayahId, locale);
      const source = translation ? translationSources.find((s) => s.id === translation.sourceId) : undefined;

      return {
        found: true,
        surah: entry.arabic.surah,
        ayah: entry.arabic.ayah,
        arabicText: entry.arabic.text,
        translationText: translation?.text,
        translatorLabel: source?.translatorName,
        themeLabels: entry.catalog.themes.map((theme) => t(`themes.names.${theme}` as Parameters<typeof t>[0])),
      };
    }

    // Not in the curated notification corpus (only 300 of the 6236 āyāt are)
    // — fall back to the full Qur'an reader's dataset so favoriting, sharing,
    // or viewing history for an āyah found via the reader still works.
    const fullAyah = getQuranAyah(ayahId);
    if (!fullAyah) return NOT_FOUND;

    const translationText = getQuranTranslationText(ayahId, locale);
    const sourceId = getQuranTranslationSourceId(locale);
    const source = sourceId ? translationSources.find((s) => s.id === sourceId) : undefined;

    return {
      found: true,
      surah: fullAyah.surah,
      ayah: fullAyah.ayah,
      arabicText: fullAyah.text,
      translationText,
      translatorLabel: source?.translatorName,
      themeLabels: [],
    };
  }, [ayahId, locale, t]);
}
