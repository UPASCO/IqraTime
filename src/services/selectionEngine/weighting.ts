import { TIME_PERIOD_THEMES, timePeriodForHour } from "@/domain/constants";
import type { ThemeKey } from "@/domain/types";
import type { SelectableAyah } from "./filters";

const BASE_WEIGHT = 10;
const TIME_PERIOD_BOOST = 4;
const THEME_OVERUSE_PENALTY_PER_OCCURRENCE = 2;
const MIN_WEIGHT = 1;

/**
 * Applied to `catalog.notable` āyāt — the ~165 widely-recognised ones (see
 * CatalogEntry.notable). Deliberately large relative to BASE_WEIGHT: it
 * makes a notable āyah roughly 4x likelier per draw, so a fresh rotation
 * front-loads āyāt the user is most likely to recognise on sight. It stays
 * a weight rather than a filter, so with the anti-repeat window covering
 * the whole corpus the remaining āyāt are still all reached before
 * anything repeats — they just tend to come later in the cycle.
 */
const NOTABLE_BOOST = 30;

export interface WeightingOptions {
  readonly localHour: number;
  /** Themes of the most recent N history entries, most recent last — used to keep rotation balanced (spec 12: "no theme should monopolize rotation"). */
  readonly recentThemes: readonly ThemeKey[];
}

/** Step 9: moderate temporal weighting + theme-rotation balancing. Never a hard filter — always leaves every candidate selectable. */
export function computeWeights(items: readonly SelectableAyah[], options: WeightingOptions): number[] {
  const periodThemes = new Set(TIME_PERIOD_THEMES[timePeriodForHour(options.localHour)]);
  const recentThemeCounts = new Map<ThemeKey, number>();
  for (const theme of options.recentThemes) {
    recentThemeCounts.set(theme, (recentThemeCounts.get(theme) ?? 0) + 1);
  }

  return items.map((item) => {
    let weight = BASE_WEIGHT;

    if (item.entry.catalog.notable) {
      weight += NOTABLE_BOOST;
    }

    if (item.entry.catalog.themes.some((theme) => periodThemes.has(theme))) {
      weight += TIME_PERIOD_BOOST;
    }

    const maxOveruse = Math.max(
      0,
      ...item.entry.catalog.themes.map((theme) => recentThemeCounts.get(theme) ?? 0),
    );
    weight -= maxOveruse * THEME_OVERUSE_PENALTY_PER_OCCURRENCE;

    return Math.max(MIN_WEIGHT, weight);
  });
}
