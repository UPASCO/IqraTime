import { formatShareText, formatHadithShareText, buildGetTheAppLine } from "@/utils/shareText";
import { appConfig } from "@/config/appConfig";

/** Mimics the real i18n interpolate() closely enough for this module's needs. */
const fakeT = (key: string, params?: Record<string, string | number>): string => {
  const templates: Record<string, string> = {
    "common.getTheAppShareLine": "iOS: {iosUrl} · Android: {androidUrl}",
    "common.getTheAppShareLineAndroidOnly": "Android: {androidUrl}",
  };
  let out = templates[key] ?? key;
  for (const [k, v] of Object.entries(params ?? {})) out = out.replaceAll(`{${k}}`, String(v));
  return out;
};

describe("shareText", () => {
  it("includes the real iOS link now that iosAppStoreUrl is no longer a PROVISIONAL placeholder", () => {
    // Documents today's real, known state (see docs/RELEASE_CHECKLIST.md) —
    // update this back if iosAppStoreUrl ever reverts to a placeholder.
    expect(appConfig.iosAppStoreUrl).not.toContain("PROVISIONAL");
    const line = buildGetTheAppLine(fakeT as never);
    expect(line).toBe(`iOS: ${appConfig.iosAppStoreUrl} · Android: ${appConfig.androidPlayStoreUrl}`);
  });

  it("builds the get-the-app line from whichever template matches the iOS URL's readiness", () => {
    const line = buildGetTheAppLine(fakeT as never);
    const iosReady = !appConfig.iosAppStoreUrl.includes("PROVISIONAL");
    const expected = iosReady
      ? `iOS: ${appConfig.iosAppStoreUrl} · Android: ${appConfig.androidPlayStoreUrl}`
      : `Android: ${appConfig.androidPlayStoreUrl}`;
    expect(line).toBe(expected);
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
