import type * as SQLite from "expo-sqlite";

import type { FavoriteEntry } from "@/domain/types";
import type { FavoritesRepository } from "../types";

interface FavoriteRow {
  ayah_id: string;
  locale: string;
  added_at_utc: string;
}

function fromRow(row: FavoriteRow): FavoriteEntry {
  return {
    ayahId: row.ayah_id,
    locale: row.locale as FavoriteEntry["locale"],
    addedAtUtcIso: row.added_at_utc,
  };
}

export function createFavoritesRepository(db: SQLite.SQLiteDatabase): FavoritesRepository {
  return {
    async add(entry) {
      await db.runAsync(
        "INSERT OR REPLACE INTO favorites (ayah_id, locale, added_at_utc) VALUES (?, ?, ?)",
        [entry.ayahId, entry.locale, entry.addedAtUtcIso],
      );
    },
    async remove(ayahId) {
      await db.runAsync("DELETE FROM favorites WHERE ayah_id = ?", [ayahId]);
    },
    async list() {
      const rows = await db.getAllAsync<FavoriteRow>("SELECT * FROM favorites ORDER BY added_at_utc DESC");
      return rows.map(fromRow);
    },
    async isFavorite(ayahId) {
      const row = await db.getFirstAsync<{ ayah_id: string }>(
        "SELECT ayah_id FROM favorites WHERE ayah_id = ?",
        [ayahId],
      );
      return row != null;
    },
  };
}
