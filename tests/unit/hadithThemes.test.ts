import { getFullHadithCorpus } from "@/data/corpus/hadith";
import { ALL_THEME_KEYS } from "@/domain/types";

describe("hadith theme tagging (powers the 'browse hadith by theme' menu)", () => {
  const corpus = getFullHadithCorpus();

  it("has all 500 entries", () => {
    expect(corpus).toHaveLength(500);
  });

  it("gives every entry at least one theme, and only real ThemeKey values", () => {
    for (const entry of corpus) {
      expect(entry.catalog.themes.length).toBeGreaterThan(0);
      for (const theme of entry.catalog.themes) {
        expect(ALL_THEME_KEYS).toContain(theme);
      }
    }
  });

  it("covers more than half of the theme taxonomy, not just the fallback", () => {
    const used = new Set(corpus.flatMap((e) => e.catalog.themes));
    expect(used.size).toBeGreaterThan(ALL_THEME_KEYS.length / 2);
  });
});
