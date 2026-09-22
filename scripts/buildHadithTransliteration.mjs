/**
 * Builds src/data/corpus/hadith/transliteration.json from the corpus's own
 * vocalized Arabic (arabic.json), via the deterministic rule-based
 * romanizer in scripts/arabicRomanizer.mjs. No source dataset ships a
 * hadith transliteration edition, so — unlike the Qur'an's verbatim
 * ara-quranphoneticst-la edition — this file is a MECHANICAL derivation
 * of the verbatim Arabic: fixed character rules, reproducible on every
 * run, no AI-generated text (see the romanizer's header and
 * docs/CORPUS.md "Transliteration").
 *
 *   node scripts/buildHadithTransliteration.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { romanizeArabic } from "./arabicRomanizer.mjs";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const DIR = path.join(ROOT, "src", "data", "corpus", "hadith");

const arabic = JSON.parse(readFileSync(path.join(DIR, "arabic.json"), "utf8"));
const entries = arabic.entries.map((e) => ({ id: e.id, text: romanizeArabic(e.text) }));
if (entries.some((e) => !e.text.trim())) throw new Error("empty romanization produced");

const out = {
  _readme:
    "Latin romanization of the corpus's vocalized Arabic hadith text, derived MECHANICALLY by the fixed rule set in scripts/arabicRomanizer.mjs (no AI generation, no hand edits). Regenerate with scripts/buildHadithTransliteration.mjs whenever arabic.json changes.",
  sourceId: "hadith-machine-romanization-v1",
  entries,
};
writeFileSync(path.join(DIR, "transliteration.json"), JSON.stringify(out) + "\n");
console.log(`wrote ${entries.length} romanized entries`);
console.log("sample:", entries[0].text.slice(0, 120));
