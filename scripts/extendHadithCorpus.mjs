/**
 * Adds the curated hadith listed in scripts/curatedHadithAdditions.mjs to
 * the hadith corpus (src/data/corpus/hadith/), without touching any entry
 * already there. Run manually, requires network access:
 *
 *   node scripts/extendHadithCorpus.mjs
 *
 * Set HADITH_EDITIONS_DIR to a directory holding already-downloaded
 * `{lang}-{collection}.min.json` edition files to skip the download (the
 * ten files are ~70 MB).
 *
 * Text comes verbatim from the same fawazahmed0/hadith-api editions
 * scripts/buildHadithCorpus.mjs fetched the original 500 entries from, in
 * every language that edition has; the same required-language rule applies
 * (Arabic, English, French and Bengali must all be present — Russian is
 * used where present). An id that fails aborts the run so the whitelist is
 * fixed rather than silently shipping a half-translated hadith. Themes are
 * tagged by the shared rule in scripts/hadithThemes.mjs. New entries ship
 * as "publishable" on the same terms as the curated āyāt — see
 * scripts/extendCorpus.mjs and docs/CORPUS.md.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { CURATED_HADITH_ADDITIONS } from "./curatedHadithAdditions.mjs";
import { hadithThemesFor } from "./hadithThemes.mjs";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "src", "data", "corpus", "hadith");
const BASE_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";
const CACHE_DIR = process.env.HADITH_EDITIONS_DIR;

const COLLECTIONS = { bukhari: "Sahih al-Bukhari", muslim: "Sahih Muslim" };
const REQUIRED_LOCALES = ["ar", "en", "fr", "bn"];
const OPTIONAL_LOCALES = ["ru"];
const EDITION_PREFIX = { ar: "ara", en: "eng", fr: "fra", bn: "ben", ru: "rus" };
const TRANSLATED_LOCALES = ["en", "fr", "bn", "ru"];

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeMinified = (file, data) => writeFileSync(file, JSON.stringify(data) + "\n");
const writePretty = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const byId = (a, b) => {
  const [ac, an] = a.id.split(":");
  const [bc, bn] = b.id.split(":");
  return ac === bc ? Number(an) - Number(bn) : ac.localeCompare(bc);
};

function isUsableText(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/\(see hadith\)?\.?$/i.test(trimmed)) return false;
  return true;
}

async function loadEdition(collection, locale) {
  const slug = `${EDITION_PREFIX[locale]}-${collection}.min.json`;
  const cached = CACHE_DIR ? path.join(CACHE_DIR, slug) : undefined;
  let data;
  if (cached && existsSync(cached)) {
    data = readJson(cached);
  } else {
    const url = `${BASE_URL}/${slug}`;
    console.log(`fetching ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    data = await res.json();
  }
  return new Map(data.hadiths.map((h) => [h.hadithnumber, h.text]));
}

// --- Current corpus -------------------------------------------------------
const arabicFile = readJson(path.join(OUT, "arabic.json"));
const catalogFile = readJson(path.join(OUT, "catalog.json"));
const translationFiles = Object.fromEntries(TRANSLATED_LOCALES.map((locale) => [locale, readJson(path.join(OUT, "translations", `${locale}.json`))]));
const existingIds = new Set(catalogFile.entries.map((e) => e.id));

if (new Set(CURATED_HADITH_ADDITIONS).size !== CURATED_HADITH_ADDITIONS.length) {
  throw new Error("curatedHadithAdditions.mjs contains a duplicate id");
}
const toAdd = CURATED_HADITH_ADDITIONS.filter((id) => !existingIds.has(id));
for (const id of toAdd) {
  const [collection, number] = id.split(":");
  if (!(collection in COLLECTIONS) || !/^\d+$/.test(number ?? "")) throw new Error(`Malformed id "${id}" in curatedHadithAdditions.mjs`);
}
if (toAdd.length === 0) {
  console.log("Nothing to add: every curated hadith is already in the corpus.");
  process.exit(0);
}

// --- Fetch only the collections actually needed ---------------------------
const neededCollections = [...new Set(toAdd.map((id) => id.split(":")[0]))];
const editions = {};
for (const collection of neededCollections) {
  editions[collection] = {};
  for (const locale of [...REQUIRED_LOCALES, ...OPTIONAL_LOCALES]) {
    editions[collection][locale] = await loadEdition(collection, locale);
  }
}

// --- Validate, then append ------------------------------------------------
const failures = [];
const accepted = [];
for (const id of toAdd) {
  const [collection, numberRaw] = id.split(":");
  const number = Number(numberRaw);
  const missing = REQUIRED_LOCALES.filter((locale) => !isUsableText(editions[collection][locale].get(number)));
  if (missing.length > 0) {
    failures.push(`${id}: no usable text in ${missing.join(", ")}`);
    continue;
  }
  accepted.push({ id, collection, number });
}
if (failures.length > 0) {
  console.error("Refusing to extend the hadith corpus — these curated ids are not complete in every required language:");
  for (const line of failures) console.error(`  ✗ ${line}`);
  process.exit(1);
}

for (const { id, collection, number } of accepted) {
  arabicFile.entries.push({
    id,
    collection,
    collectionDisplayName: COLLECTIONS[collection],
    hadithNumber: number,
    text: editions[collection].ar.get(number),
  });
  catalogFile.entries.push({
    id,
    status: "publishable",
    themes: hadithThemesFor(editions[collection].en.get(number)),
    isDemoOnly: false,
  });
  for (const locale of TRANSLATED_LOCALES) {
    const text = editions[collection][locale].get(number);
    if (isUsableText(text)) translationFiles[locale].entries.push({ id, text: text.trim() });
  }
}

arabicFile.entries.sort(byId);
catalogFile.entries.sort(byId);
for (const locale of TRANSLATED_LOCALES) translationFiles[locale].entries.sort(byId);

writeMinified(path.join(OUT, "arabic.json"), arabicFile);
writePretty(path.join(OUT, "catalog.json"), catalogFile);
for (const locale of TRANSLATED_LOCALES) writeMinified(path.join(OUT, "translations", `${locale}.json`), translationFiles[locale]);

console.log(`Added ${accepted.length} hadith — corpus is now ${catalogFile.entries.length} entries.`);
for (const locale of TRANSLATED_LOCALES) {
  console.log(`${locale}: ${translationFiles[locale].entries.length}/${catalogFile.entries.length} entries have text`);
}
console.log("done.");
