import { getFullCorpus, getPublishableCorpus, getRuntimeCorpus, getCorpusEntry } from "@/data/corpus";
import { EDITORIAL_STATUS_ORDER, parseAyahId, makeAyahId } from "@/domain/types";

describe("shipped corpus integrity", () => {
  const entries = getFullCorpus();

  it("is non-empty (the demo corpus ships at least a few sample ayat)", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = entries.map((e) => e.arabic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry's arabic.id matches its catalog.id (referential consistency)", () => {
    for (const entry of entries) {
      expect(entry.arabic.id).toBe(entry.catalog.id);
    }
  });

  it("every entry's id round-trips through makeAyahId/parseAyahId", () => {
    for (const entry of entries) {
      const ref = parseAyahId(entry.arabic.id);
      expect(ref.surah).toBe(entry.arabic.surah);
      expect(ref.ayah).toBe(entry.arabic.ayah);
      expect(makeAyahId(ref)).toBe(entry.arabic.id);
    }
  });

  it("has a valid surah number (1-114) and a positive ayah number", () => {
    for (const entry of entries) {
      expect(entry.arabic.surah).toBeGreaterThanOrEqual(1);
      expect(entry.arabic.surah).toBeLessThanOrEqual(114);
      expect(entry.arabic.ayah).toBeGreaterThanOrEqual(1);
    }
  });

  it("never has empty Arabic text", () => {
    for (const entry of entries) {
      expect(entry.arabic.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("never has an artificially truncated Arabic text (no trailing ellipsis)", () => {
    for (const entry of entries) {
      expect(entry.arabic.text.trim().endsWith("...")).toBe(false);
      expect(entry.arabic.text.trim().endsWith("…")).toBe(false);
    }
  });

  it("has a valid, known editorial status for every entry", () => {
    for (const entry of entries) {
      expect(EDITORIAL_STATUS_ORDER).toContain(entry.catalog.status);
    }
  });

  it("getCorpusEntry resolves every shipped id", () => {
    for (const entry of entries) {
      expect(getCorpusEntry(entry.arabic.id)).toBeDefined();
    }
  });

  it("getCorpusEntry returns undefined for an unknown id (no crash, safe fallback)", () => {
    expect(getCorpusEntry("999:999")).toBeUndefined();
  });
});

describe("production-build corpus gate", () => {
  it("the demo corpus contains no 'publishable' entries yet (this is expected and intentional)", () => {
    // See docs/CORPUS.md: the shipped sample data is explicitly draft-status
    // pending human religious/editorial review, so a production build must
    // end up with zero usable ayat until that review happens — which is
    // exactly what scripts/validateCorpus.ts is designed to catch and block on.
    expect(getPublishableCorpus()).toHaveLength(0);
  });

  it("getRuntimeCorpus in development mode still exposes the draft entries (for building/testing the app)", () => {
    // EXPO_PUBLIC_CORPUS_ENV is unset in the test environment, i.e. "development".
    expect(getRuntimeCorpus().length).toBe(getFullCorpus().length);
  });
});
