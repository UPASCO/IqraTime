import type { CorpusEntry } from "@/data/corpus";
import type { AyahTranslation, ThemeKey } from "@/domain/types";

/**
 * Synthetic test fixtures — NOT real Quran text. Used only to exercise the
 * selection engine's filtering/weighting/fallback logic in isolation from
 * the real (small, demo-only) corpus shipped in src/data/corpus.
 */
export function buildFixtureCorpus(count = 12): CorpusEntry[] {
  const themePool: ThemeKey[][] = [
    ["patience", "hope"],
    ["gratitude"],
    ["mercy", "inner_peace"],
    ["courage"],
    ["wisdom", "knowledge"],
  ];

  return Array.from({ length: count }, (_, i) => {
    const surah = 1 + (i % 6);
    const ayah = 1 + Math.floor(i / 6);
    const id = `${surah}:${ayah}`;
    return {
      arabic: {
        id,
        surah,
        ayah,
        text: `نص تجريبي رقم ${i}`,
        surahNameArabic: "سورة تجريبية",
        surahNameTransliterated: `Test Surah ${surah}`,
      },
      catalog: {
        id,
        status: "publishable",
        themes: themePool[i % themePool.length] ?? [],
        isDemoOnly: true,
      },
    };
  });
}

export function buildFixtureTranslations(entries: readonly CorpusEntry[]): Map<string, AyahTranslation> {
  const map = new Map<string, AyahTranslation>();
  for (const entry of entries) {
    const length = 20 + (entry.arabic.surah * 7 + entry.arabic.ayah * 3) % 60;
    map.set(entry.arabic.id, {
      id: entry.arabic.id,
      locale: "en",
      text: "x".repeat(length),
      sourceId: "fixture",
    });
  }
  return map;
}
