import type { SupportedLocale } from "@/config/appConfig";
import type { ContentMode, NotificationContentKind, NotificationSchedule, NotificationSlot, WeekdayIndex } from "@/domain/types";
import { mulberry32, type RandomFn } from "@/services/selectionEngine/rng";

/**
 * All date/time math here uses JavaScript's *local* Date constructor and
 * accessors (new Date(year, month, day, hour, minute), .getDay(), etc.),
 * which the JS engine resolves against the process/device's current
 * system timezone. On a real device this is exactly the timezone the user
 * is in, and it updates automatically when the device's timezone changes
 * — there is no separate "target timezone" concept to get wrong. Tests
 * pin a specific zone by setting process.env.TZ before importing this
 * module (see tests/unit/scheduler.test.ts and docs/NOTIFICATIONS.md).
 */

const QUIET_NIGHT_START_HOUR = 22;
const QUIET_NIGHT_END_HOUR = 6;

function isQuietNightHour(hour: number): boolean {
  return hour >= QUIET_NIGHT_START_HOUR || hour < QUIET_NIGHT_END_HOUR;
}

function addDaysLocal(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 0, 0, 0, 0);
  return result;
}

function toWeekdayIndex(date: Date): WeekdayIndex {
  return date.getDay() as WeekdayIndex;
}

interface DailyTime {
  readonly hour: number;
  readonly minute: number;
  /** 0 = falls on the same calendar day the window starts; 1 = falls on the following calendar day (the wrapped portion of a midnight-crossing window). */
  readonly dayOffset: 0 | 1;
}

/** Local hour:minute pairs (with day offset) for one window-start day, derived from fixedTimes or from the start/end/frequency window (which may cross midnight). */
function dailyLocalTimes(schedule: NotificationSchedule): DailyTime[] {
  if (schedule.fixedTimes.length > 0) {
    return schedule.fixedTimes.map((t) => ({ hour: t.hour, minute: t.minute, dayOffset: 0 }));
  }

  const times: DailyTime[] = [];
  const { startHour, endHour, frequencyHours } = schedule;
  const span = endHour > startHour ? endHour - startHour : 24 - startHour + endHour;

  for (let offset = 0; offset <= span; offset += frequencyHours) {
    const total = startHour + offset;
    const hour = total % 24;
    const dayOffset: 0 | 1 = total >= 24 ? 1 : 0;
    times.push({ hour, minute: 0, dayOffset });
  }
  return times;
}

export interface GenerateSlotTimesOptions {
  readonly schedule: NotificationSchedule;
  readonly now: Date;
  readonly horizonDays: number;
  readonly maxSlots: number;
  readonly randomSeed?: number;
}

export interface GeneratedSlotTime {
  readonly fireAtUtc: Date;
  readonly localHour: number;
}

/**
 * Generates up to `maxSlots` future, non-duplicate, non-past slot times
 * within the schedule's active days/window, applying the quiet-night guard
 * and optional random jitter. This is pure and deterministic given a seed.
 */
export function generateSlotTimes(options: GenerateSlotTimesOptions): GeneratedSlotTime[] {
  const { schedule, now, horizonDays, maxSlots } = options;
  if (!schedule.enabled || maxSlots <= 0) return [];

  const random: RandomFn = mulberry32(options.randomSeed ?? now.getTime());
  const seenEpochMs = new Set<number>();
  const results: GeneratedSlotTime[] = [];
  const dailyTimes = dailyLocalTimes(schedule);

  for (let dayOffset = 0; dayOffset < horizonDays && results.length < maxSlots; dayOffset += 1) {
    const day = addDaysLocal(now, dayOffset);
    const weekday = toWeekdayIndex(day);
    if (!schedule.activeDays.includes(weekday)) continue;

    for (const { hour, minute, dayOffset: timeDayOffset } of dailyTimes) {
      if (results.length >= maxSlots) break;
      if (schedule.quietNightEnabled && isQuietNightHour(hour)) continue;

      const jitter = schedule.jitterMinutes > 0
        ? Math.round((random() * 2 - 1) * schedule.jitterMinutes)
        : 0;

      const targetDay = timeDayOffset === 1 ? addDaysLocal(day, 1) : day;
      const candidate = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), hour, minute + jitter, 0, 0);

      if (schedule.quietNightEnabled && isQuietNightHour(candidate.getHours())) continue;
      if (candidate.getTime() <= now.getTime()) continue; // never schedule in the past

      const epoch = candidate.getTime();
      if (seenEpochMs.has(epoch)) continue; // never create duplicates at the exact same instant
      seenEpochMs.add(epoch);

      results.push({ fireAtUtc: candidate, localHour: candidate.getHours() });
    }
  }

  return results.sort((a, b) => a.fireAtUtc.getTime() - b.fireAtUtc.getTime());
}

export interface PickedContent {
  readonly kind: NotificationContentKind;
  readonly contentId: string;
}

export interface PlanNotificationsInput {
  readonly schedule: NotificationSchedule;
  readonly now: Date;
  readonly existingSlots: readonly NotificationSlot[];
  readonly horizonDays: number;
  readonly maxPendingSlots: number;
  readonly translationLocale: SupportedLocale;
  /**
   * What the queue may carry. A kept slot whose kind this mode no longer
   * allows is cancelled and regenerated, so switching "What to show" takes
   * effect at the next reschedule rather than after the whole queue drains.
   */
  readonly contentMode: ContentMode;
  readonly timeZone: string;
  /**
   * Picks the content for one new slot. `previousKind` is the kind of the
   * slot that fires just before it (the last kept slot for the first new
   * one, then the previous pick), so "mixed" can keep alternating across
   * refills instead of restarting the pattern each time.
   */
  readonly selectContentForSlot: (localHour: number, previousKind: NotificationContentKind | undefined) => PickedContent | null;
  readonly generateId: () => string;
  readonly randomSeed?: number;
}

export interface NotificationPlan {
  readonly toCancel: readonly string[];
  readonly toSchedule: readonly NotificationSlot[];
  readonly finalSlots: readonly NotificationSlot[];
  readonly timeZoneChanged: boolean;
}

/** Whether a slot of this kind may stay queued under the given content mode. */
export function isKindAllowed(kind: NotificationContentKind, contentMode: ContentMode): boolean {
  if (contentMode === "ayah_only") return kind === "ayah";
  if (contentMode === "hadith_only") return kind === "hadith";
  return true;
}

/**
 * Diffs the desired sliding notification queue against what's already
 * scheduled, so that rescheduling only cancels what must change and never
 * creates duplicates. See docs/NOTIFICATIONS.md "Sliding queue strategy".
 *
 * A kept slot is one that is still in the future AND still matches what
 * the user would get if it were scheduled today: same time zone, same
 * translation language, a kind the current content mode allows. Anything
 * else is cancelled and regenerated — previously a language or content
 * change only reached the queue once every already-scheduled notification
 * (up to 58 on iOS, hours to days of them) had fired in the old language.
 */
export function planNotifications(input: PlanNotificationsInput): NotificationPlan {
  const priorTimeZone = input.existingSlots.find((s) => s.status === "scheduled")?.timeZone;
  const timeZoneChanged = priorTimeZone != null && priorTimeZone !== input.timeZone;

  if (!input.schedule.enabled) {
    const toCancel = input.existingSlots.filter((s) => s.status === "scheduled").map((s) => s.id);
    return { toCancel, toSchedule: [], finalSlots: [], timeZoneChanged };
  }

  const isObsolete = (slot: NotificationSlot): boolean =>
    slot.status === "scheduled" &&
    (timeZoneChanged ||
      new Date(slot.fireAtUtcIso).getTime() <= input.now.getTime() ||
      slot.locale !== input.translationLocale ||
      !isKindAllowed(slot.kind, input.contentMode));

  const toCancel = input.existingSlots.filter(isObsolete).map((s) => s.id);
  const keptSlots = input.existingSlots
    .filter((s) => s.status === "scheduled" && !isObsolete(s))
    .sort((a, b) => a.fireAtUtcIso.localeCompare(b.fireAtUtcIso));

  const remainingBudget = Math.max(0, input.maxPendingSlots - keptSlots.length);
  if (remainingBudget === 0) {
    return { toCancel, toSchedule: [], finalSlots: keptSlots, timeZoneChanged };
  }

  const latestKeptMs = keptSlots.reduce(
    (max, s) => Math.max(max, new Date(s.fireAtUtcIso).getTime()),
    input.now.getTime(),
  );
  const generationStart = new Date(latestKeptMs + 60_000);

  const times = generateSlotTimes({
    schedule: input.schedule,
    now: generationStart,
    horizonDays: input.horizonDays,
    maxSlots: remainingBudget,
    randomSeed: input.randomSeed,
  });

  const toSchedule: NotificationSlot[] = [];
  let previousKind: NotificationContentKind | undefined = keptSlots[keptSlots.length - 1]?.kind;
  for (const time of times) {
    const picked = input.selectContentForSlot(time.localHour, previousKind);
    if (!picked) continue; // corpus exhausted for this slot — logged by the caller
    previousKind = picked.kind;
    toSchedule.push({
      id: input.generateId(),
      fireAtUtcIso: time.fireAtUtc.toISOString(),
      kind: picked.kind,
      contentId: picked.contentId,
      locale: input.translationLocale,
      status: "scheduled",
      createdAtUtcIso: input.now.toISOString(),
      timeZone: input.timeZone,
    });
  }

  return { toCancel, toSchedule, finalSlots: [...keptSlots, ...toSchedule], timeZoneChanged };
}
