import type {
  FavoriteEntry,
  HiddenAyahEntry,
  HistoryEntry,
  LocalLogEntry,
  NotificationSlot,
} from "@/domain/types";
import type { AppDatabase } from "@/storage/types";

/** Plain in-memory implementation of AppDatabase for unit/integration tests — no SQLite/native module involved. */
export function createInMemoryDatabase(): AppDatabase {
  let history: HistoryEntry[] = [];
  let favorites: FavoriteEntry[] = [];
  let hidden: HiddenAyahEntry[] = [];
  let slots: NotificationSlot[] = [];
  let logs: LocalLogEntry[] = [];

  return {
    history: {
      async add(entry) {
        history = [entry, ...history];
      },
      async list(limit = 200) {
        return history.slice(0, limit);
      },
      async search(query) {
        return history.filter((h) => h.ayahId.includes(query));
      },
      async clear() {
        history = [];
      },
      async recentAyahIds(limit) {
        return history.slice(0, limit).map((h) => h.ayahId);
      },
      async countDistinctAyahIds() {
        return new Set(history.map((h) => h.ayahId)).size;
      },
    },
    favorites: {
      async add(entry) {
        favorites = [entry, ...favorites.filter((f) => f.ayahId !== entry.ayahId)];
      },
      async remove(ayahId) {
        favorites = favorites.filter((f) => f.ayahId !== ayahId);
      },
      async list() {
        return favorites;
      },
      async isFavorite(ayahId) {
        return favorites.some((f) => f.ayahId === ayahId);
      },
    },
    hiddenAyahs: {
      async hide(entry) {
        hidden = [entry, ...hidden.filter((h) => h.ayahId !== entry.ayahId)];
      },
      async unhide(ayahId) {
        hidden = hidden.filter((h) => h.ayahId !== ayahId);
      },
      async list() {
        return hidden;
      },
      async isHidden(ayahId) {
        return hidden.some((h) => h.ayahId === ayahId);
      },
    },
    notificationSlots: {
      async saveAll(newSlots) {
        const ids = new Set(newSlots.map((s) => s.id));
        slots = [...slots.filter((s) => !ids.has(s.id)), ...newSlots];
      },
      async listUpcoming(nowUtcIso) {
        return slots.filter((s) => s.status === "scheduled" && s.fireAtUtcIso >= nowUtcIso);
      },
      async listAll() {
        return slots;
      },
      async cancelAll(ids) {
        const idSet = new Set(ids);
        slots = slots.map((s) => (idSet.has(s.id) ? { ...s, status: "cancelled" } : s));
      },
      async clearAll() {
        slots = [];
      },
      async markDelivered(id) {
        slots = slots.map((s) => (s.id === id ? { ...s, status: "delivered" } : s));
      },
    },
    logs: {
      async add(entry) {
        logs = [entry, ...logs].slice(0, 500);
      },
      async recent(limit = 50) {
        return logs.slice(0, limit);
      },
      async clear() {
        logs = [];
      },
    },
    async resetAll() {
      history = [];
      favorites = [];
      hidden = [];
      slots = [];
      logs = [];
    },
  };
}
