import type { SupportedLocale } from "@/config/appConfig";
import type { HadithEntry } from "@/data/corpus/hadith";
import type { HadithTranslation, TextDisplayMode } from "@/domain/types";
import type { RandomFn } from "@/services/selectionEngine";

export interface HadithPickInput {
  readonly corpus: readonly HadithEntry[];
  readonly getTranslation: (id: string, locale: SupportedLocale) => HadithTranslation | undefined;
  readonly locale: SupportedLocale;
  readonly displayMode: TextDisplayMode;
  /** Hadith already waiting in the queue — never repeated while still pending. */
  readonly excludeIds: ReadonlySet<string>;
  /** Preferred upper bound on the body text; relaxed when nothing shorter is left. */
  readonly maxLength: number;
  readonly random: RandomFn;
}

export interface HadithPickResult {
  readonly hadithId: string;
  /** Non-empty when a preference had to be relaxed to find a candidate — mirrors selectAyah()'s relaxedFilters. */
  readonly relaxedFilters: readonly string[];
}

/**
 * Picks one hadith for a notification slot. A deliberately small cousin of
 * the āyah selection engine: hadith carry no theme preference, no
 * time-of-day weighting and no persisted history, so this is a uniform
 * draw over what can actually be shown, with the same progressive
 * relaxation so it never dead-ends — length first, then the "already
 * queued" exclusion.
 *
 * "What can be shown" follows formatHadithNotificationBody: the
 * translation is the body unless the user reads Arabic only, in which
 * case the Arabic text (isnad included) is. A hadith with no text in the
 * body's language is never a candidate.
 */
export function pickHadithForNotification(input: HadithPickInput): HadithPickResult | null {
  const showable = input.corpus.flatMap((entry) => {
    const useArabic = input.displayMode === "arabic_only" || input.locale === "ar";
    const body = useArabic ? entry.arabic.text : input.getTranslation(entry.arabic.id, input.locale)?.text;
    if (!body?.trim()) return [];
    return [{ id: entry.arabic.id, length: body.length }];
  });
  if (showable.length === 0) return null;

  const stages: { readonly label: string; readonly pool: readonly { id: string; length: number }[] }[] = [
    { label: "full", pool: showable.filter((c) => !input.excludeIds.has(c.id) && c.length <= input.maxLength) },
    { label: "length_limit_relaxed", pool: showable.filter((c) => !input.excludeIds.has(c.id)) },
    { label: "queued_repeat_allowed", pool: showable },
  ];

  for (const stage of stages) {
    if (stage.pool.length === 0) continue;
    const index = Math.min(stage.pool.length - 1, Math.floor(input.random() * stage.pool.length));
    const picked = stage.pool[index];
    if (!picked) continue;
    return { hadithId: picked.id, relaxedFilters: stage.label === "full" ? [] : [stage.label] };
  }
  return null;
}
