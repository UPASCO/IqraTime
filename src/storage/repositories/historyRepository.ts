import type * as SQLite from "expo-sqlite";

import type { HistoryEntry, HistorySource } from "@/domain/types";
import type { HistoryRepository } from "../types";

interface HistoryRow {
  id: string;
  ayah_id: string;
  locale: string;
  received_at_utc: string;
  source: string;
}

function fromRow(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    ayahId: row.ayah_id,
    locale: row.locale as HistoryEntry["locale"],
    receivedAtUtcIso: row.received_at_utc,
    source: row.source as HistorySource,
  };
}

export function createHistoryRepository(db: SQLite.SQLiteDatabase): HistoryRepository {
  return {
    async add(entry) {
      await db.runAsync(
        "INSERT INTO history (id, ayah_id, locale, received_at_utc, source) VALUES (?, ?, ?, ?, ?)",
        [entry.id, entry.ayahId, entry.locale, entry.receivedAtUtcIso, entry.source],
      );
    },
    async list(limit = 200) {
      const rows = await db.getAllAsync<HistoryRow>(
        "SELECT * FROM history ORDER BY received_at_utc DESC LIMIT ?",
        [limit],
      );
      return rows.map(fromRow);
    },
    async search(query) {
      const rows = await db.getAllAsync<HistoryRow>(
        "SELECT * FROM history WHERE ayah_id LIKE ? ORDER BY received_at_utc DESC LIMIT 200",
        [`%${query}%`],
      );
      return rows.map(fromRow);
    },
    async clear() {
      await db.runAsync("DELETE FROM history");
    },
    async recentAyahIds(limit) {
      const rows = await db.getAllAsync<{ ayah_id: string }>(
        "SELECT ayah_id FROM history ORDER BY received_at_utc DESC LIMIT ?",
        [limit],
      );
      return rows.map((row) => row.ayah_id);
    },
  };
}
