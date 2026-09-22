/**
 * Removes reference-only chain-variant entries (see
 * scripts/hadithFragmentPatterns.mjs for what they are and why they were
 * reported as a translation-mismatch bug) from every hadith corpus file:
 * arabic.json, catalog.json and translations/{en,fr,bn,ru}.json stay in
 * perfect id lockstep. Runs offline against the checked-in files — no
 * network, no text edited, entries only dropped whole.
 *
 *   node scripts/pruneHadithChainVariants.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { isStandaloneReport } from "./hadithFragmentPatterns.mjs";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "src", "data", "corpus", "hadith");

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeMinified = (file, data) => writeFileSync(file, JSON.stringify(data) + "\n");
const writePretty = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + "\n");

const arabicFile = readJson(path.join(OUT, "arabic.json"));
const catalogFile = readJson(path.join(OUT, "catalog.json"));
const en = readJson(path.join(OUT, "translations", "en.json"));

const enById = new Map(en.entries.map((e) => [e.id, e.text]));
const removed = arabicFile.entries
  .filter((e) => !isStandaloneReport(e.id, enById.get(e.id) ?? ""))
  .map((e) => e.id);
const removedSet = new Set(removed);

console.log(`removing ${removed.length} reference-only entries of ${arabicFile.entries.length}:`);
for (const id of removed) console.log(`  ${id}`);

arabicFile.entries = arabicFile.entries.filter((e) => !removedSet.has(e.id));
catalogFile.entries = catalogFile.entries.filter((e) => !removedSet.has(e.id));
writeMinified(path.join(OUT, "arabic.json"), arabicFile);
writePretty(path.join(OUT, "catalog.json"), catalogFile);

for (const locale of ["en", "fr", "bn", "ru"]) {
  const file = path.join(OUT, "translations", `${locale}.json`);
  const data = readJson(file);
  const before = data.entries.length;
  data.entries = data.entries.filter((e) => !removedSet.has(e.id));
  writeMinified(file, data);
  console.log(`${locale}: ${before} -> ${data.entries.length}`);
}

console.log(`arabic/catalog: -> ${arabicFile.entries.length}`);
console.log("done.");
