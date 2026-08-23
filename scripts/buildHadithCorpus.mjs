/**
 * Builds src/data/corpus/hadith/ from Sahih al-Bukhari and Sahih Muslim —
 * by scholarly consensus the two most rigorously authenticated hadith
 * collections in existence (the "Sahihayn"), which is why these two and
 * no others were chosen for "the most reliable" hadith in the app. Text
 * is fetched verbatim from fawazahmed0/hadith-api
 * (github.com/fawazahmed0/hadith-api — the same author and API style as
 * the Quran text/translations already used in this corpus), which itself
 * republishes long-established English/Arabic/French/Bengali/Russian
 * hadith translations. Run manually, requires network access:
 *
 *   node scripts/buildHadithCorpus.mjs
 *
 * WHAT THIS SCRIPT DOES AND DOES NOT DO
 * --------------------------------------
 * Selects, by MECHANICAL criteria only (length bounds, non-empty in every
 * required language, no cross-reference stub), a diverse subset of hadith
 * text already vetted as authentic by inclusion in Bukhari/Muslim. It does
 * not, and cannot, judge religious significance — every entry stays
 * status="technically_verified", the same standard the ayah corpus uses,
 * pending a qualified human reviewer (see docs/CORPUS.md).
 *
 * Only 5 of the app's 12 languages have ANY hadith coverage in the source
 * dataset: Arabic, English, French, Bengali, and (best-effort — noticeably
 * less complete) Russian. Spanish, Portuguese, Hindi, Italian, Chinese,
 * Dutch, and German have none at all. This is a real, current limitation,
 * not an oversight — the app's hadith feature is unavailable in those
 * languages until a translated edition exists somewhere to fetch from.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "src", "data", "corpus", "hadith");
const BASE_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";

const COLLECTIONS = {
  bukhari: { displayName: "Sahih al-Bukhari" },
  muslim: { displayName: "Sahih Muslim" },
};

// Russian is fetched and used where present, but never required for
// inclusion — rus-muslim in particular has large gaps (empty text) in the
// source dataset, unlike the other four languages here.
const REQUIRED_LOCALES = ["ar", "en", "fr", "bn"];
const OPTIONAL_LOCALES = ["ru"];
const EDITION_PREFIX = { ar: "ara", en: "eng", fr: "fra", bn: "ben", ru: "rus" };
const SOURCE_IDS = {
  ar: "ar-mukhtasar-hadith-v1",
  en: "en-hadith-v1",
  fr: "fr-hadith-v1",
  bn: "bn-hadith-v1",
  ru: "ru-hadith-v1",
};

const MIN_EN = 50;
const MAX_EN = 600;
const TARGET_COUNT = 500;

// --- Theme tagging -------------------------------------------------------
// Same MECHANICAL keyword-matching approach and the same ThemeKey taxonomy
// as scripts/buildFullCorpus.mjs — a theme tag is a topic hint for the
// "browse hadith by theme" screen, not a religious classification. Keyword
// lists are tuned for how hadith are typically phrased (narration framing,
// "whoever does X", "the best of you is...") rather than reused verbatim
// from the Qur'an-translation-tuned list, but the categories themselves are
// identical so hadith and ayat share one taxonomy throughout the app.
const THEME_KEYWORDS = {
  patience: ["patien", "persever", "steadfast", "endure"],
  gratitude: ["grateful", "gratitude", "thank"],
  hope: ["hope", "glad tidings", "good news", "despair not"],
  mercy: ["merciful", "mercy", "compassion", "kind to"],
  trust_in_god: ["rely upon", "reliance", "trust in allah", "put his trust"],
  prayer: ["prayer", "pray", "salat", "prostrat", "mosque", "wudu", "ablution", "straighten your row"],
  wisdom: ["wisdom", "wise", "understand", "reflect"],
  forgiveness: ["forgiv", "pardon", "overlook"],
  generosity: ["charity", "sadaqah", "zakat", "spend", "feed", "orphan", "needy", "poor"],
  courage: ["fear not", "do not fear", "jihad", "strive", "fight"],
  humility: ["humble", "humility", "arrogan", "proud", "haughty"],
  family: ["parents", "mother", "father", "wife", "wives", "husband", "children", "kinship", "relatives"],
  trials: ["test", "trial", "afflict", "hardship", "calamity", "difficulty", "suffer", "sick", "illness"],
  inner_peace: ["tranquil", "peace", "at ease", "content"],
  remembrance: ["remember", "remembrance", "dhikr", "glorify", "praise"],
  protection: ["protect", "refuge", "seek refuge", "guard"],
  knowledge: ["knowledge", "learn", "teach", "scholar", "seek knowledge"],
  good_deeds: ["good deed", "righteous", "best of you", "best deed", "reward", "honest", "trustworthy"],
  repentance: ["repent", "turn to allah", "seek forgiveness"],
  justice: ["justice", "just", "oppress", "wrong", "fair", "usury", "riba"],
  brotherhood: ["brother", "brotherhood", "muslim is the brother", "reconcil", "each other"],
  creation: ["created", "creation", "heavens and the earth", "sun", "moon", "rain"],
  guidance: ["guid", "straight path", "misguid", "astray"],
};

function themesFor(en) {
  const lower = en.toLowerCase();
  const hits = [];
  for (const [theme, words] of Object.entries(THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) hits.push(theme);
  }
  if (hits.length === 0) return ["guidance"];
  return hits.slice(0, 3);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchEdition(collection, locale) {
  const slug = `${EDITION_PREFIX[locale]}-${collection}`;
  const url = `${BASE_URL}/${slug}.min.json`;
  console.log(`fetching ${url}`);
  const data = await fetchJson(url);
  const byNumber = new Map(data.hadiths.map((h) => [h.hadithnumber, h.text]));
  return byNumber;
}

function isUsableText(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Cross-reference stubs ("...(see Hadith)") point elsewhere instead of
  // containing the report itself — not usable standalone.
  if (/\(see hadith\)?\.?$/i.test(trimmed)) return false;
  return true;
}

async function buildCollection(collection) {
  const tablesByLocale = {};
  for (const locale of [...REQUIRED_LOCALES, ...OPTIONAL_LOCALES]) {
    tablesByLocale[locale] = await fetchEdition(collection, locale);
  }

  const enTable = tablesByLocale.en;
  const candidates = [];
  const seenText = new Set();

  for (const [hadithnumber, enText] of enTable.entries()) {
    if (!isUsableText(enText)) continue;
    if (enText.length < MIN_EN || enText.length > MAX_EN) continue;

    const missingRequired = REQUIRED_LOCALES.some((loc) => !isUsableText(tablesByLocale[loc].get(hadithnumber)));
    if (missingRequired) continue;

    // Bukhari cross-references the same narration under multiple chapters;
    // keep only the first (lowest-numbered) occurrence of identical text.
    const dedupeKey = enText.trim().toLowerCase();
    if (seenText.has(dedupeKey)) continue;
    seenText.add(dedupeKey);

    candidates.push({ collection, hadithnumber, en: enText });
  }

  console.log(`${collection}: ${candidates.length} candidates after mechanical filtering`);
  return { candidates, tablesByLocale };
}

const results = {};
for (const collection of Object.keys(COLLECTIONS)) {
  results[collection] = await buildCollection(collection);
}

// Round-robin between collections, and within a collection spread across
// hadith-number ranges (a rough proxy for book/chapter, since consecutive
// numbers cluster within the same chapter) so the final set isn't
// dominated by whichever chapter happened to have the most short reports.
function interleave(candidates, chunks) {
  const perChunk = Math.ceil(candidates.length / chunks);
  const buckets = Array.from({ length: chunks }, (_, i) => candidates.slice(i * perChunk, (i + 1) * perChunk));
  const out = [];
  let index = 0;
  let remaining = candidates.length;
  while (remaining > 0) {
    for (const bucket of buckets) {
      if (index < bucket.length) {
        out.push(bucket[index]);
        remaining -= 1;
      }
    }
    index += 1;
  }
  return out;
}

const bukhariSpread = interleave(results.bukhari.candidates, 20);
const muslimSpread = interleave(results.muslim.candidates, 20);

const combined = [];
let bi = 0;
let mi = 0;
while (combined.length < TARGET_COUNT && (bi < bukhariSpread.length || mi < muslimSpread.length)) {
  if (bi < bukhariSpread.length) combined.push(bukhariSpread[bi++]);
  if (combined.length >= TARGET_COUNT) break;
  if (mi < muslimSpread.length) combined.push(muslimSpread[mi++]);
}

combined.sort((a, b) => (a.collection === b.collection ? a.hadithnumber - b.hadithnumber : a.collection.localeCompare(b.collection)));

console.log(`total selected: ${combined.length} (bukhari: ${combined.filter((c) => c.collection === "bukhari").length}, muslim: ${combined.filter((c) => c.collection === "muslim").length})`);

const arabicOut = {
  _readme:
    "Arabic text for every hadith in this corpus, fetched verbatim from fawazahmed0/hadith-api. Only Sahih al-Bukhari and Sahih Muslim are used — by scholarly consensus the two most authenticated hadith collections. Regenerate with scripts/buildHadithCorpus.mjs. Not hand-typed and never edited by hand.",
  entries: combined.map((c) => ({
    id: `${c.collection}:${c.hadithnumber}`,
    collection: c.collection,
    collectionDisplayName: COLLECTIONS[c.collection].displayName,
    hadithNumber: c.hadithnumber,
    text: results[c.collection].tablesByLocale.ar.get(c.hadithnumber),
  })),
};

const catalogOut = {
  _readme:
    "Editorial catalog for the hadith corpus, generated by scripts/buildHadithCorpus.mjs. Entries were selected by MECHANICAL criteria only (translation length bounds, non-empty in Arabic/English/French/Bengali, no cross-reference stub, deduplicated), and themes were assigned by keyword-matching the English translation against the same ThemeKey taxonomy the ayah corpus uses. No religious or rhetorical judgement was applied. Every entry is therefore status=\"technically_verified\", never \"publishable\" — see docs/CORPUS.md.",
  entries: combined.map((c) => ({
    id: `${c.collection}:${c.hadithnumber}`,
    status: "technically_verified",
    themes: themesFor(c.en),
    isDemoOnly: false,
  })),
};

mkdirSync(path.join(OUT, "translations"), { recursive: true });
writeFileSync(path.join(OUT, "arabic.json"), JSON.stringify(arabicOut) + "\n");
writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalogOut) + "\n");

for (const locale of [...REQUIRED_LOCALES, ...OPTIONAL_LOCALES]) {
  if (locale === "ar") continue; // Arabic readers get arabic.json itself, not a "translation".
  const entries = [];
  for (const c of combined) {
    const text = results[c.collection].tablesByLocale[locale].get(c.hadithnumber);
    if (isUsableText(text)) entries.push({ id: `${c.collection}:${c.hadithnumber}`, text: text.trim() });
  }
  const file = { sourceId: SOURCE_IDS[locale], entries };
  writeFileSync(path.join(OUT, "translations", `${locale}.json`), JSON.stringify(file) + "\n");
  console.log(`${locale}: ${entries.length}/${combined.length} entries have text`);
}

console.log("done.");
