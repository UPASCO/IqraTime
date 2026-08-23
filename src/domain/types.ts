/**
 * Core domain types for IqraTime.
 *
 * These types are intentionally framework-agnostic (no React Native, no
 * Expo imports) so the domain and selection engine stay pure and unit
 * testable in plain Node/Jest.
 */

import type { SupportedLocale } from "@/config/appConfig";

/** Quranic reference: surah 1-114, ayah 1-based within the surah. */
export interface AyahReference {
  readonly surah: number;
  readonly ayah: number;
}

/** Stable internal id, e.g. "94:5" (surah:ayah). Never reused across entries. */
export type AyahId = string;

export function makeAyahId(ref: AyahReference): AyahId {
  return `${ref.surah}:${ref.ayah}`;
}

export function parseAyahId(id: AyahId): AyahReference {
  const [surahRaw, ayahRaw] = id.split(":");
  const surah = Number(surahRaw);
  const ayah = Number(ayahRaw);
  if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    throw new Error(`Invalid AyahId: "${id}"`);
  }
  return { surah, ayah };
}

/**
 * The Arabic source text of one ayah, exactly as published by the source
 * corpus (see docs/CORPUS.md for the exact edition/riwaya/numbering used).
 * Never partial, never re-typed by hand from memory.
 */
export interface ArabicAyahText {
  readonly id: AyahId;
  readonly surah: number;
  readonly ayah: number;
  /** Full Uthmani-script text of the ayah, including any attached basmala per corpus convention. */
  readonly text: string;
  /** Number of the surah in Arabic-transliterated Latin form, for lookups/UI fallback. */
  readonly surahNameArabic: string;
  readonly surahNameTransliterated: string;
}

/** One translator/institution's rendering of one ayah into one language. */
export interface AyahTranslation {
  readonly id: AyahId;
  readonly locale: SupportedLocale;
  readonly text: string;
  /** Foreign key into TranslationSource registry (src/data/corpus/sources.ts). */
  readonly sourceId: string;
}

export interface AyahTafsir {
  readonly id: AyahId;
  readonly locale: SupportedLocale;
  readonly text: string;
  /** Foreign key into TafsirSource registry (src/data/corpus/sources.ts). */
  readonly sourceId: string;
}

export type HadithCollection = "bukhari" | "muslim";

/** Stable internal id, e.g. "bukhari:1" (collection:hadithNumber). Never reused across entries. */
export type HadithId = string;

export interface ArabicHadithText {
  readonly id: HadithId;
  readonly collection: HadithCollection;
  readonly collectionDisplayName: string;
  readonly hadithNumber: number;
  /** Full Arabic text exactly as published, isnad (chain of narration) included — never trimmed or altered. */
  readonly text: string;
}

/** One translator/institution's rendering of one hadith into one language. */
export interface HadithTranslation {
  readonly id: HadithId;
  readonly locale: SupportedLocale;
  readonly text: string;
  /** Foreign key into HadithTranslationSource registry (src/data/corpus/sources.ts). */
  readonly sourceId: string;
}

export interface HadithCatalogEntry {
  readonly id: HadithId;
  readonly status: EditorialStatus;
  readonly themes: readonly ThemeKey[];
  readonly isDemoOnly: boolean;
}

/**
 * Editorial lifecycle of a catalog entry. Only "publishable" entries may be
 * shipped in a production build (enforced by scripts/validateCorpus.ts).
 */
export type EditorialStatus =
  | "draft"
  | "technically_verified"
  | "editorially_validated"
  | "religiously_validated"
  | "publishable";

export const EDITORIAL_STATUS_ORDER: readonly EditorialStatus[] = [
  "draft",
  "technically_verified",
  "editorially_validated",
  "religiously_validated",
  "publishable",
];

/** Thematic tags usable for filtering/rotation. Deliberately conservative — see docs/CORPUS.md. */
export type ThemeKey =
  | "patience"
  | "gratitude"
  | "hope"
  | "mercy"
  | "trust_in_god"
  | "prayer"
  | "wisdom"
  | "forgiveness"
  | "generosity"
  | "courage"
  | "humility"
  | "family"
  | "trials"
  | "inner_peace"
  | "remembrance"
  | "protection"
  | "knowledge"
  | "good_deeds"
  | "repentance"
  | "justice"
  | "brotherhood"
  | "creation"
  | "guidance";

export const ALL_THEME_KEYS: readonly ThemeKey[] = [
  "patience",
  "gratitude",
  "hope",
  "mercy",
  "trust_in_god",
  "prayer",
  "wisdom",
  "forgiveness",
  "generosity",
  "courage",
  "humility",
  "family",
  "trials",
  "inner_peace",
  "remembrance",
  "protection",
  "knowledge",
  "good_deeds",
  "repentance",
  "justice",
  "brotherhood",
  "creation",
  "guidance",
];

/**
 * A whitelist entry in the editorial catalog: an ayah judged suitable for
 * standalone, out-of-context presentation as a notification. See
 * docs/CORPUS.md section "Editorial whitelist" for the review checklist.
 */
export interface CatalogEntry {
  readonly id: AyahId;
  readonly status: EditorialStatus;
  readonly themes: readonly ThemeKey[];
  /** Optional one-line editorial context shown on the ayah detail screen only. */
  readonly editorialNote?: string;
  /** True when this entry exists only for development/demo purposes. */
  readonly isDemoOnly: boolean;
}

export type TimePeriod = "morning" | "midday" | "late_afternoon" | "evening";

export type SelectionMode =
  | "balanced_random"
  | "chosen_themes"
  | "progressive_discovery"
  | "favorites_only"
  | "gentle_morning"
  | "evening_reminder";

export type TextOrder = "arabic_first" | "translation_first";

export type TextDisplayMode = "translation_only" | "arabic_only" | "both";

export type AppThemeMode = "light" | "dark" | "system";

export type TextSizeScale = "small" | "medium" | "large" | "extra_large";

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface TimeOfDay {
  readonly hour: number; // 0-23
  readonly minute: number; // 0-59
}

/** User-configurable notification schedule. */
export interface NotificationSchedule {
  readonly enabled: boolean;
  readonly startHour: number; // 0-23
  readonly endHour: number; // 0-23, may be < startHour to cross midnight
  readonly frequencyHours: 1 | 2 | 3 | 4 | 6 | 12;
  /** Optional explicit fixed times; when non-empty, overrides frequency-based slots. */
  readonly fixedTimes: readonly TimeOfDay[];
  readonly activeDays: readonly WeekdayIndex[];
  readonly quietNightEnabled: boolean;
  /** Random jitter applied to each computed slot, in minutes, symmetric around the slot. */
  readonly jitterMinutes: number;
  readonly soundEnabled: boolean;
  readonly vibrationEnabled: boolean;
}

/**
 * What kind of content the feed and notifications draw from.
 * "ayah_only" is the default — hadith is opt-in, never silently mixed in.
 * "mixed" alternates strictly one hadith, one ayah, one hadith, ... rather
 * than picking randomly between the two.
 */
export type ContentMode = "ayah_only" | "hadith_only" | "mixed";

/** Full user preference set, persisted locally (see src/storage/preferencesStore.ts). */
export interface UserPreferences {
  readonly onboardingCompleted: boolean;
  readonly interfaceLocale: SupportedLocale;
  readonly translationLocale: SupportedLocale;
  readonly showArabicText: boolean;
  readonly textOrder: TextOrder;
  readonly textDisplayMode: TextDisplayMode;
  readonly appThemeMode: AppThemeMode;
  readonly textSizeScale: TextSizeScale;
  readonly selectedThemes: readonly ThemeKey[];
  readonly selectionMode: SelectionMode;
  readonly antiRepeatWindow: number; // number of most recent notifications to avoid repeating
  readonly schedule: NotificationSchedule;
  readonly contentMode: ContentMode;
}

export type NotificationSlotStatus = "scheduled" | "delivered" | "cancelled" | "failed";

/** A single planned (or already-fired) local notification. */
export interface NotificationSlot {
  readonly id: string; // local UUID, also used as the OS notification identifier
  readonly fireAtUtcIso: string;
  readonly ayahId: AyahId;
  readonly locale: SupportedLocale;
  readonly status: NotificationSlotStatus;
  readonly createdAtUtcIso: string;
  readonly timeZone: string; // IANA name captured at scheduling time
}

export type HistorySource = "notification" | "app_shuffle" | "manual_view" | "mood_pick";

export interface HistoryEntry {
  readonly id: string;
  readonly ayahId: AyahId;
  readonly locale: SupportedLocale;
  readonly receivedAtUtcIso: string;
  readonly source: HistorySource;
}

export interface FavoriteEntry {
  readonly ayahId: AyahId;
  readonly locale: SupportedLocale;
  readonly addedAtUtcIso: string;
}

export interface HiddenAyahEntry {
  readonly ayahId: AyahId;
  readonly hiddenAtUtcIso: string;
}

export interface LocalLogEntry {
  readonly id: string;
  readonly level: "info" | "warn" | "error";
  readonly scope: string;
  readonly message: string;
  readonly createdAtUtcIso: string;
}
