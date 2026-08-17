/**
 * JSON shape expected by scripts/importTranslation.ts for one language file,
 * e.g. src/data/corpus/translations/en.json. No such files ship in this
 * repository yet — see docs/TRANSLATIONS.md for why, and for the exact
 * procedure to add a real, licensed translation.
 *
 * Example (illustrative only — not real data):
 * {
 *   "sourceId": "en-example-2024",
 *   "entries": [
 *     { "id": "94:5", "text": "<verbatim licensed translation text>" }
 *   ]
 * }
 */
export interface TranslationFile {
  /** Must match an id in sources.ts registered via importTranslation.ts. */
  readonly sourceId: string;
  readonly entries: readonly {
    readonly id: string; // AyahId, e.g. "94:5"
    readonly text: string;
  }[];
}
