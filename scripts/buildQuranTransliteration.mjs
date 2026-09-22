/**
 * Builds src/data/quran/transliteration.json — the Latin phonetic
 * transcription of the complete Qur'an (6236 āyāt) — fetched VERBATIM from
 * the `ara-quranphoneticst-la` edition of fawazahmed0/quran-api, the same
 * source the app's Arabic text and reader translations come from. Chosen
 * over `ara-quran-la` because its romanization is what non-Arabic readers
 * actually read aloud ("Bismi Allahi Ar-Rahmani Ar-Rahimi" rather than
 * "alrrahmani alrraheemi"). No text is generated or edited here — entries
 * are copied one-for-one, keyed by surah/ayah.
 *
 *   node scripts/buildQuranTransliteration.mjs
 *
 * Set QURAN_EDITIONS_DIR to a directory holding an already-downloaded
 * `ara-quranphoneticst-la.min.json` to skip the download.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const OUT = path.join(ROOT, "src", "data", "quran", "transliteration.json");
const EDITION = "ara-quranphoneticst-la";
const EDITION_URL = `https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/${EDITION}.min.json`;

let data;
const cached = process.env.QURAN_EDITIONS_DIR ? path.join(process.env.QURAN_EDITIONS_DIR, `${EDITION}.min.json`) : undefined;
if (cached && existsSync(cached)) {
  console.log(`using cached ${cached}`);
  data = JSON.parse(readFileSync(cached, "utf8"));
} else {
  console.log(`fetching ${EDITION_URL}`);
  const res = await fetch(EDITION_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${EDITION_URL}`);
  data = await res.json();
}

const entries = data.quran.map((v) => ({ surah: v.chapter, ayah: v.verse, text: v.text }));
if (entries.length !== 6236) throw new Error(`expected 6236 verses, got ${entries.length}`);
if (entries.some((e) => !e.text || !e.text.trim())) throw new Error("empty transliteration text in source edition");

const out = {
  _readme:
    "Latin phonetic transcription of the complete Qur'an, fetched verbatim from the ara-quranphoneticst-la edition of fawazahmed0/quran-api (same source as arabic.json and the reader translations). Regenerate with scripts/buildQuranTransliteration.mjs. Not hand-typed and never edited by hand.",
  sourceId: "quran-phonetic-transcription-la-v1",
  entries,
};
writeFileSync(OUT, JSON.stringify(out) + "\n");
console.log(`wrote ${OUT} (${entries.length} entries)`);
