/**
 * Fetches per-ayah tafsir (scholarly exegesis/context) text for every āyah
 * already in the editorial corpus, from the spa5k/tafsir_api project
 * (https://github.com/spa5k/tafsir_api), a mirror of the tafsir texts
 * served by quran.com. Run manually, not part of CI or the app bundle:
 *
 *   node scripts/fetchTafsir.mjs
 *
 * WHAT THIS SCRIPT DOES AND DOES NOT DO
 * --------------------------------------
 * It fetches real, published tafsir text verbatim, per surah, and keeps
 * only the āyāt already selected into src/data/corpus/arabic.json. It
 * never generates, paraphrases, or invents explanatory text — doing so
 * for religious content would risk misattributing words to scholars who
 * never wrote them. Every locale here uses the same work — Al-Mukhtasar
 * fi Tafsir al-Qur'an al-Karim, a modern, deliberately concise explanatory
 * commentary produced by the Tafsir Center for Quranic Studies in Madinah
 * — chosen because it is the one tafsir available across nearly every
 * language this app supports, and because a short comment is what a
 * mobile "tap for context" panel can actually show. Classical tafsirs
 * (Ibn Kathir, al-Tabari, al-Qurtubi) are available in this same API for
 * Arabic/English but run to multi-paragraph entries unsuited to that UI;
 * a future revision could offer them as an optional "read more" link.
 *
 * Portuguese has no tafsir edition in this dataset at all — left out
 * deliberately rather than silently falling back to another language and
 * mislabelling it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const CORPUS_DIR = path.join(ROOT, "src", "data", "corpus");
const OUT_DIR = path.join(CORPUS_DIR, "tafsir");
const BASE_URL = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";

const TAFSIR_EDITIONS = {
  ar: { slug: "ar-tafsir-al-mukhtasar", sourceId: "ar-mukhtasar-v1" },
  en: { slug: "en-tafsir-al-mukhtasar", sourceId: "en-mukhtasar-v1" },
  fr: { slug: "french-mokhtasar", sourceId: "fr-mukhtasar-v1" },
  es: { slug: "spanish-mokhtasar", sourceId: "es-mukhtasar-v1" },
  hi: { slug: "hindi-mokhtasar", sourceId: "hi-mukhtasar-v1" },
  bn: { slug: "bengali-mokhtasar", sourceId: "bn-mukhtasar-v1" },
  "zh-CN": { slug: "chinese-mokhtasar", sourceId: "zh-mukhtasar-v1" },
  it: { slug: "italian-mokhtasar", sourceId: "it-mukhtasar-v1" },
  ru: { slug: "russian-mokhtasar", sourceId: "ru-mukhtasar-v1" },
};

const arabicEntries = JSON.parse(readFileSync(path.join(CORPUS_DIR, "arabic.json"), "utf8")).entries;
const surahs = [...new Set(arabicEntries.map((e) => e.surah))].sort((a, b) => a - b);
const idsBySurah = new Map();
for (const e of arabicEntries) {
  if (!idsBySurah.has(e.surah)) idsBySurah.set(e.surah, []);
  idsBySurah.get(e.surah).push({ id: e.id, ayah: e.ayah });
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

/** Runs async tasks with a bounded concurrency instead of firing all requests at once. */
async function pooled(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function fetchLocale(locale, edition) {
  const entries = [];
  const missing = [];

  await pooled(surahs, 8, async (surah) => {
    const url = `${BASE_URL}/${edition.slug}/${surah}.json`;
    let rows;
    try {
      rows = await fetchWithRetry(url);
    } catch (error) {
      console.error(`  ${locale}: failed surah ${surah}: ${String(error)}`);
      return;
    }
    const byAyah = new Map(rows.map((r) => [r.ayah, r.text]));
    for (const { id, ayah } of idsBySurah.get(surah)) {
      const text = byAyah.get(ayah);
      if (text && text.trim()) {
        entries.push({ id, text: text.trim() });
      } else {
        missing.push(id);
      }
    }
  });

  entries.sort((a, b) => {
    const [as, aa] = a.id.split(":").map(Number);
    const [bs, ba] = b.id.split(":").map(Number);
    return as - bs || aa - ba;
  });

  console.log(`${locale}: ${entries.length}/${arabicEntries.length} entries (${missing.length} missing)`);

  const out = {
    sourceId: edition.sourceId,
    _readme:
      "Tafsir text (scholarly explanation/context) for the āyāt in this corpus, fetched verbatim from spa5k/tafsir_api (mirroring quran.com), edition slug '" +
      edition.slug +
      "'. Regenerate with scripts/fetchTafsir.mjs. Not hand-typed and never edited by hand.",
    entries,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, `${locale}.json`), JSON.stringify(out) + "\n");
}

for (const [locale, edition] of Object.entries(TAFSIR_EDITIONS)) {
  await fetchLocale(locale, edition);
}

console.log("done.");
