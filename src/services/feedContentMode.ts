import type { ContentMode } from "@/domain/types";

export type FeedKind = "ayah" | "hadith";

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
