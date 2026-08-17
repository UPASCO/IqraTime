import { generateSlotTimes, planNotifications } from "@/notifications/scheduler";
import type { NotificationSchedule, NotificationSlot } from "@/domain/types";

function baseSchedule(overrides: Partial<NotificationSchedule> = {}): NotificationSchedule {
  return {
    enabled: true,
    startHour: 8,
    endHour: 22,
    frequencyHours: 1,
    fixedTimes: [],
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    quietNightEnabled: true,
    jitterMinutes: 0,
    soundEnabled: true,
    vibrationEnabled: true,
    ...overrides,
  };
}

describe("generateSlotTimes", () => {
  it("generates hourly slots within a normal (non-wrapping) window", () => {
    const now = new Date(2025, 0, 1, 6, 0, 0); // Wed 06:00 local
    const slots = generateSlotTimes({ schedule: baseSchedule(), now, horizonDays: 1, maxSlots: 50 });
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.localHour).toBeGreaterThanOrEqual(8);
      expect(slot.localHour).toBeLessThanOrEqual(22);
    }
  });

  it("never schedules in the past", () => {
    const now = new Date(2025, 0, 1, 14, 30, 0);
    const slots = generateSlotTimes({ schedule: baseSchedule(), now, horizonDays: 1, maxSlots: 50 });
    for (const slot of slots) {
      expect(slot.fireAtUtc.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("never produces duplicate instants", () => {
    const now = new Date(2025, 0, 1, 0, 0, 0);
    const slots = generateSlotTimes({ schedule: baseSchedule({ jitterMinutes: 5 }), now, horizonDays: 5, maxSlots: 200, randomSeed: 7 });
    const seen = new Set(slots.map((s) => s.fireAtUtc.getTime()));
    expect(seen.size).toBe(slots.length);
  });

  it("handles a window that crosses midnight", () => {
    const schedule = baseSchedule({ startHour: 20, endHour: 4, quietNightEnabled: false, frequencyHours: 2 });
    const now = new Date(2025, 0, 1, 18, 0, 0);
    const slots = generateSlotTimes({ schedule, now, horizonDays: 1, maxSlots: 50 });
    const hours = slots.map((s) => s.localHour);
    expect(hours.some((h) => h >= 20)).toBe(true);
    expect(hours.some((h) => h <= 4)).toBe(true);
  });

  it("never schedules during quiet night hours (22:00-06:00) when enabled, even with an overlapping window", () => {
    const schedule = baseSchedule({ startHour: 20, endHour: 8, quietNightEnabled: true, frequencyHours: 1 });
    const now = new Date(2025, 0, 1, 12, 0, 0);
    const slots = generateSlotTimes({ schedule, now, horizonDays: 2, maxSlots: 100 });
    for (const slot of slots) {
      expect(slot.localHour).toBeGreaterThanOrEqual(6);
      expect(slot.localHour).toBeLessThan(22);
    }
  });

  it("only generates slots on active days", () => {
    const schedule = baseSchedule({ activeDays: [1, 3, 5] }); // Mon/Wed/Fri
    const now = new Date(2025, 0, 1, 0, 0, 0); // Wednesday
    const slots = generateSlotTimes({ schedule, now, horizonDays: 7, maxSlots: 500 });
    for (const slot of slots) {
      const weekday = slot.fireAtUtc.getDay();
      expect([1, 3, 5]).toContain(weekday);
    }
  });

  it("respects fixed times when provided, overriding the frequency window", () => {
    const schedule = baseSchedule({ fixedTimes: [{ hour: 9, minute: 15 }, { hour: 21, minute: 0 }] });
    const now = new Date(2025, 0, 1, 0, 0, 0);
    const slots = generateSlotTimes({ schedule, now, horizonDays: 1, maxSlots: 10 });
    const hours = slots.map((s) => `${s.fireAtUtc.getHours()}:${s.fireAtUtc.getMinutes()}`);
    expect(hours).toEqual(expect.arrayContaining(["9:15", "21:0"]));
  });

  it("returns nothing when the schedule is disabled", () => {
    const slots = generateSlotTimes({ schedule: baseSchedule({ enabled: false }), now: new Date(), horizonDays: 5, maxSlots: 100 });
    expect(slots).toHaveLength(0);
  });

  it("is deterministic for a given seed when jitter is applied", () => {
    const schedule = baseSchedule({ jitterMinutes: 10 });
    const now = new Date(2025, 0, 1, 0, 0, 0);
    const a = generateSlotTimes({ schedule, now, horizonDays: 2, maxSlots: 30, randomSeed: 99 });
    const b = generateSlotTimes({ schedule, now, horizonDays: 2, maxSlots: 30, randomSeed: 99 });
    expect(a.map((s) => s.fireAtUtc.getTime())).toEqual(b.map((s) => s.fireAtUtc.getTime()));
  });
});

describe("generateSlotTimes across DST and timezone edge cases", () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it("produces a valid, gap-free schedule across a US DST spring-forward transition", () => {
    process.env.TZ = "America/New_York";
    // 2025-03-09 is the US spring-forward date.
    const now = new Date(2025, 2, 8, 0, 0, 0);
    const slots = generateSlotTimes({ schedule: baseSchedule(), now, horizonDays: 3, maxSlots: 100 });
    expect(slots.length).toBeGreaterThan(0);
    // Every generated instant must still be strictly increasing (no impossible/duplicate local times).
    for (let i = 1; i < slots.length; i += 1) {
      expect(slots[i]!.fireAtUtc.getTime()).toBeGreaterThan(slots[i - 1]!.fireAtUtc.getTime());
    }
  });

  it("produces a valid schedule across a US DST fall-back transition", () => {
    process.env.TZ = "America/New_York";
    // 2025-11-02 is the US fall-back date.
    const now = new Date(2025, 10, 1, 0, 0, 0);
    const slots = generateSlotTimes({ schedule: baseSchedule(), now, horizonDays: 3, maxSlots: 100 });
    expect(slots.length).toBeGreaterThan(0);
    for (let i = 1; i < slots.length; i += 1) {
      expect(slots[i]!.fireAtUtc.getTime()).toBeGreaterThan(slots[i - 1]!.fireAtUtc.getTime());
    }
  });
});

function makeSlot(overrides: Partial<NotificationSlot> = {}): NotificationSlot {
  return {
    id: "slot-1",
    fireAtUtcIso: new Date(2025, 0, 2, 9, 0, 0).toISOString(),
    ayahId: "1:1",
    locale: "en",
    status: "scheduled",
    createdAtUtcIso: new Date(2025, 0, 1).toISOString(),
    timeZone: "UTC",
    ...overrides,
  };
}

describe("planNotifications", () => {
  const commonInput = {
    schedule: baseSchedule(),
    horizonDays: 3,
    maxPendingSlots: 20,
    translationLocale: "en" as const,
    timeZone: "UTC",
    generateId: (() => {
      let i = 0;
      return () => `id-${i++}`;
    })(),
    selectAyahForSlot: () => ({ ayahId: "1:1" }),
  };

  it("cancels nothing and schedules a full queue when there are no existing slots", () => {
    const plan = planNotifications({ ...commonInput, now: new Date(2025, 0, 1, 6, 0, 0), existingSlots: [] });
    expect(plan.toCancel).toHaveLength(0);
    expect(plan.toSchedule.length).toBeGreaterThan(0);
  });

  it("keeps future slots and only cancels past/obsolete ones", () => {
    const future = makeSlot({ id: "future", fireAtUtcIso: new Date(2025, 0, 5).toISOString() });
    const past = makeSlot({ id: "past", fireAtUtcIso: new Date(2024, 0, 1).toISOString() });
    const plan = planNotifications({ ...commonInput, now: new Date(2025, 0, 1, 6, 0, 0), existingSlots: [future, past] });
    expect(plan.toCancel).toEqual(["past"]);
    expect(plan.finalSlots.some((s) => s.id === "future")).toBe(true);
  });

  it("detects a timezone change and regenerates the whole queue", () => {
    const existing = makeSlot({ timeZone: "America/New_York", fireAtUtcIso: new Date(2025, 0, 5).toISOString() });
    const plan = planNotifications({ ...commonInput, timeZone: "Asia/Tokyo", now: new Date(2025, 0, 1, 6, 0, 0), existingSlots: [existing] });
    expect(plan.timeZoneChanged).toBe(true);
    expect(plan.toCancel).toContain(existing.id);
  });

  it("never exceeds maxPendingSlots", () => {
    const plan = planNotifications({ ...commonInput, maxPendingSlots: 3, now: new Date(2025, 0, 1, 0, 0, 0), existingSlots: [] });
    expect(plan.finalSlots.length).toBeLessThanOrEqual(3);
  });

  it("cancels everything and schedules nothing when the schedule is disabled", () => {
    const existing = makeSlot({ fireAtUtcIso: new Date(2025, 0, 5).toISOString() });
    const plan = planNotifications({
      ...commonInput,
      schedule: baseSchedule({ enabled: false }),
      now: new Date(2025, 0, 1),
      existingSlots: [existing],
    });
    expect(plan.toCancel).toEqual([existing.id]);
    expect(plan.toSchedule).toHaveLength(0);
  });

  it("never produces two scheduled slots with the same id (no duplicates)", () => {
    const existing = makeSlot({ id: "kept", fireAtUtcIso: new Date(2025, 0, 5).toISOString() });
    const plan = planNotifications({ ...commonInput, now: new Date(2025, 0, 1), existingSlots: [existing] });
    const ids = plan.finalSlots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
