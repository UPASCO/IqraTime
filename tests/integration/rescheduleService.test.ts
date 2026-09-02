import { reschedule } from "@/notifications/rescheduleService";
import { scheduleOsNotification } from "@/notifications/notificationService";
import { defaultPreferences } from "@/storage/preferencesStore";
import { createInMemoryDatabase } from "../fixtures/inMemoryDatabase";
import type { NotificationSlot, UserPreferences } from "@/domain/types";

jest.mock("@/notifications/notificationService", () => ({
  scheduleOsNotification: jest.fn().mockResolvedValue(undefined),
  cancelOsNotifications: jest.fn().mockResolvedValue(undefined),
  cancelAllOsNotifications: jest.fn().mockResolvedValue(undefined),
}));

describe("reschedule() integration", () => {
  const now = new Date(2025, 0, 1, 6, 0, 0);

  function prefs(overrides: Partial<UserPreferences> = {}): UserPreferences {
    return {
      ...defaultPreferences,
      translationLocale: "en",
      showArabicText: true,
      textDisplayMode: "arabic_only", // keeps every entry selectable regardless of which translations ship
      schedule: { ...defaultPreferences.schedule, enabled: true, startHour: 0, endHour: 23, frequencyHours: 1, quietNightEnabled: false },
      ...overrides,
    };
  }

  it("schedules a queue of notifications and persists them", async () => {
    const db = createInMemoryDatabase();
    const result = await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("success");
    expect(result.scheduledCount).toBeGreaterThan(0);

    const stored = await db.notificationSlots.listAll();
    expect(stored.length).toBe(result.scheduledCount);
  });

  it("is idempotent: rescheduling immediately again does not duplicate slots", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const firstRun = await db.notificationSlots.listAll();

    await reschedule({ db, preferences: prefs(), now: new Date(now.getTime() + 1000), timeZone: "UTC", generateId: idGen() });
    const secondRun = await db.notificationSlots.listAll();

    const ids = secondRun.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    // The slots kept from the first run should still be present (stability of the sliding queue).
    const keptFromFirst = firstRun.filter((s) => s.fireAtUtcIso > new Date(now.getTime() + 1000).toISOString());
    for (const kept of keptFromFirst) {
      expect(secondRun.some((s) => s.id === kept.id)).toBe(true);
    }
  });

  it("never queues the same āyah twice while it is still pending", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const queued = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").map((s) => s.contentId);
    expect(new Set(queued).size).toBe(queued.length);
  });

  it("schedules only hadith in hadith_only mode, titled by collection and number", async () => {
    const db = createInMemoryDatabase();
    const scheduleMock = scheduleOsNotification as jest.Mock;
    scheduleMock.mockClear();
    const result = await reschedule({ db, preferences: prefs({ contentMode: "hadith_only" }), now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("success");
    const stored = await db.notificationSlots.listAll();
    expect(stored.length).toBeGreaterThan(0);
    expect(stored.every((s) => s.kind === "hadith" && /^(bukhari|muslim):\d+$/.test(s.contentId))).toBe(true);
    const titles = scheduleMock.mock.calls.map((call) => (call[0] as { title: string }).title);
    expect(titles.every((title) => /Sahih (al-Bukhari|Muslim) #\d+/.test(title))).toBe(true);
    // Arabic-only display: the body is the Arabic text, never empty.
    const bodies = scheduleMock.mock.calls.map((call) => (call[0] as { bodyText: string }).bodyText);
    expect(bodies.every((body) => body.trim().length > 0)).toBe(true);
  });

  it("strictly alternates hadith and āyah in mixed mode, in firing order", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ contentMode: "mixed" }), now, timeZone: "UTC", generateId: idGen() });
    const stored = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").sort(byFireTime);
    expect(stored.length).toBeGreaterThan(2);
    for (let i = 1; i < stored.length; i += 1) {
      expect(stored[i]!.kind).not.toBe(stored[i - 1]!.kind);
    }
  });

  it("keeps alternating across a refill instead of restarting the pattern", async () => {
    const db = createInMemoryDatabase();
    const mixed = prefs({ contentMode: "mixed" });
    await reschedule({ db, preferences: mixed, now, timeZone: "UTC", generateId: idGen() });
    const firstRun = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").sort(byFireTime);
    // Advance past the first few slots so the refill has room to add new ones after the kept tail.
    const later = new Date(new Date(firstRun[3]!.fireAtUtcIso).getTime() + 1000);
    await reschedule({ db, preferences: mixed, now: later, timeZone: "UTC", generateId: idGen() });
    const all = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").sort(byFireTime);
    for (let i = 1; i < all.length; i += 1) {
      expect(all[i]!.kind).not.toBe(all[i - 1]!.kind);
    }
  });

  it("uses the āyah title with the surah name", async () => {
    const db = createInMemoryDatabase();
    const scheduleMock = scheduleOsNotification as jest.Mock;
    scheduleMock.mockClear();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const titles = scheduleMock.mock.calls.map((call) => (call[0] as { title: string }).title);
    // e.g. "IqraTime • Surah Al-Baqarah 2:286" — a name, then the numeric reference.
    expect(titles.every((title) => /IqraTime • Surah [^\d]+ \d+:\d+$/.test(title))).toBe(true);
  });

  it("cancels the whole queue and rebuilds it when the translation language changes", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ translationLocale: "en" }), now, timeZone: "UTC", generateId: idGen() });
    const english = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(english.length).toBeGreaterThan(0);
    const result = await reschedule({ db, preferences: prefs({ translationLocale: "fr" }), now: new Date(now.getTime() + 1000), timeZone: "UTC", generateId: idGen() });
    expect(result.cancelledCount).toBe(english.length);
    const remaining = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(remaining.length).toBeGreaterThan(0);
    expect(remaining.every((s) => s.locale === "fr")).toBe(true);
  });

  it("drops queued hadith as soon as the user switches back to āyāt only", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ contentMode: "hadith_only" }), now, timeZone: "UTC", generateId: idGen() });
    await reschedule({ db, preferences: prefs({ contentMode: "ayah_only" }), now: new Date(now.getTime() + 1000), timeZone: "UTC", generateId: idGen() });
    const remaining = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(remaining.length).toBeGreaterThan(0);
    expect(remaining.every((s) => s.kind === "ayah")).toBe(true);
  });

  it("falls back to āyāt only for a translation language that has no hadith edition", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ contentMode: "hadith_only", translationLocale: "de" }), now, timeZone: "UTC", generateId: idGen() });
    const stored = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(stored.length).toBeGreaterThan(0);
    expect(stored.every((s) => s.kind === "ayah")).toBe(true);
  });

  it("cancels everything and schedules nothing when notifications are disabled", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const result = await reschedule({ db, preferences: prefs({ schedule: { ...prefs().schedule, enabled: false } }), now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("disabled");
    const remaining = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(remaining).toHaveLength(0);
  });
});

function byFireTime(a: NotificationSlot, b: NotificationSlot): number {
  return a.fireAtUtcIso.localeCompare(b.fireAtUtcIso);
}

function idGen(): () => string {
  let i = 0;
  return () => `test-id-${i++}`;
}
