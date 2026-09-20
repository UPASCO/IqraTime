import { buildDuaNotification, buildNameNotification, planDailyExtras } from "@/notifications/dailyExtras";
import { defaultPreferences } from "@/storage/preferencesStore";
import { getAllNames, getDailyName, getDailyNameNumber, getName } from "@/data/names";
import { getAllDuas, getDailyDua, getDailyDuaId, getDailyDuaPool } from "@/data/duas";
import type { NotificationSlot, UserPreferences } from "@/domain/types";

const now = new Date(2025, 0, 1, 6, 0, 0);

function prefs(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return { ...defaultPreferences, translationLocale: "en", ...overrides };
}

function plan(preferences: UserPreferences, existingSlots: readonly NotificationSlot[] = [], at: Date = now) {
  let i = 0;
  return planDailyExtras({
    existingSlots,
    preferences,
    now: at,
    timeZone: "UTC",
    generateId: () => `extra-${i++}`,
    horizonDays: 10,
  });
}

describe("names dataset", () => {
  it("carries exactly 99 names, numbered 1..99, each with both meanings", () => {
    const names = getAllNames();
    expect(names).toHaveLength(99);
    names.forEach((name, index) => {
      expect(name.number).toBe(index + 1);
      expect(name.arabic.length).toBeGreaterThan(0);
      expect(name.transliteration.length).toBeGreaterThan(0);
      expect(name.meaning.en.length).toBeGreaterThan(0);
      expect(name.meaning.fr.length).toBeGreaterThan(0);
    });
  });

  it("rotates the daily name through the canonical order, one per local day", () => {
    const day1 = getDailyNameNumber(new Date(2025, 0, 1, 12));
    const day2 = getDailyNameNumber(new Date(2025, 0, 2, 0, 1));
    expect(day2).toBe((day1 % 99) + 1);
    // Same for every hour of one local day.
    expect(getDailyNameNumber(new Date(2025, 0, 1, 0, 0, 1))).toBe(day1);
    expect(getDailyNameNumber(new Date(2025, 0, 1, 23, 59))).toBe(day1);
    expect(getDailyName(new Date(2025, 0, 1, 12)).number).toBe(day1);
  });
});

describe("duas dataset", () => {
  it("carries 100+ entries with ids safe for route params and required fields", () => {
    const duas = getAllDuas();
    expect(duas.length).toBeGreaterThanOrEqual(100);
    const ids = duas.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const dua of duas) {
      expect(dua.id).not.toContain(":");
      expect(dua.id).not.toContain("/");
      expect(dua.arabic.length).toBeGreaterThan(0);
      expect(dua.title.en.length).toBeGreaterThan(0);
      expect(dua.title.fr.length).toBeGreaterThan(0);
      // Optional, but never stored as an empty string.
      if (dua.source !== undefined) expect(dua.source.length).toBeGreaterThan(0);
    }
  });

  it("picks a deterministic daily dua that covers the whole pool before repeating", () => {
    const pool = getDailyDuaPool();
    expect(pool.length).toBeGreaterThan(30);
    // The no-repeat guarantee holds within one shuffle period, so start the
    // walk at a period boundary (day number divisible by the pool size).
    const baseDayNumber = Math.floor(Date.UTC(2025, 0, 1) / 86_400_000);
    const toPeriodStart = (pool.length - (baseDayNumber % pool.length)) % pool.length;
    const seen = new Set<string>();
    for (let day = 0; day < pool.length; day += 1) {
      const id = getDailyDuaId(new Date(2025, 0, 1 + toPeriodStart + day, 12));
      expect(id).toBeDefined();
      seen.add(id as string);
    }
    // A full period shows every pool entry exactly once.
    expect(seen.size).toBe(pool.length);
    // Deterministic: same day, same dua.
    expect(getDailyDuaId(new Date(2025, 0, 5, 0, 1))).toBe(getDailyDuaId(new Date(2025, 0, 5, 23, 59)));
    expect(getDailyDua(new Date(2025, 0, 5, 12))?.id).toBe(getDailyDuaId(new Date(2025, 0, 5, 12)));
  });
});

describe("planDailyExtras()", () => {
  it("schedules one name slot per future day at the preferred hour when enabled", () => {
    const p = plan(prefs({ dailyNameEnabled: true, dailyNameHour: 8, dailyDuaEnabled: false }));
    expect(p.toCancel).toHaveLength(0);
    expect(p.toSchedule).toHaveLength(10);
    for (const slot of p.toSchedule) {
      expect(slot.kind).toBe("name");
      expect(new Date(slot.fireAtUtcIso).getHours()).toBe(8);
      expect(getName(Number(slot.contentId))).toBeDefined();
    }
    const days = p.toSchedule.map((s) => new Date(s.fireAtUtcIso).getDate());
    expect(new Set(days).size).toBe(days.length);
  });

  it("skips today when the preferred hour has already passed", () => {
    const p = plan(prefs({ dailyNameEnabled: true, dailyNameHour: 5, dailyDuaEnabled: false }));
    // now is 06:00 — today's 05:00 is in the past, so the first slot is tomorrow's.
    expect(p.toSchedule).toHaveLength(9);
    expect(new Date(p.toSchedule[0]!.fireAtUtcIso).getDate()).toBe(2);
  });

  it("is idempotent: replanning over its own output keeps every slot", () => {
    const p1 = plan(prefs({ dailyNameEnabled: true, dailyDuaEnabled: true }));
    const p2 = plan(prefs({ dailyNameEnabled: true, dailyDuaEnabled: true }), p1.toSchedule);
    expect(p2.toSchedule).toHaveLength(0);
    expect(p2.toCancel).toHaveLength(0);
    expect(p2.keptCount).toBe(p1.toSchedule.length);
  });

  it("cancels and regenerates when the hour changes", () => {
    const p1 = plan(prefs({ dailyNameEnabled: true, dailyNameHour: 8, dailyDuaEnabled: false }));
    const p2 = plan(prefs({ dailyNameEnabled: true, dailyNameHour: 9, dailyDuaEnabled: false }), p1.toSchedule);
    expect(p2.toCancel).toHaveLength(p1.toSchedule.length);
    expect(p2.toSchedule).toHaveLength(10);
    expect(new Date(p2.toSchedule[0]!.fireAtUtcIso).getHours()).toBe(9);
  });

  it("cancels everything when the toggles are turned off", () => {
    const p1 = plan(prefs({ dailyNameEnabled: true, dailyDuaEnabled: true }));
    const p2 = plan(prefs({ dailyNameEnabled: false, dailyDuaEnabled: false }), p1.toSchedule);
    expect(p2.toSchedule).toHaveLength(0);
    expect(p2.toCancel).toHaveLength(p1.toSchedule.length);
  });

  it("assigns each day exactly the calendar's own name and dua", () => {
    const p = plan(prefs({ dailyNameEnabled: true, dailyDuaEnabled: true }));
    for (const slot of p.toSchedule) {
      const fireDay = new Date(slot.fireAtUtcIso);
      if (slot.kind === "name") {
        expect(slot.contentId).toBe(String(getDailyNameNumber(fireDay)));
      } else {
        expect(slot.contentId).toBe(getDailyDuaId(fireDay));
      }
    }
  });
});

describe("daily extra notification content", () => {
  const baseSlot: NotificationSlot = {
    id: "slot-1",
    fireAtUtcIso: now.toISOString(),
    kind: "name",
    contentId: "1",
    locale: "en",
    status: "scheduled",
    createdAtUtcIso: now.toISOString(),
    timeZone: "UTC",
  };

  it("builds a name notification with the Arabic and the localized meaning", () => {
    const content = buildNameNotification(baseSlot);
    expect(content).toBeDefined();
    const name = getName(1)!;
    expect(content!.title).toContain(name.transliteration);
    expect(content!.bodyText).toContain(name.arabic);
    expect(content!.bodyText).toContain(name.meaning.en);
  });

  it("builds a dua notification titled by the localized functional title", () => {
    const dua = getDailyDuaPool()[0]!;
    const slot: NotificationSlot = { ...baseSlot, kind: "dua", contentId: dua.id };
    const content = buildDuaNotification(slot, prefs());
    expect(content).toBeDefined();
    expect(content!.title).toContain(dua.title.en);
    expect(content!.bodyText).toContain(dua.arabic);
  });

  it("returns undefined for content ids that no longer resolve", () => {
    expect(buildNameNotification({ ...baseSlot, contentId: "999" })).toBeUndefined();
    expect(buildDuaNotification({ ...baseSlot, kind: "dua", contentId: "gone" }, prefs())).toBeUndefined();
  });
});
