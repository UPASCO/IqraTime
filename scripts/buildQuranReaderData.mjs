/**
 * Builds src/data/quran/ — the FULL Qur'an (all 114 surahs, 6236 āyāt),
 * completely separate from src/data/corpus/ (the curated 300-āyah set used
 * for notifications). This is the "read the whole Qur'an, jump to any āyah"
 * reader's dataset: no mechanical suitability filter, no curation — every
 * āyah ships, because a reader that skips 95% of the Qur'an isn't a reader.
 *
 * Run manually (not part of CI or the app bundle):
 *
 *   node scripts/buildQuranReaderData.mjs /path/to/downloaded/editions
 *
 * The directory must contain the same files scripts/buildFullCorpus.mjs
 * uses: ara-quranuthmanihaf.json, the eleven translation editions listed in
 * EDITIONS below, and surah.json from semarketir/quranjson.
 *
 * Text handling follows the exact same absolute rule as the rest of this
 * project: every character is fetched verbatim from the source dataset,
 * never generated, paraphrased, or altered by an AI model.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const srcDir = process.argv[2];
if (!srcDir) {
  console.error("usage: node scripts/buildQuranReaderData.mjs <editions-dir>");
  process.exit(1);
}

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "src", "data", "quran");

const ARABIC_EDITION = "ara-quranuthmanihaf";
// Same editions/sources as scripts/buildFullCorpus.mjs — the translator
// choices already made for the notification corpus apply equally here;
// see src/data/corpus/sources.ts for the full TranslationSourceInfo per
// locale (translator name, license, etc.) — reused as-is, not duplicated.
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

/** Hindi/Bengali editions carry bracketed footnote markers; strip them (a purely typographic removal, no wording is altered) — same cleanup as buildFullCorpus.mjs. */
const cleanText = (text) => text.replace(/\[[0-9०-९০-৯]+\]/g, "").replace(/\s{2,}/g, " ").trim();

const arabic = load(ARABIC_EDITION).quran;
const surahMeta = load("surah");
const translations = Object.fromEntries(
  Object.entries(EDITIONS).map(([locale, edition]) => [
    locale,
    new Map(load(edition).quran.map((v) => [key(v), cleanText(v.text)])),
  ]),
);

if (arabic.length !== 6236) {
  console.error(`expected 6236 āyāt in the Arabic edition, got ${arabic.length} — refusing to write a short Qur'an`);
  process.exit(1);
}

// --- Surah metadata ------------------------------------------------------

const surahsOut = {
  _readme:
    "Metadata for all 114 surahs (Arabic name, transliterated name, āyah count, place of revelation), fetched verbatim from semarketir/quranjson's surah.json. Regenerate with scripts/buildQuranReaderData.mjs.",
  surahs: surahMeta
    .map((s) => ({
      number: Number(s.index),
      nameArabic: s.titleAr,
      nameTransliterated: s.title,
      ayahCount: s.count,
      // "Makkiyah"/"Madaniyah" (place of revelation) is a well-established,
      // non-controversial classification, not an editorial judgement.
      revelationPlace: s.place === "Medina" ? "medina" : "mecca",
    }))
    .sort((a, b) => a.number - b.number),
};

const ayahCountBySurah = new Map(surahsOut.surahs.map((s) => [s.number, s.ayahCount]));
for (const verse of arabic) {
  if (ayahCountBySurah.get(verse.chapter) === undefined) {
    console.error(`surah ${verse.chapter} has no metadata entry`);
    process.exit(1);
  }
}

// --- Full Arabic text ------------------------------------------------------
// Surah name is deliberately NOT repeated per āyah here (unlike the curated
// corpus's arabic.json) — with 6236 entries instead of 300, that would just
// duplicate the same 114 strings thousands of times. Look up surahs.json by
// `surah` instead.

const arabicOut = {
  _readme:
    "The complete Qur'an, all 114 surahs / 6236 āyāt, fetched verbatim from the King Fahd Complex Uthmani text (Hafs 'an 'Asim) as published in fawazahmed0/quran-api, edition ara-quranuthmanihaf. This is the full-Qur'an reader's dataset — see src/data/corpus/ for the separate, curated 300-āyah notification set. Regenerate with scripts/buildQuranReaderData.mjs. Not hand-typed and never edited by hand.",
  entries: arabic
    .map((v) => ({ surah: v.chapter, ayah: v.verse, text: v.text }))
    .sort((a, b) => a.surah - b.surah || a.ayah - b.ayah),
};

mkdirSync(path.join(OUT, "translations"), { recursive: true });
writeFileSync(path.join(OUT, "arabic.json"), JSON.stringify(arabicOut) + "\n");
writeFileSync(path.join(OUT, "surahs.json"), JSON.stringify(surahsOut) + "\n");

for (const [locale, edition] of Object.entries(EDITIONS)) {
  const map = translations[locale];
  const entries = arabic
    .map((v) => {
      const text = map.get(key(v));
      return text ? { surah: v.chapter, ayah: v.verse, text } : undefined;
    })
    .filter(Boolean)
    .sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
  if (entries.length !== 6236) {
    console.error(`${locale} (${edition}): only ${entries.length}/6236 āyāt translated — refusing to write an incomplete file`);
    process.exit(1);
  }
  const file = { sourceId: SOURCE_IDS[locale], entries };
  writeFileSync(path.join(OUT, "translations", `${locale}.json`), JSON.stringify(file) + "\n");
}

console.log(`wrote ${arabicOut.entries.length} āyāt across ${surahsOut.surahs.length} surahs + ${Object.keys(EDITIONS).length} full translation files`);
