import type { ThemeKey } from "./types";

/**
 * A curated set of everyday emotional states, each mapped to one or more
 * existing `ThemeKey` values. Deliberately not a 1:1 mirror of every theme —
 * this is a *feelings* picker (what someone is going through right now),
 * while `ThemeKey` is a *topic* taxonomy (what an ayah is about); the map
 * below is the translation between the two.
 */
export type MoodKey =
  | "anxious"
  | "sad"
  | "grateful"
  | "seeking_guidance"
  | "angry"
  | "afraid"
  | "lonely"
  | "tired"
  | "seeking_forgiveness"
  | "unmotivated";

export const ALL_MOOD_KEYS: readonly MoodKey[] = [
  "anxious",
  "sad",
  "grateful",
  "seeking_guidance",
  "angry",
  "afraid",
  "lonely",
  "tired",
  "seeking_forgiveness",
  "unmotivated",
];

export const MOOD_THEME_MAP: Readonly<Record<MoodKey, readonly ThemeKey[]>> = {
  anxious: ["trust_in_god", "inner_peace", "patience"],
  sad: ["mercy", "hope", "patience"],
  grateful: ["gratitude"],
  seeking_guidance: ["guidance", "wisdom"],
  angry: ["patience", "forgiveness"],
  afraid: ["protection", "trust_in_god"],
  lonely: ["remembrance", "brotherhood"],
  tired: ["patience", "trials"],
  seeking_forgiveness: ["repentance", "forgiveness"],
  unmotivated: ["good_deeds", "courage"],
};

/** Ionicons name per mood, used by the "A moment for you" picker screen. */
export const MOOD_ICONS: Readonly<Record<MoodKey, string>> = {
  anxious: "cloudy-outline",
  sad: "rainy-outline",
  grateful: "sunny-outline",
  seeking_guidance: "compass-outline",
  angry: "flash-outline",
  afraid: "shield-outline",
  lonely: "person-outline",
  tired: "battery-dead-outline",
  seeking_forgiveness: "water-outline",
  unmotivated: "rocket-outline",
};
