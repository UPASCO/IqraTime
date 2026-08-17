import { en } from "./locales/en";

/**
 * The canonical shape every locale catalog must match exactly (same keys,
 * same nesting, `string` leaves, `PluralForm` leaves). English is the
 * source of truth: add or rename a key there first, then every other
 * locale file will fail `tsc` until it is updated to match.
 */
export type TranslationSchema = typeof en;

/** Dot-path union of every leaf string key, e.g. "home.title" | "settings.sound" | ... */
type PathsOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends { other: string }
      ? `${Prefix}${K}`
      : PathsOf<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = PathsOf<TranslationSchema>;
