# Third-Party Licenses

This file lists the runtime dependencies of IqraTime and their licenses, as
declared in `package.json` at the time of writing. All are permissive
(MIT or Apache-2.0) and none are known to collect data by default — see
`docs/PRIVACY.md` for the project's data-collection stance.

Run `npx license-checker --production --summary` after `npm install` for
an automatically generated, exhaustive report including transitive
dependencies; this file covers the direct, deliberately-chosen dependencies.

| Package | License | Purpose |
|---|---|---|
| expo | MIT | Core Expo SDK/tooling |
| expo-router | MIT | File-based navigation |
| expo-notifications | MIT | Local notification scheduling |
| expo-sqlite | MIT | On-device SQLite database |
| expo-device | MIT | Device metadata (used for diagnostics) |
| expo-localization | MIT | Device locale/calendar detection |
| expo-linking | MIT | Deep links, system settings links |
| expo-constants | MIT | App/build metadata |
| expo-status-bar | MIT | Status bar styling |
| expo-splash-screen | MIT | Splash screen control |
| expo-font | MIT | Custom font loading (reserved for a future Arabic typeface) |
| expo-clipboard | MIT | Copy-to-clipboard |
| expo-application | MIT | App version/build metadata |
| expo-task-manager | MIT | Background task registration (reserved) |
| expo-background-task | MIT | Background task scheduling (reserved) |
| @expo/vector-icons | MIT | Icon set (Ionicons, bundled offline) |
| react | MIT | UI library |
| react-native | MIT | Native runtime |
| react-native-safe-area-context | MIT | Safe-area insets |
| react-native-screens | MIT | Native screen containers |
| react-native-gesture-handler | MIT | Gesture system (required by React Navigation) |
| react-native-reanimated | MIT | Animation runtime (required by some navigation transitions) |
| react-native-worklets | MIT | Reanimated's worklet runtime |
| @react-native-async-storage/async-storage | MIT | Key-value storage for preferences |
| @react-native-community/datetimepicker | MIT | Native time picker |
| zustand | MIT | Preferences state store |

## Development-only dependencies

| Package | License | Purpose |
|---|---|---|
| typescript | Apache-2.0 | Type checking |
| eslint / eslint-config-expo | MIT | Linting |
| jest / jest-expo | MIT | Test runner |
| @testing-library/react-native | MIT | Component testing |
| ts-node / tsconfig-paths | MIT | Running TypeScript scripts (corpus tooling) |
| sharp (used once, not a project dependency) | Apache-2.0 | Rasterizing the SVG icon sources to PNG via `scripts/generateIconAssets.mjs` — install on demand with `npm install --no-save sharp`, not part of `package.json` |

## Corpus & content licenses

**Not covered by this file.** Quran text and translation licenses are
tracked per-source in `src/data/corpus/sources.ts` and documented in
`docs/CORPUS.md` / `docs/TRANSLATIONS.md` — they are a completely separate
licensing question from the app's code dependencies above, and none are
currently populated (see those documents for why).

## App icon / splash art

Original artwork created for this project (`assets/source/*.svg`,
rasterized to `assets/images/*.png`) — no external assets, stock imagery,
or third-party icon packs were used for these.
