import { TIME_PERIOD_THEMES, timePeriodForHour } from "@/domain/constants";
import type { ThemeKey } from "@/domain/types";
import type { SelectableAyah } from "./filters";

const BASE_WEIGHT = 10;
const TIME_PERIOD_BOOST = 4;
const THEME_OVERUSE_PENALTY_PER_OCCURRENCE = 2;
const MIN_WEIGHT = 1;

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
