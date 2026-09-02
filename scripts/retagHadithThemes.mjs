/**
 * Re-tags every hadith catalog entry's `themes` field against
 * HADITH_THEME_KEYS (src/domain/types.ts) — the reduced, classic-hadith
 * subset of the full ayah theme taxonomy — instead of the original broader
 * mechanical tagging buildHadithCorpus.mjs applied. Same mechanical
 * keyword-match approach as before (English translation text, up to 3
 * matches, "good_deeds" as the catch-all), just against a narrower,
 * hadith-appropriate keyword map. Does NOT touch id/status/isDemoOnly or
 * re-fetch/re-select anything — the 500 entries themselves are unchanged,
 * only their theme tags. No network access needed.
 *
 * Usage: node scripts/retagHadithThemes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { HADITH_THEME_KEYWORDS, hadithThemesFor } from "./hadithThemes.mjs";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const DIR = path.join(ROOT, "src/data/corpus/hadith");
const catalogPath = path.join(DIR, "catalog.json");
const enPath = path.join(DIR, "translations/en.json");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const en = JSON.parse(readFileSync(enPath, "utf8"));
const enById = new Map(en.entries.map((e) => [e.id, e.text]));

const distribution = {};
for (const entry of catalog.entries) {
  const text = enById.get(entry.id);
  if (!text) continue; // shouldn't happen — every entry has an English translation
  entry.themes = hadithThemesFor(text);
  for (const theme of entry.themes) distribution[theme] = (distribution[theme] ?? 0) + 1;
}

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

console.log(`Re-tagged ${catalog.entries.length} hadith entries against ${Object.keys(HADITH_THEME_KEYWORDS).length} classic themes.`);
console.log(distribution);
