# Accessibility

## Baseline

Targeting WCAG AA at minimum:

- **Contrast**: every text/background color pair in `src/theme/tokens.ts`
  is documented with its measured contrast ratio. The literal brand gold
  (`#C8A45D`, `goldDecorative`) only measures ~2.1:1 on the ivory
  background and is **never used for text** — a darkened, ~4.6:1 variant
  (`gold`) is used everywhere gold appears as text or an interactive icon.
  In dark mode the raw gold passes AA directly against the dark background
  and is used as-is.
- **Dynamic text size**: `ThemeProvider` exposes `fontScaleMultiplier`
  (small/medium/large/extra_large, user-selectable in Settings), applied
  to every text style via `typography.sizes.* * fontScaleMultiplier`
  rather than fixed pixel sizes.
- **Touch targets**: interactive elements use a minimum 44×44 hit area
  (`Button`, `FavoriteButton`, `Chip`, `SettingRow` all enforce
  `minHeight: 44`), matching both Apple's and Android's accessibility
  guidance.
- **Screen readers**: every interactive component sets
  `accessibilityRole` and an explicit `accessibilityLabel` (never relying
  on visual-only icons) — see `FavoriteButton`, `Chip`, `AyahCard`'s
  action row, tab bar icons (`tabBarAccessibilityLabel`).
- **No color-only signaling**: favorite state uses a filled vs. outline
  heart icon (shape change) in addition to a color change; the
  notification status card uses an icon + text message, not color alone.
- **Reduce motion**: `ThemeProvider` reads
  `AccessibilityInfo.isReduceMotionEnabled()` and exposes
  `reduceMotionEnabled`; the app's own animation surface is intentionally
  minimal (no decorative animations) so there is little to disable, but
  any future animated transition should check this flag first.
- **Error messages**: every user-facing error string
  (`errors.*` in each locale catalog) is a complete sentence explaining
  what happened and, where applicable, what to do next — never a raw
  technical message or error code.

## RTL (Arabic)

- `src/i18n/rtl.ts` resolves `direction: "rtl" | "ltr"` per locale;
  `I18nProvider` exposes it, and every screen/component that needs
  directional layout reads it directly (text alignment, flex row
  direction) rather than relying solely on native RTL layout mirroring.
- `applyNativeLayoutDirection()` (`src/i18n/I18nProvider.tsx`) also calls
  `I18nManager.forceRTL()` for full native mirroring (margins, absolute
  positioning, gesture directions) — **React Native requires a JS bundle
  reload for `forceRTL` to take full effect**, a known upstream
  limitation, not a bug in this app. In practice: RTL is correct on first
  launch once Arabic is the active locale (native RTL is applied before
  the first screen mounts), and correct immediately for anything reading
  `direction` directly (all text alignment) even without a reload; only
  some native-level mirroring (rare in this app's simple layouts) could
  lag until the next app restart if the user *switches into* Arabic mid
  session. This is called out to testers in `docs/KNOWN_LIMITATIONS.md`.
- Arabic text specifically (`ArabicText` component) is always rendered
  `textAlign: "right"`, `writingDirection: "rtl"`, and tagged
  `accessibilityLanguage="ar"` regardless of the interface language, since
  the Quran text itself is always Arabic even when the surrounding UI is
  LTR (e.g. French interface + Arabic text + French translation).

## Arabic typeface

**No Arabic-specific font ships in this build.** `typography.fontFamilyArabic`
in `src/theme/tokens.ts` is `undefined`, which falls back to the OS's own
Arabic-capable system font (legible, but not a traditional Uthmani naskh
style). This was a deliberate scope decision for this session (no licensed,
offline-redistributable font file was fetched) — see
`docs/KNOWN_LIMITATIONS.md`. Recommended replacement: **Noto Naskh
Arabic** (SIL Open Font License, freely redistributable), loaded via
`expo-font` and referenced by name in `tokens.ts`.

## Manual testing checklist (for a human, on real devices/simulators)

This build has **not** had these manually verified on a real device this
session (see `docs/KNOWN_LIMITATIONS.md` "What has and hasn't been
tested") — a release candidate should confirm all of these:

- [ ] VoiceOver (iOS) and TalkBack (Android) can reach and correctly
      announce every interactive element on Home, Ayah detail, History,
      Favorites, Settings, Themes, Diagnostics, Sources, Privacy.
- [ ] System font size set to the largest accessibility setting — no text
      is clipped or overlapping (the app's own text-size setting is
      separate from, and should compound sensibly with, the OS setting).
- [ ] Arabic (RTL) with a long French/Italian translation on the same
      screen — check reading order and alignment.
- [ ] Russian (Cyrillic), Hindi (Devanagari), Bengali, Simplified Chinese
      — check font rendering and line-wrapping of long strings.
- [ ] Dark mode on both platforms — check contrast, not just color swap.
- [ ] Small screen (e.g. iPhone SE-class / a 5" Android device) — check
      no critical control is pushed off-screen.
- [ ] Reduce Motion enabled at the OS level.
