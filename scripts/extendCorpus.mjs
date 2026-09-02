/**
 * Adds the curated āyāt listed in scripts/curatedAyatAdditions.mjs to the
 * notification corpus (src/data/corpus/), without touching any entry that is
 * already there. Run manually:
 *
 *   node scripts/extendCorpus.mjs             # adds text + fetches tafsir
 *   node scripts/extendCorpus.mjs --no-tafsir # offline: text only
 *
 * WHERE THE TEXT COMES FROM
 * -------------------------
 * Nothing is typed. The Arabic and all eleven translations are copied
 * verbatim from src/data/quran/ — the full-Qur'an reader dataset, built by
 * scripts/buildQuranReaderData.mjs from the exact same King Fahd Complex
 * Uthmani text and the same eleven translation editions as the corpus
 * (this script refuses to run if the two disagree on a single āyah already
 * shipped in both). Tafsir is fetched from the same spa5k/tafsir_api
 * editions scripts/fetchTafsir.mjs uses, for the added surahs only, and
 * merged into the existing per-locale files. No AI-generated or
 * paraphrased text anywhere — see docs/CORPUS.md.
 *
 * WHAT IS CHECKED
 * ---------------
 * Every addition is re-run through the exact mechanical standalone filter
 * scripts/buildFullCorpus.mjs applies (length bounds, mid-sentence /
 * continuation / referential openings, trailing continuation punctuation
 * in any edition). An id that fails and is not in
 * MECHANICAL_CHECK_EXCEPTIONS aborts the run — the whitelist has to be
 * fixed, never the check. Themes are tagged by the same shared rule
 * (scripts/ayahThemes.mjs); the `notable` flag follows ICONIC_REFS, same
 * as scripts/markNotableAyat.mjs. New entries ship as "publishable" — the
 * whitelist itself is the human standalone-adequacy review (docs/CORPUS.md
 * checklist item 4), on the same terms the project owner promoted the
 * original 300.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { CURATED_AYAT_ADDITIONS, MECHANICAL_CHECK_EXCEPTIONS } from "./curatedAyatAdditions.mjs";
import { ICONIC_REFS } from "./iconicRefs.mjs";
import { ayahThemesFor } from "./ayahThemes.mjs";
import { TAFSIR_BASE_URL, TAFSIR_EDITIONS } from "./tafsirEditions.mjs";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const CORPUS_DIR = path.join(ROOT, "src", "data", "corpus");
const READER_DIR = path.join(ROOT, "src", "data", "quran");
const LOCALES = ["en", "fr", "es", "pt", "hi", "bn", "zh-CN", "it", "ru", "nl", "de"];
const CASED_LOCALES = ["en", "fr", "es", "pt", "it", "nl", "de"];
const FETCH_TAFSIR = !process.argv.includes("--no-tafsir");

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeMinified = (file, data) => writeFileSync(file, JSON.stringify(data) + "\n");
const writePretty = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const byRef = (a, b) => {
  const [as, aa] = a.id.split(":").map(Number);
  const [bs, ba] = b.id.split(":").map(Number);
  return as - bs || aa - ba;
};

// --- Reader dataset (source of every character added here) -------------
const readerArabic = new Map(readJson(path.join(READER_DIR, "arabic.json")).entries.map((e) => [`${e.surah}:${e.ayah}`, e]));
const surahMeta = new Map(readJson(path.join(READER_DIR, "surahs.json")).surahs.map((s) => [s.number, s]));
const readerTranslations = Object.fromEntries(
  LOCALES.map((locale) => {
    const file = readJson(path.join(READER_DIR, "translations", `${locale}.json`));
    return [locale, { sourceId: file.sourceId, byId: new Map(file.entries.map((e) => [`${e.surah}:${e.ayah}`, e.text])) }];
  }),
);

// --- Current corpus -------------------------------------------------------
const arabicFile = readJson(path.join(CORPUS_DIR, "arabic.json"));
const catalogFile = readJson(path.join(CORPUS_DIR, "catalog.json"));
const translationFiles = Object.fromEntries(LOCALES.map((locale) => [locale, readJson(path.join(CORPUS_DIR, "translations", `${locale}.json`))]));
const existingIds = new Set(catalogFile.entries.map((e) => e.id));

// Same editions, same text: refuse to mix if the reader dataset and the
// shipped corpus ever disagree on an āyah they both contain.
for (const entry of arabicFile.entries) {
  if (readerArabic.get(entry.id)?.text !== entry.text) {
    throw new Error(`Arabic text of ${entry.id} differs between src/data/quran and src/data/corpus — not the same edition, refusing to extend.`);
  }
}
for (const locale of LOCALES) {
  if (translationFiles[locale].sourceId !== readerTranslations[locale].sourceId) {
    throw new Error(`Translation source for "${locale}" differs between reader (${readerTranslations[locale].sourceId}) and corpus (${translationFiles[locale].sourceId}).`);
  }
}

// --- Mechanical standalone filter (verbatim from buildFullCorpus.mjs) ---
const MIN_EN = 40;
const MAX_EN = 700;
const MAX_ARABIC = 440;
const CONTINUATION_OPENINGS = ["or ", "nor ", "except", "until ", "while ", "neither ", "rather,", "but rather", "so that ", "in order that"];
const REFERENTIAL_OPENINGS = [
  "he said", "she said", "they said", "we said", "it was said", "and it was said",
  "thereupon", "thus do", "thus does",
  "that is because", "such is the", "such is his", "and thus", "and that is",
];
/** Hindi/Bengali editions carry bracketed footnote markers; strip them (a purely typographic removal, no wording is altered). */
const cleanText = (text) => text.replace(/\[[0-9०-९০-৯]+\]/g, "").replace(/\s{2,}/g, " ").trim();

function startsMidSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  const firstLetter = trimmed.replace(/^[«"'([\s]+/, "")[0] ?? trimmed[0];
  return firstLetter === firstLetter.toLowerCase() && firstLetter !== firstLetter.toUpperCase();
}

function mechanicalProblems(id) {
  const problems = [];
  const en = readerTranslations.en.byId.get(id);
  const ar = readerArabic.get(id)?.text;
  if (!en || !ar) return ["missing from the reader dataset"];
  if (en.length < MIN_EN) problems.push(`English shorter than ${MIN_EN} chars`);
  if (en.length > MAX_EN) problems.push(`English longer than ${MAX_EN} chars`);
  if (ar.length > MAX_ARABIC) problems.push(`Arabic longer than ${MAX_ARABIC} chars`);
  for (const locale of CASED_LOCALES) {
    const text = readerTranslations[locale].byId.get(id);
    if (!text || startsMidSentence(text)) problems.push(`opens mid-sentence in "${locale}"`);
  }
  const lower = en.toLowerCase();
  for (const opening of CONTINUATION_OPENINGS) if (lower.startsWith(opening)) problems.push(`continuation opening "${opening.trim()}"`);
  for (const opening of REFERENTIAL_OPENINGS) if (lower.startsWith(opening)) problems.push(`referential opening "${opening}"`);
  for (const locale of LOCALES) {
    const text = (readerTranslations[locale].byId.get(id) ?? "").trim();
    if (/[,;:—-]$/.test(text) || /(\.\.\.|…)$/.test(text)) problems.push(`trailing continuation punctuation in "${locale}"`);
  }
  return problems;
}

// --- Validate the whitelist before touching anything ----------------------
const toAdd = [];
const failures = [];
for (const id of CURATED_AYAT_ADDITIONS) {
  if (!/^\d+:\d+$/.test(id)) throw new Error(`Malformed id "${id}" in curatedAyatAdditions.mjs`);
  if (existingIds.has(id)) continue;
  const problems = mechanicalProblems(id);
  if (problems.length > 0 && !MECHANICAL_CHECK_EXCEPTIONS.has(id)) {
    failures.push(`${id}: ${problems.join("; ")}`);
    continue;
  }
  if (LOCALES.some((locale) => !readerTranslations[locale].byId.get(id))) {
    failures.push(`${id}: not present in every translation edition`);
    continue;
  }
  toAdd.push(id);
}
if (new Set(CURATED_AYAT_ADDITIONS).size !== CURATED_AYAT_ADDITIONS.length) {
  throw new Error("curatedAyatAdditions.mjs contains a duplicate id");
}
if (failures.length > 0) {
  console.error("Refusing to extend the corpus — these curated ids fail the standalone check and are not listed as exceptions:");
  for (const line of failures) console.error(`  ✗ ${line}`);
  process.exit(1);
}
if (toAdd.length === 0) {
  console.log("Nothing to add: every curated āyah is already in the corpus.");
  process.exit(0);
}

// --- Append ---------------------------------------------------------------
for (const id of toAdd) {
  const ar = readerArabic.get(id);
  const meta = surahMeta.get(ar.surah);
  arabicFile.entries.push({
    id,
    surah: ar.surah,
    ayah: ar.ayah,
    text: ar.text,
    surahNameArabic: meta?.nameArabic ?? "",
    surahNameTransliterated: meta?.nameTransliterated ?? "",
  });
  const catalogEntry = {
    id,
    status: "publishable",
    themes: ayahThemesFor(readerTranslations.en.byId.get(id)),
    isDemoOnly: false,
  };
  if (ICONIC_REFS.has(id)) catalogEntry.notable = true;
  catalogFile.entries.push(catalogEntry);
  for (const locale of LOCALES) {
    translationFiles[locale].entries.push({ id, text: cleanText(readerTranslations[locale].byId.get(id)) });
  }
}
arabicFile.entries.sort(byRef);
catalogFile.entries.sort(byRef);
for (const locale of LOCALES) translationFiles[locale].entries.sort(byRef);

writeMinified(path.join(CORPUS_DIR, "arabic.json"), arabicFile);
writePretty(path.join(CORPUS_DIR, "catalog.json"), catalogFile);
for (const locale of LOCALES) writeMinified(path.join(CORPUS_DIR, "translations", `${locale}.json`), translationFiles[locale]);

const surahsTouched = [...new Set(toAdd.map((id) => Number(id.split(":")[0])))].sort((a, b) => a - b);
console.log(`Added ${toAdd.length} āyāt (${surahsTouched.length} surahs) — corpus is now ${catalogFile.entries.length} entries.`);

// --- Tafsir for the added āyāt only ---------------------------------------
if (!FETCH_TAFSIR) {
  console.log("Skipped tafsir (--no-tafsir): run `node scripts/fetchTafsir.mjs` later to fill it in.");
  process.exit(0);
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw new Error("unreachable");
}

async function pooled(items, concurrency, worker) {
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
}

const addedBySurah = new Map();
for (const id of toAdd) {
  const surah = Number(id.split(":")[0]);
  if (!addedBySurah.has(surah)) addedBySurah.set(surah, []);
  addedBySurah.get(surah).push(id);
}

for (const [locale, edition] of Object.entries(TAFSIR_EDITIONS)) {
  const file = path.join(CORPUS_DIR, "tafsir", `${locale}.json`);
  const tafsir = existsSync(file)
    ? readJson(file)
    : { sourceId: edition.sourceId, _readme: "", entries: [] };
  const have = new Set(tafsir.entries.map((e) => e.id));
  let added = 0;
  const missing = [];

  await pooled(surahsTouched, 6, async (surah) => {
    const wanted = addedBySurah.get(surah).filter((id) => !have.has(id));
    if (wanted.length === 0) return;
    let rows;
    try {
      rows = await fetchWithRetry(`${TAFSIR_BASE_URL}/${edition.slug}/${surah}.json`);
    } catch (error) {
      console.error(`  ${locale}: failed surah ${surah}: ${String(error)}`);
      missing.push(...wanted);
      return;
    }
    const byAyah = new Map(rows.map((r) => [r.ayah, r.text]));
    for (const id of wanted) {
      const text = byAyah.get(Number(id.split(":")[1]));
      if (text && text.trim()) {
        tafsir.entries.push({ id, text: text.trim() });
        added += 1;
      } else {
        missing.push(id);
      }
    }
  });

  tafsir.entries.sort(byRef);
  writeMinified(file, tafsir);
  console.log(`tafsir ${locale}: +${added} (${missing.length} unavailable${missing.length ? `: ${missing.join(", ")}` : ""})`);
}

console.log("done.");
