import AsyncStorage from "@react-native-async-storage/async-storage";

import { appConfig } from "@/config/appConfig";
import type { ContentMode, UserPreferences } from "@/domain/types";
import { legacyContentModeToKinds } from "@/services/feedContentMode";

const STORAGE_KEY = "ayahnow.preferences";
export const PREFERENCES_SCHEMA_VERSION = 1;

interface StoredPreferences {
  readonly schemaVersion: number;
  readonly preferences: UserPreferences;
}

export const defaultPreferences: UserPreferences = {
  onboardingCompleted: false,
  interfaceLocale: "en",
  translationLocale: "en",
  showArabicText: true,
  textOrder: "arabic_first",
  textDisplayMode: "both",
  appThemeMode: "light",
  textSizeScale: "medium",
  selectedThemes: [],
  selectionMode: "balanced_random",
  // Everything on by default (2.1.0): the feed and the notification queue
  // rotate through āyāt, hadiths, Names and invocations; each kind can be
  // switched off independently in Settings.
  contentKinds: { ayah: true, hadith: true, name: true, dua: true },
  // The Name of the day ships on by default — one gentle notification at
  // 08:00 that is the same for every user worldwide (see
  // src/data/names/index.ts) — and the daily invocation is opt-in.
  dailyNameEnabled: true,
  dailyNameHour: 8,
  dailyDuaEnabled: false,
  dailyDuaHour: 20,
  schedule: {
    enabled: false,
    startHour: appConfig.defaultSchedule.startHour,
    endHour: appConfig.defaultSchedule.endHour,
    frequencyHours: appConfig.defaultSchedule.frequencyHours,
    fixedTimes: [],
    activeDays: [...appConfig.defaultSchedule.activeDays],
    quietNightEnabled: appConfig.defaultSchedule.quietNightEnabled,
    jitterMinutes: 0,
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

/**
 * A conservative structural check — not a full schema validator — used to
 * decide whether persisted JSON is trustworthy enough to use as-is. Rather
 * than validate every field (brittle across additive changes), we check
 * the shape is at least a plausible UserPreferences and let individual
 * migrations backfill new fields with defaults.
 */
function looksLikePreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.onboardingCompleted === "boolean" &&
    typeof v.interfaceLocale === "string" &&
    typeof v.schedule === "object" &&
    v.schedule !== null
  );
}

/** Migrates an older persisted shape forward (schema v1 covers all shapes so far; additive fields are backfilled from defaults). */
function migrate(stored: StoredPreferences): UserPreferences {
  const merged: UserPreferences = {
    ...defaultPreferences,
    ...stored.preferences,
    schedule: { ...defaultPreferences.schedule, ...stored.preferences.schedule },
  };
  // Pre-2.1.0 builds persisted a three-way `contentMode` instead of
  // `contentKinds`. When the stored value has no contentKinds yet, map the
  // legacy switch (see legacyContentModeToKinds for why the old default
  // maps to the new everything-on default).
  const legacy = (stored.preferences as UserPreferences & { contentMode?: ContentMode }).contentMode;
  if (!(stored.preferences as Partial<UserPreferences>).contentKinds && legacy) {
    return { ...merged, contentKinds: legacyContentModeToKinds(legacy) };
  }
  return merged;
}

export interface LoadPreferencesResult {
  readonly preferences: UserPreferences;
  readonly wasCorrupted: boolean;
}

export async function loadPreferences(): Promise<LoadPreferencesResult> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return { preferences: defaultPreferences, wasCorrupted: true };
  }

  if (!raw) {
    return { preferences: defaultPreferences, wasCorrupted: false };
  }

  try {
    const parsed = JSON.parse(raw) as StoredPreferences;
    if (!looksLikePreferences(parsed.preferences)) {
      throw new Error("Stored preferences failed shape check");
    }
    return { preferences: migrate(parsed), wasCorrupted: false };
  } catch {
    // Corrupted JSON or unexpected shape: reset to defaults rather than crash.
    return { preferences: defaultPreferences, wasCorrupted: true };
  }
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  const payload: StoredPreferences = { schemaVersion: PREFERENCES_SCHEMA_VERSION, preferences };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function resetPreferences(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
