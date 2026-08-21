import { useMemo } from "react";

import type { SupportedLocale } from "@/config/appConfig";
import { getHadithEntry, getHadithTranslation, hadithTranslationSources } from "@/data/corpus/hadith";
import type { HadithId } from "@/domain/types";

export interface HadithView {
  readonly found: boolean;
  readonly collection: string;
  readonly collectionDisplayName: string;
  readonly hadithNumber: number;
  readonly arabicText?: string;
  readonly translationText?: string;
  readonly translatorLabel?: string;
}

const NOT_FOUND: HadithView = { found: false, collection: "", collectionDisplayName: "", hadithNumber: 0 };

export function useHadithView(hadithId: HadithId | undefined, locale: SupportedLocale): HadithView {
  return useMemo(() => {
    if (!hadithId) return NOT_FOUND;
    const entry = getHadithEntry(hadithId);
    if (!entry) return NOT_FOUND;

    const translation = getHadithTranslation(hadithId, locale);
    const source = translation ? hadithTranslationSources.find((s) => s.id === translation.sourceId) : undefined;

    return {
      found: true,
      collection: entry.arabic.collection,
      collectionDisplayName: entry.arabic.collectionDisplayName,
      hadithNumber: entry.arabic.hadithNumber,
      arabicText: entry.arabic.text,
      translationText: translation?.text,
      translatorLabel: source?.translationTitle,
    };
  }, [hadithId, locale]);
}
