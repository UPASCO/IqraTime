import { ALL_MOOD_KEYS, MOOD_THEME_MAP, MOOD_ICONS } from "@/domain/moods";
import { ALL_THEME_KEYS } from "@/domain/types";

describe("mood-to-theme map (the \"A moment for you\" feature)", () => {
  it("gives every mood at least one theme, and only real ThemeKey values", () => {
    for (const mood of ALL_MOOD_KEYS) {
      const themes = MOOD_THEME_MAP[mood];
      expect(themes.length).toBeGreaterThan(0);
      for (const theme of themes) {
        expect(ALL_THEME_KEYS).toContain(theme);
      }
    }
  });

  it("has an icon for every mood", () => {
    for (const mood of ALL_MOOD_KEYS) {
      expect(typeof MOOD_ICONS[mood]).toBe("string");
      expect(MOOD_ICONS[mood].length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate mood keys", () => {
    expect(new Set(ALL_MOOD_KEYS).size).toBe(ALL_MOOD_KEYS.length);
  });
});
