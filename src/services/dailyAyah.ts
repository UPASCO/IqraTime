import { getRuntimeCorpus, type CorpusEntry } from "@/data/corpus";
import { mulberry32 } from "./selectionEngine/rng";

/**
 * The "Āyah of the day": one āyah, the same for every user on the same
 * local calendar day, chosen deterministically from the notable subset of
 * the corpus (the ~165 widely-recognised āyāt — see CatalogEntry.notable).
 *
 * Why deterministic and shared: a daily ritual works when it's communal —
 * two people comparing phones on the same day see the same āyah, screenshots
 * shared in a group match what recipients see in their own app, and the
 * pick needs no network, no server and no stored state to agree everywhere.
 *
 * Why the notable subset: the daily slot is the app's most visible single
 * placement, so it always carries an āyah a reader is likely to recognise
 * (the full corpus keeps rotating everywhere else).
 *
 * The walk is a seeded shuffle over a period of the subset's length rather
 * than an independent draw per day, so within one period every notable
 * āyah appears exactly once — no repeats a few days apart, no near-misses.
 */

/** Days since Unix epoch in the DEVICE's local calendar (not UTC), so the āyah changes at local midnight. */
export function localDayNumber(now: Date): number {
  // Date.UTC on the local Y/M/D yields a timestamp exactly at that local
  // calendar day's boundary independent of timezone offset.
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

function notablePool(): readonly CorpusEntry[] {
  const corpus = getRuntimeCorpus();
  const notable = corpus.filter((e) => e.catalog.notable);
  // Corpus without notable flags (never expected in production, but the
  // daily slot must not dead-end): fall back to the whole corpus.
  return notable.length > 0 ? notable : corpus;
}

/** Deterministic Fisher-Yates order of pool indices for one period, seeded by the period number. */
function shuffledIndices(poolSize: number, periodSeed: number): number[] {
  const random = mulberry32(periodSeed);
  const indices = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = poolSize - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = indices[i] as number;
    indices[i] = indices[j] as number;
    indices[j] = a;
  }
  return indices;
}

/**
 * The āyah of the day for the given date (defaults to now). Same output for
 * any two devices on the same local calendar day with the same corpus.
 */
export function getDailyAyahId(now: Date = new Date()): string | undefined {
  const pool = notablePool();
  if (pool.length === 0) return undefined;

  const day = localDayNumber(now);
  const period = Math.floor(day / pool.length);
  const offset = day % pool.length;
  const order = shuffledIndices(pool.length, period);
  const index = order[offset] as number;
  return pool[index]?.arabic.id;
}
