import { selectAyah } from "@/services/selectionEngine";
import { buildFixtureCorpus, buildFixtureTranslations } from "../fixtures/corpusFixtures";

describe("selectAyah", () => {
  const corpus = buildFixtureCorpus(12);
  const translations = buildFixtureTranslations(corpus);
  const getTranslation = (id: string, locale: string) => (locale === "en" ? translations.get(id) : undefined);

  const baseInput = {
    corpus,
    getTranslation,
    translationLocale: "en" as const,
    showArabic: false,
    requireTranslation: true,
    localHour: 10,
    selectedThemes: [],
    recentAyahIds: [],
    recentThemes: [],
    favoriteAyahIds: [],
    hiddenAyahIds: [],
    maxLength: 200,
    mode: "balanced_random" as const,
  };

  it("strongly favours notable ayat while still leaving the rest reachable", () => {
    // The catalog `notable` flag marks the ~165 widely-recognised ayat (see
    // CatalogEntry.notable); weighting.ts boosts them so a rotation
    // front-loads them. It must stay a weight and never become a filter —
    // an unflagged ayah still has to be selectable, or a rotation could
    // never reach the rest of the corpus.
    const withNotable = corpus.map((entry, i) => ({
      ...entry,
      catalog: { ...entry.catalog, notable: i < 3 },
    }));
    const notableIds = new Set(withNotable.slice(0, 3).map((e) => e.arabic.id));

    const picks = Array.from({ length: 200 }, (_, seed) =>
      selectAyah({ ...baseInput, corpus: withNotable, randomSeed: seed }),
    ).flatMap((r) => (r.status === "selected" ? [r.ayahId] : []));

    const notableShare = picks.filter((id) => notableIds.has(id)).length / picks.length;
    // 3 of 12 ayat are notable, so an unweighted engine would land near
    // 0.25; the boost should lift it well past that without reaching 1.
    expect(notableShare).toBeGreaterThan(0.4);
    expect(new Set(picks.filter((id) => !notableIds.has(id))).size).toBeGreaterThan(0);
  });

  it("is deterministic given the same seed", () => {
    const a = selectAyah({ ...baseInput, randomSeed: 42 });
    const b = selectAyah({ ...baseInput, randomSeed: 42 });
    expect(a).toEqual(b);
  });

  it("can produce different results for different seeds", () => {
    const results = new Set(
      Array.from({ length: 20 }, (_, i) => selectAyah({ ...baseInput, randomSeed: i })).map((r) =>
        r.status === "selected" ? r.ayahId : "none",
      ),
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it("never selects an ayah in the anti-repeat window when alternatives exist", () => {
    const recentAyahIds = corpus.slice(0, 8).map((e) => e.arabic.id);
    for (let seed = 0; seed < 15; seed += 1) {
      const result = selectAyah({ ...baseInput, recentAyahIds, randomSeed: seed });
      expect(result.status).toBe("selected");
      if (result.status === "selected") {
        expect(recentAyahIds).not.toContain(result.ayahId);
      }
    }
  });

  it("filters out entries longer than maxLength", () => {
    const shortMax = 30;
    for (let seed = 0; seed < 15; seed += 1) {
      const result = selectAyah({ ...baseInput, maxLength: shortMax, randomSeed: seed });
      if (result.status === "selected") {
        const translation = translations.get(result.ayahId);
        expect(translation!.text.length).toBeLessThanOrEqual(shortMax);
      }
    }
  });

  it("respects a theme filter when themes are selected", () => {
    for (let seed = 0; seed < 15; seed += 1) {
      const result = selectAyah({ ...baseInput, selectedThemes: ["courage"], mode: "chosen_themes", randomSeed: seed });
      expect(result.status).toBe("selected");
      if (result.status === "selected") {
        expect(result.entry.catalog.themes).toContain("courage");
      }
    }
  });

  it("excludes hidden ayat when alternatives exist", () => {
    const hiddenAyahIds = corpus.slice(0, 6).map((e) => e.arabic.id);
    for (let seed = 0; seed < 15; seed += 1) {
      const result = selectAyah({ ...baseInput, hiddenAyahIds, randomSeed: seed });
      if (result.status === "selected") {
        expect(hiddenAyahIds).not.toContain(result.ayahId);
      }
    }
  });

  it("in favorites_only mode only returns favorited ayat", () => {
    const favoriteAyahIds = [corpus[0]!.arabic.id, corpus[3]!.arabic.id];
    for (let seed = 0; seed < 15; seed += 1) {
      const result = selectAyah({ ...baseInput, mode: "favorites_only", favoriteAyahIds, randomSeed: seed });
      expect(result.status).toBe("selected");
      if (result.status === "selected") {
        expect(favoriteAyahIds).toContain(result.ayahId);
      }
    }
  });

  it("falls back gracefully (relaxing filters) instead of looping forever when filters are overly restrictive", () => {
    const recentAyahIds = corpus.map((e) => e.arabic.id); // every ayah is "recent"
    const result = selectAyah({ ...baseInput, recentAyahIds, selectedThemes: ["courage"], mode: "chosen_themes", randomSeed: 1 });
    expect(result.status).toBe("selected");
    if (result.status === "selected") {
      expect(result.relaxedFilters.length).toBeGreaterThan(0);
    }
  });

  it("returns no_candidates rather than throwing when the corpus is empty", () => {
    const result = selectAyah({ ...baseInput, corpus: [], randomSeed: 1 });
    expect(result.status).toBe("no_candidates");
  });

  it("falls back to Arabic-only when no translation exists and translation is required", () => {
    const result = selectAyah({
      ...baseInput,
      translationLocale: "ru", // fixture translations are only in "en"
      showArabic: true,
      randomSeed: 1,
    });
    expect(result.status).toBe("selected");
    if (result.status === "selected") {
      expect(result.translation).toBeUndefined();
      expect(result.relaxedFilters).toContain("translation_requirement_relaxed_arabic_only");
    }
  });

  it("guarantees internal reference consistency between arabic id and catalog id", () => {
    for (let seed = 0; seed < 10; seed += 1) {
      const result = selectAyah({ ...baseInput, randomSeed: seed });
      if (result.status === "selected") {
        expect(result.entry.arabic.id).toBe(result.entry.catalog.id);
        expect(result.ayahId).toBe(result.entry.arabic.id);
      }
    }
  });

  it("balances themes over many draws instead of one theme monopolizing rotation", () => {
    const themeCounts = new Map<string, number>();
    let recentThemes: string[] = [];
    for (let seed = 0; seed < 60; seed += 1) {
      const result = selectAyah({ ...baseInput, recentThemes: recentThemes as never, randomSeed: seed * 7 + 1 });
      if (result.status !== "selected") continue;
      for (const theme of result.entry.catalog.themes) {
        themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
      }
      recentThemes = [...recentThemes, ...result.entry.catalog.themes].slice(-10);
    }
    const counts = Array.from(themeCounts.values());
    const max = Math.max(...counts);
    const total = counts.reduce((a, b) => a + b, 0);
    // No single theme should dominate more than ~60% of selections given 5 roughly-equal theme groups.
    expect(max / total).toBeLessThan(0.6);
  });
});
