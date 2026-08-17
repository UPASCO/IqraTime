import { create } from "zustand";

import type { UserPreferences } from "@/domain/types";
import { defaultPreferences, loadPreferences, resetPreferences, savePreferences } from "@/storage/preferencesStore";

interface PreferencesState {
  readonly preferences: UserPreferences;
  readonly hydrated: boolean;
  readonly wasCorrupted: boolean;
  hydrate: () => Promise<void>;
  update: (partial: Partial<UserPreferences>) => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Global preferences store. Backed by AsyncStorage via
 * src/storage/preferencesStore.ts. `hydrate()` must be awaited once at app
 * startup (see app/_layout.tsx) before reading `preferences` for real —
 * until then `preferences` holds safe defaults so nothing crashes on a
 * cold render.
 */
export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: defaultPreferences,
  hydrated: false,
  wasCorrupted: false,
  hydrate: async () => {
    const result = await loadPreferences();
    set({ preferences: result.preferences, hydrated: true, wasCorrupted: result.wasCorrupted });
  },
  update: async (partial) => {
    const next: UserPreferences = { ...get().preferences, ...partial };
    set({ preferences: next });
    await savePreferences(next);
  },
  reset: async () => {
    await resetPreferences();
    set({ preferences: defaultPreferences, wasCorrupted: false });
  },
}));
