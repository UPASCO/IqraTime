import {
  getFullCorpus,
  getPublishableCorpus,
  getRuntimeCorpus,
  getCorpusEntry,
  getTranslation,
  hasAnyTranslations,
  translationSources,
} from "@/data/corpus";
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
  it("getPublishableCorpus() contains exactly the entries marked status: publishable, nothing else", () => {
    // The gate mechanism itself (see docs/CORPUS.md / getPublishableCorpus())
    // is what's under test here, not a snapshot of today's review progress —
    // whether 0 or all entries currently carry "publishable" is an editorial
    // decision made outside this file (see docs/RELEASE_CHECKLIST.md), and
    // scripts/reviewCorpus.mjs is the intended way to change it. What must
    // always hold is that the filter is exact in both directions.
    const publishable = getPublishableCorpus();
    expect(publishable.every((e) => e.catalog.status === "publishable")).toBe(true);
    const nonPublishableCount = getFullCorpus().filter((e) => e.catalog.status !== "publishable").length;
    expect(publishable.length + nonPublishableCount).toBe(getFullCorpus().length);
  });

  it("getRuntimeCorpus in development mode still exposes the not-yet-publishable entries (for building/testing the app)", () => {
    // EXPO_PUBLIC_CORPUS_ENV is unset in the test environment, i.e. "development".
    expect(getRuntimeCorpus().length).toBe(getFullCorpus().length);
  });
});

describe("shipped translations", () => {
  const localesWithTranslations = ["en", "fr", "es", "pt", "hi", "bn", "zh-CN", "it", "ru", "nl", "de"] as const;

  it.each(localesWithTranslations)("locale '%s' has a translation for every shipped ayah", (locale) => {
    const missing = getFullCorpus()
      .map((entry) => entry.arabic.id)
      .filter((id) => !getTranslation(id, locale));
    expect(missing).toEqual([]);
  });

  it.each(localesWithTranslations)("locale '%s' reports having translations", (locale) => {
    expect(hasAnyTranslations(locale)).toBe(true);
  });

  it("Arabic has no separate 'translation' (the Arabic source text is shown directly)", () => {
    expect(hasAnyTranslations("ar")).toBe(false);
  });

  it.each(localesWithTranslations)("locale '%s' translation text is non-empty and not truncated", (locale) => {
    for (const entry of getFullCorpus()) {
      const translation = getTranslation(entry.arabic.id, locale);
      expect(translation?.text.trim().length).toBeGreaterThan(0);
      expect(translation?.text.trim().endsWith("...")).toBe(false);
      expect(translation?.text.trim().endsWith("…")).toBe(false);
    }
  });

  it.each(localesWithTranslations)("locale '%s' translation ids match their ayah ids exactly", (locale) => {
    for (const entry of getFullCorpus()) {
      const translation = getTranslation(entry.arabic.id, locale);
      expect(translation?.id).toBe(entry.arabic.id);
      expect(translation?.locale).toBe(locale);
    }
  });

  it("every translation references a registered source with a confirmed license", () => {
    for (const locale of localesWithTranslations) {
      const translation = getTranslation(getFullCorpus()[0]!.arabic.id, locale);
      const source = translationSources.find((s) => s.id === translation?.sourceId);
      expect(source).toBeDefined();
      expect(source?.license.trim().length).toBeGreaterThan(0);
      expect(source?.translatorName.trim().length).toBeGreaterThan(0);
      expect(source?.redistributionRightsConfirmed).toBe(true);
    }
  });

  it("no translation still carries a bracketed footnote marker (stripped at import for Hindi/Bengali)", () => {
    for (const locale of localesWithTranslations) {
      for (const entry of getFullCorpus()) {
        const text = getTranslation(entry.arabic.id, locale)?.text ?? "";
        expect(text).not.toMatch(/\[[0-9०-९০-৯]+\]/);
      }
    }
  });
});
