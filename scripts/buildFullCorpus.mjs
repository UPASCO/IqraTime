/**
 * Rebuilds src/data/corpus/ from the full Qur'an editions published by
 * fawazahmed0/quran-api. Run manually (not part of CI or the app bundle):
 *
 *   node scripts/buildFullCorpus.mjs /path/to/downloaded/editions
 *
 * The directory must contain ara-quranuthmanihaf.json, the nine translation
 * editions listed in EDITIONS below, and surah.json from semarketir/quranjson.
 *
 * WHAT THIS SCRIPT DOES AND DOES NOT DO
 * -------------------------------------
 * It selects, by *mechanical* criteria only, the subset of āyāt that can
 * plausibly be shown on their own in a notification, and tags each with
 * themes by keyword-matching the English translation.
 *
 * It cannot judge religious or rhetorical significance, and it does not
 * claim to. Every entry it writes therefore stays at
 * status="technically_verified" — never "publishable" — so
 * scripts/validateCorpus.ts keeps blocking production builds until a
 * qualified human completes the review checklist in docs/CORPUS.md. The
 * selection below is a *starting point for that review*, not a substitute
 * for it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ICONIC_REFS } from "./iconicRefs.mjs";

const srcDir = process.argv[2];
if (!srcDir) {
  console.error("usage: node scripts/buildFullCorpus.mjs <editions-dir>");
  process.exit(1);
}

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "src", "data", "corpus");

const ARABIC_EDITION = "ara-quranuthmanihaf";
const EDITIONS = {
  en: "eng-muhammadtaqiudd",
  fr: "fra-muhammadhamidul",
  es: "spa-muhammadisagarc",
  pt: "por-helminasr",
  hi: "hin-maulanaazizulha",
  bn: "ben-abubakrzakaria",
  "zh-CN": "zho-muhammadmakin",
  it: "ita-hamzarobertopic",
  ru: "rus-elmirkuliev",
  nl: "nld-sofianssiregar",
  de: "deu-asfbubenheimand",
};
const SOURCE_IDS = {
  en: "en-hilali-khan-v1",
  fr: "fr-hamidullah-v1",
  es: "es-isa-garcia-v1",
  pt: "pt-helmi-nasr-v1",
  hi: "hi-al-umari-v1",
  bn: "bn-abubakr-zakaria-v1",
  "zh-CN": "zh-muhammad-makin-v1",
  it: "it-piccardo-v1",
  ru: "ru-elmir-kuliev-v1",
  nl: "nl-siregar-v1",
  de: "de-bubenheim-elyas-v1",
};

const load = (name) => JSON.parse(readFileSync(path.join(srcDir, `${name}.json`), "utf8"));
const key = (v) => `${v.chapter}:${v.verse}`;

const arabic = load(ARABIC_EDITION).quran;
const surahMeta = load("surah");
const translations = Object.fromEntries(
  Object.entries(EDITIONS).map(([locale, edition]) => [
    locale,
    new Map(load(edition).quran.map((v) => [key(v), v.text])),
  ]),
);

/** Hindi/Bengali editions carry bracketed footnote markers; strip them (a purely typographic removal, no wording is altered). */
const cleanText = (text) => text.replace(/\[[0-9०-९০-৯]+\]/g, "").replace(/\s{2,}/g, " ").trim();

// --- Mechanical standalone-suitability filter -------------------------
// All thresholds operate on the English translation, used purely as a
// language-neutral proxy for "is this a complete, self-contained thought".

// An āyah has to read as one coherent thought and stay within roughly one
// screen — a little scrolling is acceptable, a wall of text is not.
//
// The upper bound is calibrated on Āyat al-Kursī (2:255): 695 characters of
// English over 425 of Arabic, plus a small margin (430 -> 440 Arabic
// characters) to also admit the Verse of Light (24:35, 438 Arabic
// characters) — as iconic as Kursī and excluded by only 8 characters
// under the original bound. Both are explicitly the largest āyāt the app
// shows, so they set the template rather than being excluded by it.
//
// The lower bound comes from 94:5 ("So verily, with the hardship, there is
// relief" — 45 characters): short but complete. Below that, an āyah is
// almost always a clause rather than a sentence.
const MIN_EN = 40;
const MAX_EN = 700;
const MAX_ARABIC = 440;

/**
 * Openings that are unambiguously mid-sentence. Deliberately short: broad
 * entries like "those who" or "when" wrongly rejected well-known āyāt
 * (13:28 opens "Those who believe…", 2:186 opens "And when My servants…").
 */
const CONTINUATION_OPENINGS = [
  "or ", "nor ", "except", "until ", "while ", "neither ", "rather,", "but rather",
  "so that ", "in order that",
];

/**
 * Openings that are grammatically complete sentences but semantically
 * depend on an antecedent the āyah itself never states — "he/she/they
 * said" without saying who, or a demonstrative ("that is", "such is")
 * pointing back at a list from the previous āyah. These read fine in
 * isolation but the reader can't tell who or what is meant, which is
 * exactly the "manque de sens individuellement" failure mode text-shape
 * filters (length, capitalisation, punctuation) cannot catch on their own.
 *
 * Deliberately narrow: broader candidates were tried and rejected because
 * they wrongly caught genuinely standalone āyāt — "then " would have
 * dropped the Ar-Rahman refrain ("Then which of the favours of your Lord
 * will you deny?", repeated 31 times and unambiguous alone), and "and
 * when"/"so when" would have dropped 2:186 ("And when My servants ask you
 * concerning Me - indeed I am near...", one of the most cited āyāt in the
 * whole Qur'an and fully self-contained despite the opening "when").
 */
const REFERENTIAL_OPENINGS = [
  "he said", "she said", "they said", "we said", "it was said", "and it was said",
  "thereupon", "thus do", "thus does",
  "that is because", "such is the", "such is his", "and thus", "and that is",
];

/** Latin-script editions, whose capitalisation reliably marks a sentence start. */
const CASED_LOCALES = ["en", "fr", "es", "pt", "it", "nl", "de"];

function startsMidSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  const first = trimmed[0];
  // Skip quotes/brackets a translator may open the sentence with.
  const firstLetter = trimmed.replace(/^[«"'([\s]+/, "")[0] ?? first;
  return firstLetter === firstLetter.toLowerCase() && firstLetter !== firstLetter.toUpperCase();
}

function isStandaloneCandidate(id, en, ar) {
  if (!en || !ar) return false;
  if (en.length < MIN_EN || en.length > MAX_EN) return false;
  if (ar.length > MAX_ARABIC) return false;

  // An āyah that opens mid-sentence in ANY Latin-script edition is a
  // fragment for those readers even if the English happens to read whole —
  // 13:28 is the canonical example ("Those who believe…" in English, but
  // "ceux qui ont cru…" in French).
  for (const locale of CASED_LOCALES) {
    const text = translations[locale].get(id);
    if (!text || startsMidSentence(text)) return false;
  }

  const lower = en.toLowerCase();
  if (CONTINUATION_OPENINGS.some((p) => lower.startsWith(p))) return false;
  if (REFERENTIAL_OPENINGS.some((p) => lower.startsWith(p))) return false;
  // An unterminated clause continues into the next āyah. A trailing ellipsis
  // means the same thing and shows up in editions that mark it explicitly
  // (the Chinese edition uses "……" for verses that run on).
  for (const locale of Object.keys(EDITIONS)) {
    const text = (translations[locale].get(id) ?? "").trim();
    if (/[,;:—-]$/.test(text) || /(\.\.\.|…)$/.test(text)) return false;
  }
  return true;
}

// --- Theme tagging -----------------------------------------------------
// Keyword matching on the English translation. Deliberately coarse: theme
// tags are explicitly part of what a human reviewer must verify.

const THEME_KEYWORDS = {
  patience: ["patien", "persever", "steadfast", "endure", "bear with"],
  gratitude: ["grateful", "gratitude", "thank", "bounty", "favour", "favor", "blessing"],
  hope: ["hope", "glad tidings", "good news", "ease", "relief", "despair not", "do not despair"],
  mercy: ["merciful", "mercy", "compassion", "kind"],
  trust_in_god: ["rely upon", "reliance", "trust in allah", "sufficient for us", "put their trust", "disposer of affairs"],
  prayer: ["prayer", "salat", "prostrat", "bow down", "worship him", "establish the"],
  wisdom: ["wisdom", "wise", "understand", "ponder", "reflect", "reason"],
  forgiveness: ["forgiv", "pardon", "overlook", "absolve"],
  generosity: ["spend", "charity", "zakat", "give of", "feed the", "orphan", "needy", "poor"],
  courage: ["fear not", "do not fear", "grieve not", "be not afraid", "strive", "fight in the"],
  humility: ["humble", "humility", "arrogan", "boast", "proud", "haughty"],
  family: ["parents", "mother", "father", "wives", "spouse", "children", "kindred", "relatives"],
  trials: ["test", "trial", "afflict", "hardship", "calamity", "difficulty", "suffer"],
  inner_peace: ["tranquil", "peace", "hearts find rest", "at rest", "serenity", "content"],
  remembrance: ["remember", "remembrance", "mention of allah", "glorify", "praise"],
  protection: ["protect", "guard", "refuge", "shelter", "defend", "preserve"],
  knowledge: ["knowledge", "know", "learn", "teach", "taught", "scholars", "read"],
  good_deeds: ["righteous deed", "good deed", "do good", "does good", "best of deeds", "reward"],
  repentance: ["repent", "turn to allah", "turn in repentance", "seek forgiveness"],
  justice: ["justice", "just", "equit", "oppress", "wrong", "fair", "balance", "witness"],
  brotherhood: ["brother", "believers are", "hold fast", "unity", "reconcil", "each other"],
  creation: ["created", "creation", "heavens and the earth", "sky", "earth", "rain", "sun", "moon", "stars", "night and day"],
  guidance: ["guid", "straight path", "right path", "misguid", "astray", "light"],
};

function themesFor(en) {
  const lower = en.toLowerCase();
  const hits = [];
  for (const [theme, words] of Object.entries(THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) hits.push(theme);
  }
  // Cap at three so theme filtering stays meaningful rather than matching everything.
  if (hits.length === 0) return ["guidance"];
  return hits.slice(0, 3);
}

// --- Build -------------------------------------------------------------

const surahNames = new Map(
  surahMeta.map((s) => [Number(s.index), { ar: s.titleAr, tr: s.title }]),
);

const selected = [];
const bySurah = new Map();

const hasEveryLanguage = (id) => Object.keys(EDITIONS).every((loc) => translations[loc].get(id));

for (const verse of arabic) {
  const id = key(verse);
  const en = translations.en.get(id);
  if (!isStandaloneCandidate(id, en, verse.text)) continue;
  if (!hasEveryLanguage(id)) continue;

  const entry = { id, surah: verse.chapter, ayah: verse.verse, ar: verse.text, en };
  selected.push(entry);
  if (!bySurah.has(verse.chapter)) bySurah.set(verse.chapter, []);
  bySurah.get(verse.chapter).push(entry);
}

selected.sort((a, b) => (a.surah - b.surah) || (a.ayah - b.ayah));
console.log(`mechanically valid pool before curation: ${selected.length}`);
const candidatePool = selected.slice();

// --- Curated downselection ----------------------------------------------
// The mechanical pool above is deliberately permissive (anything that reads
// as one complete thought). Shipping all of it dilutes the feed with
// correct-but-forgettable āyāt. This step narrows it to a fixed target,
// prioritising: (1) āyāt widely recognised/cited on their own — dua,
// khutbahs, calligraphy — guaranteed a slot if the mechanical filter kept
// them; (2) surah coverage — round-robin across every surah that still has
// candidates so no single long surah (e.g. Al-Baqarah) crowds out shorter
// ones; (3) within each round, the candidate whose length is closest to a
// "quotable" sweet spot, on the theory that a very short fragment-adjacent
// or very long near-the-cap āyah is less memorable than a mid-length one.
// This is still a heuristic, not a religious judgement — see the module
// docstring.
//
// TARGET_COUNT was deliberately cut from an earlier 1500 down to 250:
// the goal shifted from "broad coverage" to "only the āyāt a knowledgeable
// Muslim would recognise as significant on sight" — ICONIC_REFS below now
// accounts for the large majority of the final set, with the round-robin
// only lightly topping up surah coverage rather than padding out volume.
const TARGET_COUNT = 300;

// ICONIC_REFS now lives in ./iconicRefs.mjs — imported above, and shared
// with scripts/markNotableAyat.mjs so the corpus downselection here and
// the runtime `notable` weighting can never drift apart.

/** Distance from a mid-length, "quotable" āyah — used only to order candidates within a surah, never to exclude one. */
const IDEAL_QUOTABLE_LEN = 150;
const quotabilityScore = (entry) => -Math.abs(entry.en.length - IDEAL_QUOTABLE_LEN);

function downselect(candidates, targetCount) {
  if (candidates.length <= targetCount) return candidates;

  const iconic = candidates.filter((e) => ICONIC_REFS.has(e.id));
  const pickedIds = new Set(iconic.map((e) => e.id));
  const rest = candidates.filter((e) => !pickedIds.has(e.id));

  const bySurahRest = new Map();
  for (const entry of rest) {
    if (!bySurahRest.has(entry.surah)) bySurahRest.set(entry.surah, []);
    bySurahRest.get(entry.surah).push(entry);
  }
  for (const list of bySurahRest.values()) {
    list.sort((a, b) => quotabilityScore(b) - quotabilityScore(a));
  }

  const picks = [...iconic];
  let remaining = targetCount - picks.length;
  const surahOrder = [...bySurahRest.keys()].sort((a, b) => a - b);

  // Round-robin: each pass takes the single best remaining candidate from
  // every surah that still has one, so coverage spreads across the whole
  // Qur'an before any surah gets a second pick.
  let tookOneThisPass = true;
  while (remaining > 0 && tookOneThisPass) {
    tookOneThisPass = false;
    for (const surah of surahOrder) {
      if (remaining <= 0) break;
      const list = bySurahRest.get(surah);
      const next = list.shift();
      if (!next) continue;
      picks.push(next);
      remaining -= 1;
      tookOneThisPass = true;
    }
  }

  return picks;
}

selected.length = 0;
selected.push(...downselect(candidatePool, TARGET_COUNT).sort((a, b) => (a.surah - b.surah) || (a.ayah - b.ayah)));
bySurah.clear();
for (const entry of selected) {
  if (!bySurah.has(entry.surah)) bySurah.set(entry.surah, []);
  bySurah.get(entry.surah).push(entry);
}

// A handful of very short surahs end up with no entry at all: every one of
// their verses is a short clause that only carries its meaning as part of
// the whole surah (Al-'Asr is the clearest case — "By time", "Man is in
// loss", "except those who believe…" are three fragments of one sentence).
// Forcing them in produced exactly the mid-sentence fragments this filter
// exists to reject, so they are deliberately left out until the data model
// can present a short surah as a single unit.
const missing = [];
for (let surah = 1; surah <= 114; surah += 1) if (!bySurah.has(surah)) missing.push(surah);

console.log(`total entries: ${selected.length}`);
console.log(`surahs represented: ${bySurah.size} / 114`);
if (missing.length > 0) console.log(`deliberately unrepresented (verses do not stand alone): ${missing.join(", ")}`);

const arabicOut = {
  _readme:
    "Full Arabic text for every āyah in the editorial catalog, fetched verbatim from the King Fahd Complex Uthmani text (Hafs 'an 'Asim) as published in fawazahmed0/quran-api, edition ara-quranuthmanihaf. Regenerate with scripts/buildFullCorpus.mjs. Not hand-typed and never edited by hand.",
  entries: selected.map((e) => ({
    id: e.id,
    surah: e.surah,
    ayah: e.ayah,
    text: e.ar,
    surahNameArabic: surahNames.get(e.surah)?.ar ?? "",
    surahNameTransliterated: surahNames.get(e.surah)?.tr ?? "",
  })),
};

const catalogOut = {
  _readme:
    "Editorial catalog, generated by scripts/buildFullCorpus.mjs. Entries were selected by MECHANICAL criteria only (translation length bounds, no mid-sentence opening, no trailing continuation punctuation) and themes were assigned by keyword-matching the English translation. No religious or rhetorical judgement was applied and none is implied. Every entry is therefore status=\"technically_verified\", never \"publishable\": scripts/validateCorpus.ts keeps blocking production builds until a qualified human completes the checklist in docs/CORPUS.md.",
  // No per-entry editorialNote: it would repeat the same sentence 3000+
  // times and cost ~1MB in the shipped bundle. The caveat that applies to
  // every machine-selected entry lives in _readme above instead.
  entries: selected.map((e) => ({
    id: e.id,
    status: "technically_verified",
    themes: themesFor(e.en),
    isDemoOnly: false,
  })),
};

// These files are generated, never hand-edited, and are parsed at app
// startup — so they ship minified. Re-run this script to inspect changes
// rather than reading the JSON directly.
mkdirSync(path.join(OUT, "translations"), { recursive: true });
writeFileSync(path.join(OUT, "arabic.json"), JSON.stringify(arabicOut) + "\n");
writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalogOut) + "\n");

for (const locale of Object.keys(EDITIONS)) {
  const file = {
    sourceId: SOURCE_IDS[locale],
    entries: selected.map((e) => ({ id: e.id, text: cleanText(translations[locale].get(e.id)) })),
  };
  writeFileSync(path.join(OUT, "translations", `${locale}.json`), JSON.stringify(file) + "\n");
}

console.log(`wrote ${selected.length} entries + ${Object.keys(EDITIONS).length} translation files`);
