/**
 * Guards the phonetic (transliteration) layer added in 2.2.0:
 * - the Qur'an phonetic edition (verbatim ara-quranphoneticst-la) covers
 *   every single āyah, so any āyah shown anywhere in the app can carry
 *   its phonetic line;
 * - the hadith romanization file stays in strict id lockstep with the
 *   hadith Arabic corpus (regenerate with
 *   scripts/buildHadithTransliteration.mjs whenever arabic.json changes);
 * - both resolve through the app's own id-keyed lookups.
 */
import { getQuranTransliterationText, getSurahList } from "@/data/quran";
import { getFullHadithCorpus, getHadithTransliteration } from "@/data/corpus/hadith";
import { getFullCorpus } from "@/data/corpus";
import { getAllDuas } from "@/data/duas";
import { makeAyahId } from "@/domain/types";

import quranTranslitData from "@/data/quran/transliteration.json";
import hadithTranslitData from "@/data/corpus/hadith/transliteration.json";
import hadithArabicData from "@/data/corpus/hadith/arabic.json";

const LATIN_RE = /[a-z]/i;

describe("Qur'an phonetic transcription (verbatim edition)", () => {
  const entries = (quranTranslitData as { entries: readonly { surah: number; ayah: number; text: string }[] }).entries;

  it("covers all 6236 ayat of all 114 surahs, every text non-empty and Latin", () => {
    expect(entries.length).toBe(6236);
    const total = getSurahList().reduce((sum, s) => sum + s.ayahCount, 0);
    expect(total).toBe(6236);
    for (const e of entries) {
      expect(e.text.trim().length).toBeGreaterThan(0);
      expect(LATIN_RE.test(e.text)).toBe(true);
    }
  });

  it("resolves by ayah id, including for every entry of the curated corpus", () => {
    expect(getQuranTransliterationText(makeAyahId({ surah: 1, ayah: 1 }))).toMatch(/Bismi Allahi/i);
    for (const entry of getFullCorpus()) {
      const text = getQuranTransliterationText(entry.arabic.id);
      expect(text).toBeDefined();
      expect(text!.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("dua transliterations", () => {
  it("every one of the 110 invocations carries a phonetic line — the 13 quranic duas verbatim from the phonetic edition", () => {
    for (const dua of getAllDuas()) {
      expect((dua.transliteration ?? "").trim().length).toBeGreaterThan(0);
    }
    // The dua of Yunus (the entry the missing-phonetics report was filed
    // against): its line must be the phonetic edition's own 21:87 text.
    const yunus = getAllDuas().find((d) => d.id === "quran-21-87")!;
    expect(yunus.transliteration).toBe(getQuranTransliterationText(makeAyahId({ surah: 21, ayah: 87 })));
  });
});

describe("hadith romanization (mechanical, derived from the corpus Arabic)", () => {
  const arabicIds = (hadithArabicData as { entries: readonly { id: string }[] }).entries.map((e) => e.id);
  const translitEntries = (hadithTranslitData as { entries: readonly { id: string; text: string }[] }).entries;

  it("is in exact id lockstep with arabic.json — regenerate after any corpus change", () => {
    expect(translitEntries.map((e) => e.id)).toEqual(arabicIds);
    for (const e of translitEntries) {
      expect(e.text.trim().length).toBeGreaterThan(0);
      expect(LATIN_RE.test(e.text)).toBe(true);
    }
  });

  it("resolves by id through the app's own lookup, with the honorific formulas expanded", () => {
    for (const entry of getFullHadithCorpus()) {
      expect(getHadithTransliteration(entry.arabic.id)).toBeDefined();
    }
    // bukhari:1 opens with the classic chain — a stable spot-check that the
    // romanizer's article assimilation and formula table both ran.
    const first = getHadithTransliteration("bukhari:1")!;
    expect(first).toMatch(/haddathanaa/i);
    expect(first).not.toMatch(/[؀-ۿ]/); // no Arabic letters left behind
  });
});
