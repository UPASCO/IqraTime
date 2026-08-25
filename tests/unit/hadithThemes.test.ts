import { getFullHadithCorpus } from "@/data/corpus/hadith";
import { HADITH_THEME_KEYS } from "@/domain/types";

describe("hadith theme tagging (powers the 'browse hadith by theme' menu)", () => {
  const corpus = getFullHadithCorpus();

  it("has all 500 entries", () => {
    expect(corpus).toHaveLength(500);
  });

  it("gives every entry at least one theme, and only from the reduced classic-hadith taxonomy (HADITH_THEME_KEYS)", () => {
    for (const entry of corpus) {
      expect(entry.catalog.themes.length).toBeGreaterThan(0);
      for (const theme of entry.catalog.themes) {
        expect(HADITH_THEME_KEYS).toContain(theme);
      }
    }
  });

  it("uses every theme in the reduced taxonomy at least once, not just the fallback", () => {
    const used = new Set(corpus.flatMap((e) => e.catalog.themes));
    expect(used.size).toBe(HADITH_THEME_KEYS.length);
  });
});
