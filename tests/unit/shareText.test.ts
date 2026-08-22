import { formatShareText, formatHadithShareText, buildGetTheAppLine } from "@/utils/shareText";
import { appConfig } from "@/config/appConfig";

describe("shareText", () => {
  it("fills both store links into the get-the-app template", () => {
    const line = buildGetTheAppLine("iOS: {iosUrl} · Android: {androidUrl}");
    expect(line).toBe(`iOS: ${appConfig.iosAppStoreUrl} · Android: ${appConfig.androidPlayStoreUrl}`);
  });

  it("appends the get-the-app line to an ayah share when provided", () => {
    const text = formatShareText({
      translationText: "In the name of Allah",
      surah: 1,
      ayah: 1,
      includeArabic: false,
      includeTranslation: true,
      referenceLabel: "Surah",
      appName: "IqraTime",
      getTheAppLine: "📲 get it here",
    });
    expect(text.endsWith("📲 get it here")).toBe(true);
  });

  it("omits the get-the-app line entirely when not provided", () => {
    const text = formatShareText({
      translationText: "In the name of Allah",
      surah: 1,
      ayah: 1,
      includeArabic: false,
      includeTranslation: true,
      referenceLabel: "Surah",
      appName: "IqraTime",
    });
    expect(text.endsWith("IqraTime")).toBe(true);
  });

  it("appends the get-the-app line to a hadith share when provided", () => {
    const text = formatHadithShareText({
      translationText: "Actions are judged by intentions",
      collectionDisplayName: "Sahih al-Bukhari",
      hadithNumber: 1,
      includeArabic: false,
      includeTranslation: true,
      appName: "IqraTime",
      getTheAppLine: "📲 get it here",
    });
    expect(text.endsWith("📲 get it here")).toBe(true);
  });
});
