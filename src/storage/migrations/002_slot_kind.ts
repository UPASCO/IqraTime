import type * as SQLite from "expo-sqlite";

/**
 * Adds `kind` to notification_slots so a scheduled slot can carry a hadith
 * as well as an āyah (see NotificationSlot.kind in src/domain/types.ts).
 * The content id keeps living in the existing `ayah_id` column for both
 * kinds — renaming it would mean rebuilding the table, and the column name
 * is invisible outside the repository.
 *
 * Written as a function, not SQL: SQLite has no `ADD COLUMN IF NOT EXISTS`,
 * and the migration runner (src/storage/db.ts) must be safe to re-run
 * after a crash between applying a step and recording its user_version.
 * Existing rows default to "ayah", which is exactly what they all were.
 */
export async function MIGRATION_002_SLOT_KIND(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(notification_slots);");
  if (columns.some((column) => column.name === "kind")) return;
  await db.execAsync("ALTER TABLE notification_slots ADD COLUMN kind TEXT NOT NULL DEFAULT 'ayah';");
}
