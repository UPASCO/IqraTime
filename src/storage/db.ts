import * as SQLite from "expo-sqlite";

import { MIGRATION_001_INIT } from "./migrations/001_init";

const DATABASE_NAME = "ayahnow.db";

/** Ordered list of migrations. Each index+1 is its target `user_version`. */
const MIGRATIONS: readonly string[] = [MIGRATION_001_INIT];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens (or returns the cached) app database and brings it to the latest
 * schema version. Migrations run inside a transaction per step and are
 * idempotent (CREATE TABLE IF NOT EXISTS) so a partially-applied migration
 * from a crashed previous run can safely re-run.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
  let currentVersion = row?.user_version ?? 0;

  for (let index = currentVersion; index < MIGRATIONS.length; index += 1) {
    const migration = MIGRATIONS[index];
    if (!migration) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration);
    });
    currentVersion = index + 1;
    await db.execAsync(`PRAGMA user_version = ${currentVersion};`);
  }

  return db;
}

/** Test/dev helper: closes and forgets the cached connection so a fresh one opens next call. */
export async function resetDatabaseConnection(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.closeAsync();
    dbPromise = null;
  }
}
