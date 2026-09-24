import { reschedule } from "@/notifications/rescheduleService";
import { isDailyExtraSlot } from "@/notifications/dailyExtras";
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

  it("never queues the same content twice within a kind while it is still pending", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const queued = mainQueue(await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    // Anti-repeat is per kind (an āyah "2:255" and a hadith share nothing);
    // the calendar-driven daily extras are excluded — the Name of the day
    // may legitimately coincide with a rotation pick.
    for (const kind of ["ayah", "hadith", "name", "dua"] as const) {
      const ids = queued.filter((s) => s.kind === kind).map((s) => s.contentId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("schedules only hadith in hadith_only mode, titled by collection and number", async () => {
    const db = createInMemoryDatabase();
    const scheduleMock = scheduleOsNotification as jest.Mock;
    scheduleMock.mockClear();
    const result = await reschedule({ db, preferences: prefs({ contentKinds: { ayah: false, hadith: true, name: false, dua: false } }), now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("success");
    // The daily extras (Name/Invocation of the day) ride along on their own
    // toggles whatever the content mode says — only the main queue is
    // governed by hadith_only.
    const stored = mainQueue(await db.notificationSlots.listAll());
    expect(stored.length).toBeGreaterThan(0);
    expect(stored.every((s) => s.kind === "hadith" && /^(bukhari|muslim):\d+$/.test(s.contentId))).toBe(true);
    const hadithCalls = scheduleMock.mock.calls.filter((call) => (call[0] as { slot: NotificationSlot }).slot.kind === "hadith");
    expect(hadithCalls.length).toBeGreaterThan(0);
    const titles = hadithCalls.map((call) => (call[0] as { title: string }).title);
    expect(titles.every((title) => /Sahih (al-Bukhari|Muslim) #\d+/.test(title))).toBe(true);
    // Arabic-only display: the body is the Arabic text, never empty.
    const bodies = scheduleMock.mock.calls.map((call) => (call[0] as { bodyText: string }).bodyText);
    expect(bodies.every((body) => body.trim().length > 0)).toBe(true);
  });

  it("strictly alternates hadith and āyah in mixed mode, in firing order", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ contentKinds: { ayah: true, hadith: true, name: false, dua: false } }), now, timeZone: "UTC", generateId: idGen() });
    const stored = mainQueue(await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").sort(byFireTime);
    expect(stored.length).toBeGreaterThan(2);
    for (let i = 1; i < stored.length; i += 1) {
      expect(stored[i]!.kind).not.toBe(stored[i - 1]!.kind);
    }
  });

  it("keeps alternating across a refill instead of restarting the pattern", async () => {
    const db = createInMemoryDatabase();
    const mixed = prefs({ contentKinds: { ayah: true, hadith: true, name: false, dua: false } });
    await reschedule({ db, preferences: mixed, now, timeZone: "UTC", generateId: idGen() });
    const firstRun = mainQueue(await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").sort(byFireTime);
    // Advance past the first few slots so the refill has room to add new ones after the kept tail.
    const later = new Date(new Date(firstRun[3]!.fireAtUtcIso).getTime() + 1000);
    await reschedule({ db, preferences: mixed, now: later, timeZone: "UTC", generateId: idGen() });
    const all = mainQueue(await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled").sort(byFireTime);
    for (let i = 1; i < all.length; i += 1) {
      expect(all[i]!.kind).not.toBe(all[i - 1]!.kind);
    }
  });

  it("uses the āyah title with the surah name", async () => {
    const db = createInMemoryDatabase();
    const scheduleMock = scheduleOsNotification as jest.Mock;
    scheduleMock.mockClear();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const ayahCalls = scheduleMock.mock.calls.filter((call) => (call[0] as { slot: NotificationSlot }).slot.kind === "ayah");
    expect(ayahCalls.length).toBeGreaterThan(0);
    const titles = ayahCalls.map((call) => (call[0] as { title: string }).title);
    // e.g. "Ayah • Surah Al-Baqarah 2:286" — the kind badge, a name, then the numeric reference.
    expect(titles.every((title) => /^Ayah • Surah [^\d]+ \d+:\d+$/.test(title))).toBe(true);
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
    await reschedule({ db, preferences: prefs({ contentKinds: { ayah: false, hadith: true, name: false, dua: false } }), now, timeZone: "UTC", generateId: idGen() });
    await reschedule({ db, preferences: prefs({ contentKinds: { ayah: true, hadith: false, name: false, dua: false } }), now: new Date(now.getTime() + 1000), timeZone: "UTC", generateId: idGen() });
    // The daily-extra slots answer to their own toggles, not to the kinds —
    // only the main queue must have purged the disabled kinds.
    const remaining = mainQueue(await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(remaining.length).toBeGreaterThan(0);
    expect(remaining.every((s) => s.kind === "ayah")).toBe(true);
  });

  it("falls back to āyāt only for a translation language that has no hadith edition", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ contentKinds: { ayah: false, hadith: true, name: false, dua: false }, translationLocale: "de" }), now, timeZone: "UTC", generateId: idGen() });
    const stored = mainQueue(await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(stored.length).toBeGreaterThan(0);
    expect(stored.every((s) => s.kind === "ayah")).toBe(true);
  });

  it("cancels the main queue when notifications are disabled, but keeps the daily extras running", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const result = await reschedule({ db, preferences: prefs({ schedule: { ...prefs().schedule, enabled: false } }), now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("disabled");
    const remaining = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    // The master switch governs the āyah/hadith queue only — the default-on
    // Name-of-the-day slots deliberately survive it (their own toggle turns
    // them off).
    expect(mainQueue(remaining)).toHaveLength(0);
    expect(remaining.length).toBeGreaterThan(0);
    expect(remaining.every((s) => s.kind === "name")).toBe(true);
  });

  it("schedules nothing at all when the schedule and both daily extras are off", async () => {
    const db = createInMemoryDatabase();
    const off = prefs({ dailyNameEnabled: false, dailyDuaEnabled: false });
    await reschedule({ db, preferences: off, now, timeZone: "UTC", generateId: idGen() });
    const result = await reschedule({ db, preferences: { ...off, schedule: { ...off.schedule, enabled: false } }, now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("disabled");
    const remaining = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(remaining).toHaveLength(0);
  });

  it("schedules one DAILY dua slot per day when the daily invocation is enabled", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs({ dailyDuaEnabled: true }), now, timeZone: "UTC", generateId: idGen() });
    const all = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    // The one-per-day guarantee belongs to the daily-extra planner; the
    // main queue may rotate additional dua slots on top.
    const dailyDuaSlots = all.filter((s) => isDailyExtraSlot(s) && s.kind === "dua");
    expect(dailyDuaSlots.length).toBeGreaterThan(0);
    const days = dailyDuaSlots.map((s) => s.fireAtUtcIso.slice(0, 10));
    expect(new Set(days).size).toBe(days.length);
  });
});

/** The main sliding queue — everything except the daily-extra slots (which carry the "daily-" id prefix). */
function mainQueue(slots: readonly NotificationSlot[]): NotificationSlot[] {
  return slots.filter((s) => !isDailyExtraSlot(s));
}

function byFireTime(a: NotificationSlot, b: NotificationSlot): number {
  return a.fireAtUtcIso.localeCompare(b.fireAtUtcIso);
}

function idGen(): () => string {
  let i = 0;
  return () => `test-id-${i++}`;
}
