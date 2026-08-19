import type { AppDatabase } from "@/storage/types";
import { saveLastRescheduleInfo } from "@/storage/diagnosticsStore";
import { getRuntimeCorpus, getTranslation, getCorpusEntry } from "@/data/corpus";
import { DEFAULT_ANTI_REPEAT_WINDOW, MAX_NOTIFICATION_AYAH_LENGTH } from "@/domain/constants";
import type { NotificationSlot, ThemeKey, UserPreferences } from "@/domain/types";
import { selectAyah } from "@/services/selectionEngine";
import { cancelOsNotifications, scheduleOsNotification } from "./notificationService";
import { getMaxPendingNotifications, getSchedulingHorizonDays } from "./limits";
import { planNotifications } from "./scheduler";

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
    deps.db.history.recentAyahIds(deps.preferences.antiRepeatWindow || DEFAULT_ANTI_REPEAT_WINDOW),
    deps.db.favorites.list(),
    deps.db.hiddenAyahs.list(),
  ]);

  const recentThemes: ThemeKey[] = recentAyahIds
    .map((id) => getCorpusEntry(id)?.catalog.themes ?? [])
    .flat();

  const usedIdsThisRun = new Set<string>(recentAyahIds);
  let lastSurah: number | undefined = getCorpusEntry(recentAyahIds[0] ?? "")?.arabic.surah;

  const plan = planNotifications({
    schedule: deps.preferences.schedule,
    now: deps.now,
    existingSlots,
    horizonDays: getSchedulingHorizonDays(),
    maxPendingSlots: getMaxPendingNotifications(),
    translationLocale: deps.preferences.translationLocale,
    timeZone: deps.timeZone,
    generateId: deps.generateId,
    randomSeed: deps.randomSeed,
    selectAyahForSlot: (localHour) => {
      const result = selectAyah({
        corpus,
        getTranslation,
        translationLocale: deps.preferences.translationLocale,
        showArabic: deps.preferences.showArabicText,
        requireTranslation: deps.preferences.textDisplayMode !== "arabic_only",
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
      return { ayahId: result.ayahId };
    },
  });

  await safeCancelOs(plan.toCancel, errors);
  if (plan.toCancel.length > 0) {
    await deps.db.notificationSlots.cancelAll(plan.toCancel);
  }

  const scheduledSlots: NotificationSlot[] = [];
  for (const slot of plan.toSchedule) {
    const entry = getCorpusEntry(slot.ayahId);
    if (!entry) {
      errors.push(`missing_corpus_entry:${slot.ayahId}`);
      continue;
    }
    const translation = getTranslation(slot.ayahId, slot.locale);
    const bodyText = formatNotificationBody({
      arabicText: entry.arabic.text,
      translationText: translation?.text,
      showArabic: deps.preferences.showArabicText,
      textOrder: deps.preferences.textOrder,
      displayMode: deps.preferences.textDisplayMode,
    });
    try {
      await scheduleOsNotification({
        slot,
        reference: { surah: entry.arabic.surah, ayah: entry.arabic.ayah },
        bodyText,
        locale: slot.locale,
        soundEnabled: deps.preferences.schedule.soundEnabled,
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

async function safeCancelOs(ids: readonly string[], errors: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    await cancelOsNotifications(ids);
  } catch (error) {
    errors.push(`os_cancel_failed:${String(error)}`);
  }
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
