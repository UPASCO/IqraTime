import { pickHadithForNotification } from "@/notifications/hadithPicker";
import { formatHadithNotificationBody } from "@/notifications/rescheduleService";
import { getRuntimeHadithCorpus, getHadithTranslation } from "@/data/corpus/hadith";
import { mulberry32 } from "@/services/selectionEngine";
import { effectiveContentKinds } from "@/services/feedContentMode";
import { MAX_NOTIFICATION_HADITH_LENGTH } from "@/domain/constants";

jest.mock("@/notifications/notificationService", () => ({
  scheduleOsNotification: jest.fn(),
  cancelOsNotifications: jest.fn(),
  cancelAllOsNotifications: jest.fn(),
}));

describe("formatHadithNotificationBody", () => {
  it("uses the translation alone when one exists (the Arabic carries the full isnad)", () => {
    expect(formatHadithNotificationBody({ arabicText: "حَدَّثَنَا …", translationText: "Do not become angry.", displayMode: "both" })).toBe("Do not become angry.");
  });

  it("uses the Arabic for Arabic-only display", () => {
    expect(formatHadithNotificationBody({ arabicText: "حَدَّثَنَا …", translationText: "Do not become angry.", displayMode: "arabic_only" })).toBe("حَدَّثَنَا …");
  });

  it("falls back to the Arabic when no translation exists", () => {
    expect(formatHadithNotificationBody({ arabicText: "حَدَّثَنَا …", translationText: undefined, displayMode: "both" })).toBe("حَدَّثَنَا …");
    expect(formatHadithNotificationBody({ arabicText: "حَدَّثَنَا …", translationText: "   ", displayMode: "translation_only" })).toBe("حَدَّثَنَا …");
  });
});

describe("pickHadithForNotification", () => {
  const corpus = getRuntimeHadithCorpus();
  const base = { corpus, getTranslation: getHadithTranslation, locale: "en" as const, displayMode: "both" as const, maxLength: MAX_NOTIFICATION_HADITH_LENGTH };

  it("prefers a hadith whose English body fits the notification length", () => {
    const result = pickHadithForNotification({ ...base, excludeIds: new Set(), random: mulberry32(1) });
    expect(result).not.toBeNull();
    expect(result!.relaxedFilters).toEqual([]);
    expect(getHadithTranslation(result!.hadithId, "en")!.text.length).toBeLessThanOrEqual(MAX_NOTIFICATION_HADITH_LENGTH);
  });

  it("never returns an excluded (already queued) hadith while others remain", () => {
    const first = pickHadithForNotification({ ...base, excludeIds: new Set(), random: mulberry32(7) })!;
    const exclude = new Set([first.hadithId]);
    for (let seed = 0; seed < 50; seed += 1) {
      const next = pickHadithForNotification({ ...base, excludeIds: exclude, random: mulberry32(seed) })!;
      expect(next.hadithId).not.toBe(first.hadithId);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = pickHadithForNotification({ ...base, excludeIds: new Set(), random: mulberry32(42) });
    const b = pickHadithForNotification({ ...base, excludeIds: new Set(), random: mulberry32(42) });
    expect(a).toEqual(b);
  });

  it("relaxes the length bound, then the exclusion, rather than returning nothing", () => {
    const everything = new Set(corpus.map((e) => e.arabic.id));
    const result = pickHadithForNotification({ ...base, excludeIds: everything, random: mulberry32(3) });
    expect(result).not.toBeNull();
    expect(result!.relaxedFilters).toEqual(["queued_repeat_allowed"]);
  });

  it("returns null only when nothing can be shown at all", () => {
    expect(pickHadithForNotification({ ...base, corpus: [], excludeIds: new Set(), random: mulberry32(1) })).toBeNull();
  });

  it("uses the Arabic body for Arabic readers even though no 'ar' translation file exists", () => {
    const result = pickHadithForNotification({ ...base, locale: "ar", excludeIds: new Set(), random: mulberry32(5) });
    expect(result).not.toBeNull();
  });
});

describe("effectiveContentKinds", () => {
  const all = { ayah: true, hadith: true, name: true, dua: true };

  it("keeps hadith enabled for a language with a hadith edition", () => {
    expect(effectiveContentKinds(all, "en").hadith).toBe(true);
    expect(effectiveContentKinds(all, "fr").hadith).toBe(true);
  });

  it("drops hadith out of the rotation where no hadith edition exists", () => {
    expect(effectiveContentKinds(all, "de").hadith).toBe(false);
    expect(effectiveContentKinds(all, "zh-CN").hadith).toBe(false);
    // The other kinds are untouched.
    expect(effectiveContentKinds(all, "de")).toEqual({ ayah: true, hadith: false, name: true, dua: true });
  });

  it("falls back to āyāt when the gating empties the selection", () => {
    expect(effectiveContentKinds({ ayah: false, hadith: true, name: false, dua: false }, "de")).toEqual({
      ayah: true,
      hadith: false,
      name: false,
      dua: false,
    });
  });
});
