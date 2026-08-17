import { getDatabase } from "./db";
import { createFavoritesRepository } from "./repositories/favoritesRepository";
import { createHiddenAyahRepository } from "./repositories/hiddenAyahRepository";
import { createHistoryRepository } from "./repositories/historyRepository";
import { createLocalLogRepository } from "./repositories/localLogRepository";
import { createNotificationSlotRepository } from "./repositories/notificationSlotRepository";
import type { AppDatabase } from "./types";

let appDbPromise: Promise<AppDatabase> | null = null;

/**
 * Assembles the full repository set against the real SQLite-backed
 * database. This is the composition root used by the app; tests instead
 * construct an AppDatabase from tests/fixtures/inMemoryRepositories.ts so
 * business logic can be exercised without a native module.
 */
export function getAppDatabase(): Promise<AppDatabase> {
  if (!appDbPromise) {
    appDbPromise = build();
  }
  return appDbPromise;
}

async function build(): Promise<AppDatabase> {
  const db = await getDatabase();
  return {
    history: createHistoryRepository(db),
    favorites: createFavoritesRepository(db),
    hiddenAyahs: createHiddenAyahRepository(db),
    notificationSlots: createNotificationSlotRepository(db),
    logs: createLocalLogRepository(db),
    async resetAll() {
      await db.execAsync(`
        DELETE FROM history;
        DELETE FROM favorites;
        DELETE FROM hidden_ayahs;
        DELETE FROM notification_slots;
        DELETE FROM local_logs;
      `);
    },
  };
}

export type { AppDatabase } from "./types";
export { getDatabase, resetDatabaseConnection } from "./db";
