import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadPreferences, savePreferences, defaultPreferences } from "@/storage/preferencesStore";

describe("preferencesStore", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("returns defaults when nothing is stored yet", async () => {
    const result = await loadPreferences();
    expect(result.preferences).toEqual(defaultPreferences);
    expect(result.wasCorrupted).toBe(false);
  });

  it("round-trips a saved preferences object", async () => {
    const custom = { ...defaultPreferences, interfaceLocale: "fr" as const, showArabicText: false };
    await savePreferences(custom);
    const result = await loadPreferences();
    expect(result.preferences.interfaceLocale).toBe("fr");
    expect(result.preferences.showArabicText).toBe(false);
    expect(result.wasCorrupted).toBe(false);
  });

  it("recovers to defaults instead of crashing when stored JSON is corrupted", async () => {
    await AsyncStorage.setItem("ayahnow.preferences", "{not valid json");
    const result = await loadPreferences();
    expect(result.preferences).toEqual(defaultPreferences);
    expect(result.wasCorrupted).toBe(true);
  });

  it("recovers to defaults when stored JSON has an unexpected shape", async () => {
    await AsyncStorage.setItem("ayahnow.preferences", JSON.stringify({ schemaVersion: 1, preferences: { foo: "bar" } }));
    const result = await loadPreferences();
    expect(result.preferences).toEqual(defaultPreferences);
    expect(result.wasCorrupted).toBe(true);
  });

  it("backfills newly-added fields with defaults on migration instead of losing existing data", async () => {
    // Simulate an older stored payload missing a field that a newer schema expects.
    const legacyPayload = {
      schemaVersion: 1,
      preferences: { ...defaultPreferences, selectedThemes: ["patience"] },
    };
    await AsyncStorage.setItem("ayahnow.preferences", JSON.stringify(legacyPayload));
    const result = await loadPreferences();
    expect(result.preferences.selectedThemes).toEqual(["patience"]);
    expect(result.preferences.schedule).toBeDefined();
  });
});
