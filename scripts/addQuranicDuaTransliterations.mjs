/**
 * Fills the `transliteration` field of the 13 quranic-dua entries in
 * src/data/duas/duas.json — the only invocations without one (the
 * Hisn-style categories ship theirs from the source dataset).
 *
 * Each quranic dua's Arabic is the full consecutive āyāt named by its
 * `source` line ("Qur'an 2:201", "Qur'an 14:40–41"), so the phonetic line
 * is copied VERBATIM from src/data/quran/transliteration.json (the
 * ara-quranphoneticst-la edition — see scripts/buildQuranTransliteration.mjs),
 * joined with a single space for ranges, exactly the join rule the dua
 * generator uses for the Arabic itself. Nothing is generated or edited.
 *
 *   node scripts/addQuranicDuaTransliterations.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const DUAS = path.join(ROOT, "src", "data", "duas", "duas.json");

const translit = JSON.parse(readFileSync(path.join(ROOT, "src", "data", "quran", "transliteration.json"), "utf8"));
const byRef = new Map(translit.entries.map((e) => [`${e.surah}:${e.ayah}`, e.text]));

const duasFile = JSON.parse(readFileSync(DUAS, "utf8"));
let filled = 0;
for (const dua of duasFile.entries) {
  if ((dua.transliteration ?? "").trim() !== "") continue;
  // "Qur'an 2:201" or "Qur'an 14:40–41" (en-dash or hyphen).
  const m = /Qur'an (\d+):(\d+)(?:[–-](\d+))?/.exec(dua.source ?? "");
  if (!m) throw new Error(`${dua.id}: no transliteration and no parsable Qur'an reference in source "${dua.source}"`);
  const surah = Number(m[1]);
  const first = Number(m[2]);
  const last = m[3] ? Number(m[3]) : first;
  const parts = [];
  for (let ayah = first; ayah <= last; ayah++) {
    const text = byRef.get(`${surah}:${ayah}`);
    if (!text) throw new Error(`${dua.id}: no phonetic text for ${surah}:${ayah}`);
    parts.push(text);
  }
  dua.transliteration = parts.join(" ");
  filled += 1;
  console.log(`${dua.id}: ${dua.transliteration.slice(0, 80)}...`);
}

writeFileSync(DUAS, JSON.stringify(duasFile) + "\n");
console.log(`filled ${filled} quranic duas`);
