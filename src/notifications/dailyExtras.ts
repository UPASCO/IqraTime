import type { NotificationContentKind, NotificationSlot, UserPreferences } from "@/domain/types";
import { getDailyDuaId, getDua, duaTitleFor, duaTranslationFor } from "@/data/duas";
import { getDailyNameNumber, getName, nameMeaningFor } from "@/data/names";
import { getDailyExtrasHorizonDays } from "./limits";
import { duaNotificationTitle, nameNotificationTitle } from "./notificationTitles";

/**
 * The "daily extras": the Name of the day (kind "name") and the Invocation
 * of the day (kind "dua") — at most one of each per local calendar day, on
 * top of the āyah/hadith sliding queue. They have their own planner rather
 * than flowing through planNotifications() because everything about them
 * is different: their own on/off toggles (independent of the main
 * schedule.enabled switch), a single fixed local hour instead of a
 * frequency window, deterministic content tied to the calendar day (the
 * same name/dua for every user that day — see src/data/names and
 * src/data/duas), and a shorter horizon on iOS
 * (getDailyExtrasHorizonDays()) because each enabled extra costs one slot
 * per day out of the same OS pending-notification budget the main queue
 * draws from. The caller subtracts the extras count from the main queue's
 * maxPendingSlots — see rescheduleService.ts.
 */

export function isDailyExtraKind(kind: NotificationContentKind): kind is "name" | "dua" {
  return kind === "name" || kind === "dua";
}

/**
 * Every slot this planner creates carries this id prefix (the id is also
 * the OS notification identifier). Since 2.1.0 the MAIN queue can carry
 * "name"/"dua" slots too (see ContentKinds), so kind alone no longer says
 * which planner owns a slot — the prefix does.
 */
export const DAILY_EXTRA_ID_PREFIX = "daily-";

/** Whether this slot belongs to the daily-extras planner (vs. the main sliding queue). */
export function isDailyExtraSlot(slot: NotificationSlot): boolean {
  return isDailyExtraKind(slot.kind) && slot.id.startsWith(DAILY_EXTRA_ID_PREFIX);
}

export interface PlanDailyExtrasInput {
  readonly existingSlots: readonly NotificationSlot[];
  readonly preferences: UserPreferences;
  readonly now: Date;
  readonly timeZone: string;
  readonly generateId: () => string;
  /** Test override; production always uses getDailyExtrasHorizonDays(). */
  readonly horizonDays?: number;
}

export interface DailyExtrasPlan {
  readonly toCancel: readonly string[];
  readonly toSchedule: readonly NotificationSlot[];
  /** Future extra slots left untouched because they already match today's preferences. */
  readonly keptCount: number;
}

interface DesiredExtra {
  readonly kind: "name" | "dua";
  readonly contentId: string;
  readonly fireAt: Date;
}

/**
 * Diffs the desired daily-extra slots against what's already queued, the
 * same keep-what-still-matches strategy as planNotifications(): a kept
 * slot must fire in the future at exactly the currently-preferred local
 * hour, in the current language and time zone, carrying exactly the
 * content the calendar assigns to its day — anything else (toggle turned
 * off, hour moved, language switched, timezone travel) is cancelled and
 * regenerated. Pure and deterministic, so it is unit-testable and never
 * creates duplicates across repeated reschedules.
 */
export function planDailyExtras(input: PlanDailyExtrasInput): DailyExtrasPlan {
  const horizonDays = input.horizonDays ?? getDailyExtrasHorizonDays();
  const { preferences, now } = input;
  const locale = preferences.translationLocale;

  const desired: DesiredExtra[] = [];
  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, 12, 0, 0, 0);
    if (preferences.dailyNameEnabled) {
      const fireAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), preferences.dailyNameHour, 0, 0, 0);
      if (fireAt.getTime() > now.getTime()) {
        desired.push({ kind: "name", contentId: String(getDailyNameNumber(day)), fireAt });
      }
    }
    if (preferences.dailyDuaEnabled) {
      const duaId = getDailyDuaId(day, locale);
      const fireAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), preferences.dailyDuaHour, 0, 0, 0);
      if (duaId && fireAt.getTime() > now.getTime()) {
        desired.push({ kind: "dua", contentId: duaId, fireAt });
      }
    }
  }

  const existingExtras = input.existingSlots.filter((slot) => slot.status === "scheduled" && isDailyExtraSlot(slot));
  const keptIds = new Set<string>();
  const toSchedule: NotificationSlot[] = [];

  for (const want of desired) {
    const match = existingExtras.find(
      (slot) =>
        !keptIds.has(slot.id) &&
        slot.kind === want.kind &&
        slot.contentId === want.contentId &&
        slot.locale === locale &&
        slot.timeZone === input.timeZone &&
        new Date(slot.fireAtUtcIso).getTime() === want.fireAt.getTime(),
    );
    if (match) {
      keptIds.add(match.id);
      continue;
    }
    toSchedule.push({
      id: DAILY_EXTRA_ID_PREFIX + input.generateId(),
      fireAtUtcIso: want.fireAt.toISOString(),
      kind: want.kind,
      contentId: want.contentId,
      locale,
      status: "scheduled",
      createdAtUtcIso: now.toISOString(),
      timeZone: input.timeZone,
    });
  }

  const toCancel = existingExtras.filter((slot) => !keptIds.has(slot.id)).map((slot) => slot.id);
  return { toCancel, toSchedule, keptCount: keptIds.size };
}

export interface DailyExtraContent {
  readonly title: string;
  readonly bodyText: string;
}

/**
 * Title + body for a Name-of-the-day slot, or undefined when its number no
 * longer resolves (dataset changed under an old queue). The body always
 * pairs the Arabic name with its one-line meaning: unlike an āyah, the
 * meaning gloss is the whole point of the notification, so the
 * arabic-only/translation-only display preference (written for scripture
 * text) deliberately does not apply here.
 */
export function buildNameNotification(slot: NotificationSlot): DailyExtraContent | undefined {
  const name = getName(Number(slot.contentId));
  if (!name) return undefined;
  // Arabic readers get no gloss (nameMeaningFor returns "" for ar — the
  // name itself is the text); everyone else gets name + meaning.
  const meaning = nameMeaningFor(name, slot.locale);
  return {
    title: nameNotificationTitle(slot.locale, name.transliteration, name.number),
    bodyText: meaning ? `${name.arabic}\n${meaning}` : name.arabic,
  };
}

/** Title + body for an Invocation-of-the-day slot, or undefined when its id no longer resolves. */
export function buildDuaNotification(slot: NotificationSlot, preferences: UserPreferences): DailyExtraContent | undefined {
  const dua = getDua(slot.contentId);
  if (!dua) return undefined;
  const translation = duaTranslationFor(dua, slot.locale);
  const parts: string[] = [];
  // A dua is recited in Arabic, so the Arabic leads whenever it's shown;
  // the daily pool only admits translated entries short enough for a lock
  // screen (see getDailyDuaPool), so "both" stays readable.
  if (preferences.textDisplayMode !== "translation_only" || !translation) parts.push(dua.arabic);
  if (preferences.textDisplayMode !== "arabic_only" && translation) parts.push(translation);
  return {
    title: duaNotificationTitle(slot.locale, duaTitleFor(dua, slot.locale)),
    bodyText: parts.join("\n"),
  };
}
