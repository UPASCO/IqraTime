import type * as SQLite from "expo-sqlite";

import type { HiddenAyahRepository } from "../types";

interface HiddenRow {
  ayah_id: string;
  hidden_at_utc: string;
}

export function createHiddenAyahRepository(db: SQLite.SQLiteDatabase): HiddenAyahRepository {
  return {
    async hide(entry) {
      await db.runAsync("INSERT OR REPLACE INTO hidden_ayahs (ayah_id, hidden_at_utc) VALUES (?, ?)", [
        entry.ayahId,
        entry.hiddenAtUtcIso,
      ]);
    },
    async unhide(ayahId) {
      await db.runAsync("DELETE FROM hidden_ayahs WHERE ayah_id = ?", [ayahId]);
    },
    async list() {
      const rows = await db.getAllAsync<HiddenRow>("SELECT * FROM hidden_ayahs");
      return rows.map((row) => ({ ayahId: row.ayah_id, hiddenAtUtcIso: row.hidden_at_utc }));
    },
    async isHidden(ayahId) {
      const row = await db.getFirstAsync<{ ayah_id: string }>(
        "SELECT ayah_id FROM hidden_ayahs WHERE ayah_id = ?",
        [ayahId],
      );
      return row != null;
    },
  };
}
