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

  it("maps the pre-2.1.0 contentMode onto contentKinds on migration", async () => {
    const legacy: Record<string, unknown> = { ...defaultPreferences, interfaceLocale: "fr" };
    delete legacy.contentKinds;
    legacy.contentMode = "hadith_only";
    await AsyncStorage.setItem("ayahnow.preferences", JSON.stringify({ schemaVersion: 1, preferences: legacy }));
    const result = await loadPreferences();
    expect(result.wasCorrupted).toBe(false);
    expect(result.preferences.contentKinds).toEqual({ ayah: false, hadith: true, name: false, dua: false });
    expect(result.preferences.interfaceLocale).toBe("fr");
  });

  it("maps the old ayah_only default onto the new everything-on default", async () => {
    const legacy: Record<string, unknown> = { ...defaultPreferences };
    delete legacy.contentKinds;
    legacy.contentMode = "ayah_only";
    await AsyncStorage.setItem("ayahnow.preferences", JSON.stringify({ schemaVersion: 1, preferences: legacy }));
    const result = await loadPreferences();
    expect(result.preferences.contentKinds).toEqual({ ayah: true, hadith: true, name: true, dua: true });
  });

});
