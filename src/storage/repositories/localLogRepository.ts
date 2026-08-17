import type * as SQLite from "expo-sqlite";

import type { LocalLogEntry } from "@/domain/types";
import type { LocalLogRepository } from "../types";

interface LogRow {
  id: string;
  level: string;
  scope: string;
  message: string;
  created_at_utc: string;
}

function fromRow(row: LogRow): LocalLogEntry {
  return {
    id: row.id,
    level: row.level as LocalLogEntry["level"],
    scope: row.scope,
    message: row.message,
    createdAtUtcIso: row.created_at_utc,
  };
}

export function createLocalLogRepository(db: SQLite.SQLiteDatabase): LocalLogRepository {
  return {
    async add(entry) {
      await db.runAsync(
        "INSERT INTO local_logs (id, level, scope, message, created_at_utc) VALUES (?, ?, ?, ?, ?)",
        [entry.id, entry.level, entry.scope, entry.message, entry.createdAtUtcIso],
      );
      // Keep the log bounded — no unlimited growth on a device.
      await db.runAsync(
        `DELETE FROM local_logs WHERE id NOT IN (
           SELECT id FROM local_logs ORDER BY created_at_utc DESC LIMIT 500
         )`,
      );
    },
    async recent(limit = 50) {
      const rows = await db.getAllAsync<LogRow>(
        "SELECT * FROM local_logs ORDER BY created_at_utc DESC LIMIT ?",
        [limit],
      );
      return rows.map(fromRow);
    },
    async clear() {
      await db.runAsync("DELETE FROM local_logs");
    },
  };
}
