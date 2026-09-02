import type { SupportedLocale } from "@/config/appConfig";
import { hasAnyHadithContent } from "@/data/corpus/hadith";
import type { ContentMode } from "@/domain/types";

export type FeedKind = "ayah" | "hadith";

/**
 * The content mode that can actually be honoured for a translation
 * language: hadith modes silently degrade to āyāt-only for a locale with
 * no hadith edition (es/pt/hi/it/zh-CN/nl/de — see docs/CORPUS.md
 * "Hadith") rather than producing empty or broken hadith slots. Used by
 * the home feed and by the notification scheduler so both agree.
 */
export function effectiveContentMode(contentMode: ContentMode, translationLocale: SupportedLocale): ContentMode {
  return contentMode === "ayah_only" || hasAnyHadithContent(translationLocale) ? contentMode : "ayah_only";
}

/**
 * Which kind of content comes next in the swipeable feed, given the
 * content-mode preference and the kind of the previous feed entry.
 * "mixed" alternates strictly — one hadith, one ayah, one hadith, ... —
 * never a random blend, and starts with an ayah when there is no previous
 * entry yet.
 */
export function nextFeedKind(contentMode: ContentMode, lastKind: FeedKind | undefined): FeedKind {
  if (contentMode === "hadith_only") return "hadith";
  if (contentMode === "ayah_only") return "ayah";
  return lastKind === "ayah" ? "hadith" : "ayah";
}
