import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";

import { getAppDatabase } from "@/storage";
import { loadPreferences } from "@/storage/preferencesStore";
import { detectTimeZone } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import { reschedule } from "./rescheduleService";

export const BACKGROUND_REQUEUE_TASK_NAME = "ayahnow-background-requeue";

/**
 * Android's AlarmManager-scheduled exact alarms (see notificationService.ts)
 * are wiped on device reboot; a real fix needs the app to re-arm them again
 * without waiting for the user to open it. The textbook answer is a native
 * BOOT_COMPLETED broadcast receiver, but that needs a custom Expo config
 * plugin and native Kotlin/Java code — out of reach for a managed JS/TS
 * project without ejecting.
 *
 * This gets the same practical outcome without any native code: WorkManager
 * (which expo-background-task uses on Android under the hood) persists its
 * own schedule in its own storage and re-arms itself across a reboot
 * automatically — that's WorkManager's job, not something we implement here.
 * So a periodic background task that simply re-runs the same reschedule()
 * the app already runs on foreground self-heals the notification queue
 * within one interval of a reboot, with no receiver needed. iOS's
 * BGTaskScheduler (what expo-background-task uses there) gives the same
 * self-healing effect on that platform too, independent of its own
 * restart-survives-fine behavior.
 */
TaskManager.defineTask(BACKGROUND_REQUEUE_TASK_NAME, async () => {
  try {
    const db = await getAppDatabase();
    const { preferences } = await loadPreferences();
    await reschedule({
      db,
      preferences,
      now: new Date(),
      timeZone: detectTimeZone(),
      generateId: generateLocalId,
    });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Registers the periodic requeue task. Idempotent — safe to call on every
 * app start, like the notification channel/category registration next to
 * it. 15 minutes is the OS-enforced floor for `minimumInterval`; the OS
 * treats it as a minimum; actual runs are usually far less frequent
 * (particularly on iOS), which is fine — this only needs to catch up
 * eventually, not immediately.
 */
export async function registerBackgroundRequeueTask(): Promise<void> {
  await BackgroundTask.registerTaskAsync(BACKGROUND_REQUEUE_TASK_NAME, { minimumInterval: 15 });
}
