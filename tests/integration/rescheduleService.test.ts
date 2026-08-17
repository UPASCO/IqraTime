import { reschedule } from "@/notifications/rescheduleService";
import { defaultPreferences } from "@/storage/preferencesStore";
import { createInMemoryDatabase } from "../fixtures/inMemoryDatabase";
import type { UserPreferences } from "@/domain/types";

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
      textDisplayMode: "arabic_only", // demo corpus ships no translations, so arabic_only always has candidates
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

  it("cancels everything and schedules nothing when notifications are disabled", async () => {
    const db = createInMemoryDatabase();
    await reschedule({ db, preferences: prefs(), now, timeZone: "UTC", generateId: idGen() });
    const result = await reschedule({ db, preferences: prefs({ schedule: { ...prefs().schedule, enabled: false } }), now, timeZone: "UTC", generateId: idGen() });
    expect(result.status).toBe("disabled");
    const remaining = (await db.notificationSlots.listAll()).filter((s) => s.status === "scheduled");
    expect(remaining).toHaveLength(0);
  });
});

function idGen(): () => string {
  let i = 0;
  return () => `test-id-${i++}`;
}
