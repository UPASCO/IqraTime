import type * as SQLite from "expo-sqlite";

import type { NotificationSlot, NotificationSlotStatus } from "@/domain/types";
import type { NotificationSlotRepository } from "../types";

interface SlotRow {
  id: string;
  fire_at_utc: string;
  /** Holds the content id for BOTH kinds — kept under its original name so migration 002 only had to add `kind`, never rewrite rows. */
  ayah_id: string;
  kind: string | null;
  locale: string;
  status: string;
  created_at_utc: string;
  time_zone: string;
}

function fromRow(row: SlotRow): NotificationSlot {
  return {
    id: row.id,
    fireAtUtcIso: row.fire_at_utc,
    // Rows written before migration 002 have no kind: they were all āyāt.
    kind: row.kind === "hadith" ? "hadith" : "ayah",
    contentId: row.ayah_id,
    locale: row.locale as NotificationSlot["locale"],
    status: row.status as NotificationSlotStatus,
    createdAtUtcIso: row.created_at_utc,
    timeZone: row.time_zone,
  };
}

export function createNotificationSlotRepository(db: SQLite.SQLiteDatabase): NotificationSlotRepository {
  return {
    async saveAll(slots) {
      await db.withTransactionAsync(async () => {
        for (const slot of slots) {
          await db.runAsync(
            `INSERT OR REPLACE INTO notification_slots
             (id, fire_at_utc, ayah_id, kind, locale, status, created_at_utc, time_zone)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [slot.id, slot.fireAtUtcIso, slot.contentId, slot.kind, slot.locale, slot.status, slot.createdAtUtcIso, slot.timeZone],
          );
        }
      });
    },
    async listUpcoming(nowUtcIso) {
      const rows = await db.getAllAsync<SlotRow>(
        "SELECT * FROM notification_slots WHERE status = 'scheduled' AND fire_at_utc >= ? ORDER BY fire_at_utc ASC",
        [nowUtcIso],
      );
      return rows.map(fromRow);
    },
    async listAll() {
      const rows = await db.getAllAsync<SlotRow>("SELECT * FROM notification_slots ORDER BY fire_at_utc ASC");
      return rows.map(fromRow);
    },
    async cancelAll(ids) {
      if (ids.length === 0) return;
      await db.withTransactionAsync(async () => {
        for (const id of ids) {
          await db.runAsync("UPDATE notification_slots SET status = 'cancelled' WHERE id = ?", [id]);
        }
      });
    },
    async clearAll() {
      await db.runAsync("DELETE FROM notification_slots");
    },
    async markDelivered(id) {
      await db.runAsync("UPDATE notification_slots SET status = 'delivered' WHERE id = ?", [id]);
    },
  };
}
