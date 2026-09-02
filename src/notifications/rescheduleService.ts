import type { AppDatabase } from "@/storage/types";
import { saveLastRescheduleInfo } from "@/storage/diagnosticsStore";
import { getRuntimeCorpus, getTranslation, getCorpusEntry, getAntiRepeatWindow } from "@/data/corpus";
import { getRuntimeHadithCorpus, getHadithEntry, getHadithTranslation } from "@/data/corpus/hadith";
import { MAX_NOTIFICATION_AYAH_LENGTH, MAX_NOTIFICATION_HADITH_LENGTH } from "@/domain/constants";
import type { NotificationSlot, ThemeKey, UserPreferences } from "@/domain/types";
import { effectiveContentMode, nextFeedKind } from "@/services/feedContentMode";
import { mulberry32, selectAyah } from "@/services/selectionEngine";
import { pickHadithForNotification } from "./hadithPicker";
import { cancelAllOsNotifications, cancelOsNotifications, scheduleOsNotification } from "./notificationService";
import { ayahNotificationTitle, hadithNotificationTitle } from "./notificationTitles";
import { getMaxPendingNotifications, getSchedulingHorizonDays } from "./limits";
import { planNotifications, type PickedContent } from "./scheduler";

/**
 * Bumped whenever a change to the app makes notifications that are ALREADY
 * queued in the OS stale — a new content format, a new payload shape, a
 * corpus change the user should see right away. app/_layout.tsx compares
 * it with the version stored on the device at the last run and, when they
 * differ, does one forceFullReschedule() instead of the usual incremental
 * refill, so an update never keeps delivering the previous build's content
 * for days. History: 1 = original queue; 2 = titles carry the surah name,
 * hadith slots, payload { kind, contentId } (1.9.5).
 */
export const NOTIFICATION_QUEUE_VERSION = 2;

export interface RescheduleDependencies {
  readonly db: AppDatabase;
  readonly preferences: UserPreferences;
  readonly now: Date;
  readonly timeZone: string;
  readonly generateId: () => string;
  readonly randomSeed?: number;
}

export type RescheduleResultStatus = "success" | "partial" | "disabled" | "failed";

export interface RescheduleResult {
  readonly status: RescheduleResultStatus;
  readonly scheduledCount: number;
  readonly cancelledCount: number;
  readonly timeZoneChanged: boolean;
  readonly errors: readonly string[];
}

/**
 * The single entry point that ties the schedule, the corpus, the
 * selection engine, and the OS notification APIs together. Called on app
 * foreground, after any preference change, and from the Diagnostics
 * "Reschedule now" button — see docs/NOTIFICATIONS.md "When rescheduling
 * runs".
 */
export async function reschedule(deps: RescheduleDependencies): Promise<RescheduleResult> {
  const errors: string[] = [];

  if (!deps.preferences.schedule.enabled) {
    const existing = await deps.db.notificationSlots.listAll();
    const toCancel = existing.filter((s) => s.status === "scheduled").map((s) => s.id);
    await safeCancelOs(toCancel, errors);
    await deps.db.notificationSlots.cancelAll(toCancel);
    await saveLastRescheduleInfo({ atUtcIso: deps.now.toISOString(), status: "disabled", scheduledCount: 0 });
    return { status: "disabled", scheduledCount: 0, cancelledCount: toCancel.length, timeZoneChanged: false, errors };
  }

  const corpus = getRuntimeCorpus();
  const existingSlots = await deps.db.notificationSlots.listAll();
  const [recentAyahIds, favorites, hidden] = await Promise.all([
    deps.db.history.recentAyahIds(getAntiRepeatWindow()),
    deps.db.favorites.list(),
    deps.db.hiddenAyahs.list(),
  ]);

  const recentThemes: ThemeKey[] = recentAyahIds
    .map((id) => getCorpusEntry(id)?.catalog.themes ?? [])
    .flat();

  const usedIdsThisRun = new Set<string>(recentAyahIds);
  // Content already waiting in the queue counts as "recent" too: without
  // this a refill could queue an āyah (or hadith) that is still due to
  // fire from the previous refill, and the user would see it twice in a row.
  const queuedHadithIds = new Set<string>();
  for (const slot of existingSlots) {
    if (slot.status !== "scheduled") continue;
    if (slot.kind === "hadith") queuedHadithIds.add(slot.contentId);
    else usedIdsThisRun.add(slot.contentId);
  }
  let lastSurah: number | undefined = getCorpusEntry(recentAyahIds[0] ?? "")?.arabic.surah;

  const { translationLocale, textDisplayMode } = deps.preferences;
  // Same downgrade the feed applies: hadith modes fall back to āyāt for a
  // language with no hadith edition (see effectiveContentMode).
  const contentMode = effectiveContentMode(deps.preferences.contentMode, translationLocale);
  // A separate stream from the selection engine's so seeding one never
  // shifts the other's picks.
  const hadithRandom = mulberry32((deps.randomSeed ?? deps.now.getTime()) ^ 0x9e3779b9);

  const pickAyah = (localHour: number): PickedContent | null => {
    const result = selectAyah({
      corpus,
      getTranslation,
      translationLocale,
      showArabic: deps.preferences.showArabicText,
      requireTranslation: textDisplayMode !== "arabic_only",
      localHour,
      selectedThemes: deps.preferences.selectedThemes,
      recentAyahIds: Array.from(usedIdsThisRun),
      recentThemes,
      favoriteAyahIds: favorites.map((f) => f.ayahId),
      hiddenAyahIds: hidden.map((h) => h.ayahId),
      maxLength: MAX_NOTIFICATION_AYAH_LENGTH,
      mode: deps.preferences.selectionMode,
      lastSurah,
    });
    if (result.status !== "selected") {
      errors.push("selection_engine_no_candidates");
      return null;
    }
    usedIdsThisRun.add(result.ayahId);
    lastSurah = result.entry.arabic.surah;
    return { kind: "ayah", contentId: result.ayahId };
  };

  const pickHadith = (): PickedContent | null => {
    const picked = pickHadithForNotification({
      corpus: getRuntimeHadithCorpus(),
      getTranslation: getHadithTranslation,
      locale: translationLocale,
      displayMode: textDisplayMode,
      excludeIds: queuedHadithIds,
      maxLength: MAX_NOTIFICATION_HADITH_LENGTH,
      random: hadithRandom,
    });
    if (!picked) {
      errors.push("hadith_no_candidates");
      return null;
    }
    queuedHadithIds.add(picked.hadithId);
    return { kind: "hadith", contentId: picked.hadithId };
  };

  const plan = planNotifications({
    schedule: deps.preferences.schedule,
    now: deps.now,
    existingSlots,
    horizonDays: getSchedulingHorizonDays(),
    maxPendingSlots: getMaxPendingNotifications(),
    translationLocale,
    contentMode,
    timeZone: deps.timeZone,
    generateId: deps.generateId,
    randomSeed: deps.randomSeed,
    selectContentForSlot: (localHour, previousKind) => {
      // The exact alternation rule the home feed uses, so "mixed" means the
      // same thing on the lock screen as on screen: one hadith, one āyah.
      // A hadith slot that cannot be filled (an empty pool is the only way)
      // falls back to an āyah rather than leaving a gap in the schedule.
      if (nextFeedKind(contentMode, previousKind) === "hadith") {
        return pickHadith() ?? pickAyah(localHour);
      }
      return pickAyah(localHour);
    },
  });

  await safeCancelOs(plan.toCancel, errors);
  if (plan.toCancel.length > 0) {
    await deps.db.notificationSlots.cancelAll(plan.toCancel);
  }

  const scheduledSlots: NotificationSlot[] = [];
  for (const slot of plan.toSchedule) {
    const content = slot.kind === "hadith" ? buildHadithNotification(slot, deps.preferences) : buildAyahNotification(slot, deps.preferences);
    if (!content) {
      errors.push(`missing_corpus_entry:${slot.contentId}`);
      continue;
    }
    try {
      await scheduleOsNotification({
        slot,
        title: content.title,
        bodyText: content.bodyText,
        locale: slot.locale,
        soundEnabled: deps.preferences.schedule.soundEnabled,
        vibrationEnabled: deps.preferences.schedule.vibrationEnabled,
      });
      scheduledSlots.push(slot);
    } catch (error) {
      errors.push(`os_schedule_failed:${slot.id}:${String(error)}`);
    }
  }

  // Persist exactly the slots the OS accepted — never a positional slice of
  // the *attempted* list, which silently recorded failed slots (and dropped
  // successful ones) whenever a schedule call failed mid-batch.
  const scheduledCount = scheduledSlots.length;
  if (scheduledCount > 0) {
    await deps.db.notificationSlots.saveAll(scheduledSlots);
  }

  const status: RescheduleResultStatus =
    errors.length === 0 ? "success" : scheduledCount > 0 ? "partial" : "failed";

  for (const message of errors) {
    await deps.db.logs
      .add({ id: deps.generateId(), level: "error", scope: "reschedule", message, createdAtUtcIso: deps.now.toISOString() })
      .catch(() => {});
  }
  await saveLastRescheduleInfo({ atUtcIso: deps.now.toISOString(), status, scheduledCount });

  return {
    status,
    scheduledCount,
    cancelledCount: plan.toCancel.length,
    timeZoneChanged: plan.timeZoneChanged,
    errors,
  };
}

/**
 * Cancels every OS-level and DB-tracked notification, then reschedules from
 * scratch against the *current* code, corpus, and preferences.
 *
 * Normal reschedule() only touches obsolete (past or timezone-changed)
 * slots — every still-future slot is deliberately left untouched, OS
 * content and all, so the sliding queue doesn't rewrite work it already
 * did. That's the right call day-to-day, but it means a slot scheduled
 * under an older app build, an older corpus, or since-changed schedule
 * settings keeps firing with whatever content and timing it was given
 * back then — indistinguishable from a live bug until it fires. Use this
 * after an app update, a corpus change, or when Diagnostics reports
 * notifications arriving with unexpected content or timing, to guarantee
 * every pending notification reflects what's installed right now.
 */
export async function forceFullReschedule(deps: RescheduleDependencies): Promise<RescheduleResult> {
  await cancelAllOsNotifications().catch(() => {});
  await deps.db.notificationSlots.clearAll();
  return reschedule(deps);
}

async function safeCancelOs(ids: readonly string[], errors: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    await cancelOsNotifications(ids);
  } catch (error) {
    errors.push(`os_cancel_failed:${String(error)}`);
  }
}

interface NotificationContent {
  readonly title: string;
  readonly bodyText: string;
}

/** Title + body for an āyah slot, or undefined when its id no longer resolves (corpus changed under an old queue). */
function buildAyahNotification(slot: NotificationSlot, preferences: UserPreferences): NotificationContent | undefined {
  const entry = getCorpusEntry(slot.contentId);
  if (!entry) return undefined;
  const translation = getTranslation(slot.contentId, slot.locale);
  return {
    title: ayahNotificationTitle(slot.locale, {
      surah: entry.arabic.surah,
      ayah: entry.arabic.ayah,
      surahName: slot.locale === "ar" ? entry.arabic.surahNameArabic : entry.arabic.surahNameTransliterated,
    }),
    bodyText: formatNotificationBody({
      arabicText: entry.arabic.text,
      translationText: translation?.text,
      showArabic: preferences.showArabicText,
      textOrder: preferences.textOrder,
      displayMode: preferences.textDisplayMode,
    }),
  };
}

/** Title + body for a hadith slot, or undefined when its id no longer resolves. */
function buildHadithNotification(slot: NotificationSlot, preferences: UserPreferences): NotificationContent | undefined {
  const entry = getHadithEntry(slot.contentId);
  if (!entry) return undefined;
  const translation = getHadithTranslation(slot.contentId, slot.locale);
  return {
    title: hadithNotificationTitle(slot.locale, entry.arabic.collectionDisplayName, entry.arabic.hadithNumber),
    bodyText: formatHadithNotificationBody({
      arabicText: entry.arabic.text,
      translationText: translation?.text,
      displayMode: preferences.textDisplayMode,
    }),
  };
}

export interface FormatHadithNotificationBodyInput {
  readonly arabicText: string;
  readonly translationText: string | undefined;
  readonly displayMode: UserPreferences["textDisplayMode"];
}

/**
 * Composes a hadith notification body. Unlike an āyah, a hadith is never
 * shown Arabic + translation together here: the Arabic text carries the
 * full isnad (chain of narrators), which alone can run past what a lock
 * screen shows before the report itself even starts. So the translation
 * is the body whenever the user reads one; the Arabic is the body only
 * for Arabic readers and for "Arabic only" display. The full Arabic with
 * its isnad is one tap away on the hadith screen.
 */
export function formatHadithNotificationBody(input: FormatHadithNotificationBodyInput): string {
  if (input.displayMode !== "arabic_only" && input.translationText?.trim()) return input.translationText;
  return input.arabicText;
}

export interface FormatNotificationBodyInput {
  readonly arabicText: string;
  readonly translationText: string | undefined;
  readonly showArabic: boolean;
  readonly textOrder: UserPreferences["textOrder"];
  readonly displayMode: UserPreferences["textDisplayMode"];
}

/** Composes the notification body text from arabic/translation per the user's display preferences. Never truncates. */
export function formatNotificationBody(input: FormatNotificationBodyInput): string {
  const parts: string[] = [];
  const wantsArabic = input.showArabic && input.displayMode !== "translation_only";
  const wantsTranslation = input.displayMode !== "arabic_only" && !!input.translationText;

  if (wantsArabic && wantsTranslation) {
    parts.push(input.textOrder === "arabic_first" ? input.arabicText : (input.translationText as string));
    parts.push(input.textOrder === "arabic_first" ? (input.translationText as string) : input.arabicText);
  } else if (wantsArabic) {
    parts.push(input.arabicText);
  } else if (wantsTranslation) {
    parts.push(input.translationText as string);
  } else {
    parts.push(input.arabicText);
  }

  return parts.join("\n");
}
