/**
 * Writes the `notable` flag onto every entry in
 * src/data/corpus/catalog.json, from the shared ICONIC_REFS list in
 * ./iconicRefs.mjs — the same list scripts/buildFullCorpus.mjs uses to
 * decide which āyāt make it into the shipped corpus at all.
 *
 * The runtime selection engine weights `notable` entries up heavily
 * (src/services/selectionEngine/weighting.ts), so a rotation front-loads
 * the āyāt a user is most likely to recognise on sight, while the
 * anti-repeat filter still guarantees the rest are reached before
 * anything repeats. Purely a weighting hint — nothing is ever excluded
 * for lacking the flag.
 *
 * Touches only the `notable` field: ids, status, themes, isDemoOnly and
 * editorialNote are left exactly as they are, so this is safe to re-run
 * and cannot disturb review state or stored favorites/history. Needs no
 * network access.
 *
 * Usage: node scripts/markNotableAyat.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ICONIC_REFS } from "./iconicRefs.mjs";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const catalogPath = path.join(ROOT, "src/data/corpus/catalog.json");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

let notableCount = 0;
for (const entry of catalog.entries) {
  const notable = ICONIC_REFS.has(entry.id);
  if (notable) {
    entry.notable = true;
    notableCount++;
  } else {
    // Absent rather than `false`: `notable` is optional on CatalogEntry and
    // the majority case shouldn't cost bundle size on every entry.
    delete entry.notable;
  }
}

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

console.log(`Marked ${notableCount} of ${catalog.entries.length} āyāt as notable.`);
