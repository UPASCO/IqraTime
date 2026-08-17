import type {
  FavoriteEntry,
  HiddenAyahEntry,
  HistoryEntry,
  LocalLogEntry,
  NotificationSlot,
} from "@/domain/types";

/**
 * Repository interfaces (ports). The real app wires these to SQLite
 * (see repositories/*.ts), while unit tests use a plain in-memory
 * implementation (tests/fixtures/inMemoryRepositories.ts) — no native
 * module or device required to test business logic that depends on
 * storage.
 */

export interface HistoryRepository {
  add(entry: HistoryEntry): Promise<void>;
  list(limit?: number): Promise<HistoryEntry[]>;
  search(query: string): Promise<HistoryEntry[]>;
  clear(): Promise<void>;
  recentAyahIds(limit: number): Promise<string[]>;
}

export interface FavoritesRepository {
  add(entry: FavoriteEntry): Promise<void>;
  remove(ayahId: string): Promise<void>;
  list(): Promise<FavoriteEntry[]>;
  isFavorite(ayahId: string): Promise<boolean>;
}

export interface HiddenAyahRepository {
  hide(entry: HiddenAyahEntry): Promise<void>;
  unhide(ayahId: string): Promise<void>;
  list(): Promise<HiddenAyahEntry[]>;
  isHidden(ayahId: string): Promise<boolean>;
}

export interface NotificationSlotRepository {
  saveAll(slots: readonly NotificationSlot[]): Promise<void>;
  listUpcoming(nowUtcIso: string): Promise<NotificationSlot[]>;
  listAll(): Promise<NotificationSlot[]>;
  cancelAll(ids: readonly string[]): Promise<void>;
  clearAll(): Promise<void>;
  markDelivered(id: string): Promise<void>;
}

export interface LocalLogRepository {
  add(entry: LocalLogEntry): Promise<void>;
  recent(limit?: number): Promise<LocalLogEntry[]>;
  clear(): Promise<void>;
}

export interface StorageResetResult {
  readonly favoritesPreserved: number;
}

export interface AppDatabase {
  history: HistoryRepository;
  favorites: FavoritesRepository;
  hiddenAyahs: HiddenAyahRepository;
  notificationSlots: NotificationSlotRepository;
  logs: LocalLogRepository;
  /** Wipes all local data. Used by Settings → "Reset all local data". */
  resetAll(): Promise<void>;
}
