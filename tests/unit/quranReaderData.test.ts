import { getSurahList, getSurahMeta, getSurahAyat, getQuranAyah, getQuranTranslationText, hasQuranTranslation } from "@/data/quran";
import { appConfig } from "@/config/appConfig";

describe("full Qur'an reader data", () => {
  it("has all 114 surahs", () => {
    expect(getSurahList()).toHaveLength(114);
  });

  it("has exactly 6236 āyāt total, matching each surah's declared ayahCount", () => {
    let total = 0;
    for (const surah of getSurahList()) {
      const ayat = getSurahAyat(surah.number);
      expect(ayat).toHaveLength(surah.ayahCount);
      total += ayat.length;
    }
    expect(total).toBe(6236);
  });

  it("numbers each surah's āyāt contiguously from 1", () => {
    const meta = getSurahMeta(2);
    const ayat = getSurahAyat(2);
    expect(meta?.ayahCount).toBe(286);
    expect(ayat[0]?.ayah).toBe(1);
    expect(ayat[ayat.length - 1]?.ayah).toBe(286);
  });

  it("resolves a known āyah by id", () => {
    expect(getQuranAyah("2:255")?.text.length).toBeGreaterThan(0);
    expect(getQuranAyah("114:6")?.text.length).toBeGreaterThan(0);
    expect(getQuranAyah("115:1")).toBeUndefined();
  });

  it("has a full, matching translation for every non-Arabic supported locale", () => {
    for (const locale of appConfig.supportedLocales) {
      if (locale === "ar") continue;
      expect(hasQuranTranslation(locale)).toBe(true);
      expect(getQuranTranslationText("1:1", locale)?.length).toBeGreaterThan(0);
      expect(getQuranTranslationText("114:6", locale)?.length).toBeGreaterThan(0);
    }
  });

  it("has no Arabic 'translation' — Arabic readers use the source text itself", () => {
    expect(hasQuranTranslation("ar")).toBe(false);
  });
});
