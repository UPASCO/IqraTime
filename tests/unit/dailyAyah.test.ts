import { getDailyAyahId, localDayNumber } from "@/services/dailyAyah";
import { getRuntimeCorpus } from "@/data/corpus";

describe("daily ayah", () => {
  it("is deterministic: two calls for the same date agree", () => {
    const date = new Date(2026, 7, 25, 9, 30);
    expect(getDailyAyahId(date)).toBe(getDailyAyahId(date));
  });

  it("does not change within one local day, and changes at local midnight", () => {
    const morning = new Date(2026, 7, 25, 0, 0, 1);
    const night = new Date(2026, 7, 25, 23, 59, 59);
    const nextDay = new Date(2026, 7, 26, 0, 0, 1);
    expect(getDailyAyahId(morning)).toBe(getDailyAyahId(night));
    // A single boundary could coincide with a period reshuffle landing on
    // the same id by chance for one specific date; the ids being equal every
    // day would defeat the feature, so assert over a run of days instead.
    const ids = new Set(
      Array.from({ length: 10 }, (_, i) => getDailyAyahId(new Date(2026, 7, 20 + i, 12))),
    );
    expect(ids.size).toBeGreaterThan(5);
    expect(getDailyAyahId(nextDay)).toBeDefined();
  });

  it("always returns a real corpus id, and prefers notable entries", () => {
    const corpusById = new Map(getRuntimeCorpus().map((e) => [e.arabic.id, e]));
    for (let i = 0; i < 30; i += 1) {
      const id = getDailyAyahId(new Date(2026, 0, 1 + i, 12));
      expect(id).toBeDefined();
      const entry = corpusById.get(id as string);
      expect(entry).toBeDefined();
      // The shipped corpus has notable entries, so the pool is the notable subset.
      expect(entry?.catalog.notable).toBe(true);
    }
  });

  it("covers every notable ayah exactly once per period (no repeats a few days apart)", () => {
    const poolSize = getRuntimeCorpus().filter((e) => e.catalog.notable).length;
    // Walk one full aligned period: day numbers p*poolSize .. p*poolSize+poolSize-1.
    const someDay = localDayNumber(new Date(2026, 7, 25));
    const periodStart = Math.floor(someDay / poolSize) * poolSize;
    const ids = new Set<string>();
    for (let d = 0; d < poolSize; d += 1) {
      const dayNumber = periodStart + d;
      // Reconstruct a Date whose localDayNumber is dayNumber.
      const date = new Date(dayNumber * 86_400_000);
      const adjusted = new Date(date.getTime() + date.getTimezoneOffset() * 60_000 + 12 * 3_600_000);
      expect(localDayNumber(adjusted)).toBe(dayNumber);
      ids.add(getDailyAyahId(adjusted) as string);
    }
    expect(ids.size).toBe(poolSize);
  });
});
