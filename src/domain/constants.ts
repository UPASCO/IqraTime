import type { ThemeKey, TimePeriod } from "./types";

/**
 * Time-of-day → suggested themes mapping (spec section 11). This is a
 * gentle weighting hint for the selection engine, never a hard filter, and
 * it never infers anything about the user's mood, health, or personal
 * situation — only the local clock time.
 */
export const TIME_PERIOD_THEMES: Readonly<Record<TimePeriod, readonly ThemeKey[]>> = {
  morning: ["gratitude", "trust_in_god", "guidance", "remembrance"],
  midday: ["patience", "wisdom", "justice", "good_deeds"],
  late_afternoon: ["repentance", "forgiveness", "remembrance"],
  evening: ["inner_peace", "mercy", "protection"],
};

/** Manually-selected contextual presets (spec section 11) — never auto-detected. */
export const MANUAL_CONTEXT_THEMES: Readonly<Record<"hard_time" | "need_motivation", readonly ThemeKey[]>> = {
  hard_time: ["patience", "hope", "trust_in_god"],
  need_motivation: ["courage", "good_deeds", "trust_in_god"],
};

export function timePeriodForHour(hour: number): TimePeriod {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "midday";
  if (hour >= 16 && hour < 19) return "late_afternoon";
  return "evening";
}

/** Maximum ayah character length (translation text) considered for a notification body. */
export const MAX_NOTIFICATION_AYAH_LENGTH = 220;

export const FREQUENCY_OPTIONS_HOURS = [1, 2, 3, 4, 6, 12] as const;

export const MAX_JITTER_MINUTES = 15;
