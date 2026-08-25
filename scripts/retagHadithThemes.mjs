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

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const DIR = path.join(ROOT, "src/data/corpus/hadith");
const catalogPath = path.join(DIR, "catalog.json");
const enPath = path.join(DIR, "translations/en.json");

// Keyword lists reused from buildHadithCorpus.mjs's original tagging,
// restricted to HADITH_THEME_KEYS — see that file's THEME_KEYWORDS for the
// full, ayah-taxonomy-sized version this was narrowed down from.
const THEME_KEYWORDS = {
  good_deeds: ["good deed", "righteous", "best of you", "best deed", "reward", "honest", "trustworthy", "intention", "actions are"],
  prayer: ["prayer", "pray", "salat", "prostrat", "mosque", "wudu", "ablution", "straighten your row"],
  family: ["parents", "mother", "father", "wife", "wives", "husband", "children", "kinship", "relatives"],
  generosity: ["charity", "sadaqah", "zakat", "spend", "feed", "orphan", "needy", "poor"],
  knowledge: ["knowledge", "learn", "teach", "scholar", "seek knowledge"],
  patience: ["patien", "persever", "steadfast", "endure"],
  mercy: ["merciful", "mercy", "compassion", "kind to"],
  forgiveness: ["forgiv", "pardon", "overlook", "repent", "seek forgiveness"],
  humility: ["humble", "humility", "arrogan", "proud", "haughty"],
  brotherhood: ["brother", "brotherhood", "muslim is the brother", "reconcil", "each other", "neighbour", "neighbor"],
  justice: ["justice", "just", "oppress", "wrong", "fair", "usury", "riba"],
  remembrance: ["remember", "remembrance", "dhikr", "glorify", "praise"],
};

function themesFor(en) {
  const lower = en.toLowerCase();
  const hits = [];
  for (const [theme, words] of Object.entries(THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) hits.push(theme);
  }
  if (hits.length === 0) return ["good_deeds"];
  return hits.slice(0, 3);
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const en = JSON.parse(readFileSync(enPath, "utf8"));
const enById = new Map(en.entries.map((e) => [e.id, e.text]));

const distribution = {};
for (const entry of catalog.entries) {
  const text = enById.get(entry.id);
  if (!text) continue; // shouldn't happen — every entry has an English translation
  entry.themes = themesFor(text);
  for (const theme of entry.themes) distribution[theme] = (distribution[theme] ?? 0) + 1;
}

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

console.log(`Re-tagged ${catalog.entries.length} hadith entries against ${Object.keys(THEME_KEYWORDS).length} classic themes.`);
console.log(distribution);
