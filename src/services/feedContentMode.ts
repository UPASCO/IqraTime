import type { SupportedLocale } from "@/config/appConfig";
import { hasAnyHadithContent } from "@/data/corpus/hadith";
import type { ContentKinds, ContentMode } from "@/domain/types";

/** One entry kind in the swipeable feed and the notification queue. */
export type FeedKind = "ayah" | "hadith" | "name" | "dua";

/**
 * The fixed rotation order. A deterministic cycle — āyah, hadith, name,
 * dua, āyah, … restricted to the enabled kinds — keeps the mix
 * predictable and gives scripture the lead position, instead of a random
 * blend where three duas can land in a row.
 */
export const KIND_ROTATION: readonly FeedKind[] = ["ayah", "hadith", "name", "dua"];

/**
 * The kinds that can actually be honoured for a translation language:
 * hadith silently degrades off for a locale with no hadith edition
 * (see docs/CORPUS.md "Hadith") rather than producing empty slots, and a
 * stored value with nothing enabled falls back to āyāt so neither the
 * feed nor the scheduler can ever go silent. Used by the home feed and
 * the notification scheduler so both agree.
 */
export function effectiveContentKinds(kinds: ContentKinds, translationLocale: SupportedLocale): ContentKinds {
  const resolved: ContentKinds = {
    ...kinds,
    hadith: kinds.hadith && hasAnyHadithContent(translationLocale),
  };
  if (!resolved.ayah && !resolved.hadith && !resolved.name && !resolved.dua) {
    return { ...resolved, ayah: true };
  }
  return resolved;
}

/** The enabled kinds, in rotation order. Never empty for an effectiveContentKinds() result. */
export function enabledKinds(kinds: ContentKinds): FeedKind[] {
  return KIND_ROTATION.filter((kind) => kinds[kind]);
}

/**
 * Which kind comes next, given the enabled kinds and the previous entry's
 * kind: the next enabled kind in KIND_ROTATION order, wrapping around.
 * Starts at the first enabled kind (āyāt whenever they're on) when there
 * is no previous entry, and re-anchors there if the previous kind has
 * since been disabled.
 */
export function nextFeedKind(kinds: ContentKinds, lastKind: FeedKind | undefined): FeedKind {
  const enabled = enabledKinds(kinds);
  if (enabled.length === 0) return "ayah";
  if (!lastKind) return enabled[0] as FeedKind;
  const index = enabled.indexOf(lastKind);
  if (index === -1) return enabled[0] as FeedKind;
  return enabled[(index + 1) % enabled.length] as FeedKind;
}

/**
 * Maps the pre-2.1.0 three-way ContentMode onto ContentKinds, for
 * preference migration only. The old default "ayah_only" was a default,
 * not a choice — almost nobody ever touched the switch — so it maps to
 * the NEW default (everything on) rather than freezing every existing
 * user out of the 2.1.0 experience; the two explicit opt-ins keep their
 * meaning ("hadith_only" stays hadith-only, "mixed" becomes the full
 * rotation it was the closest expression of).
 */
export function legacyContentModeToKinds(mode: ContentMode): ContentKinds {
  if (mode === "hadith_only") return { ayah: false, hadith: true, name: false, dua: false };
  return { ayah: true, hadith: true, name: true, dua: true };
}
