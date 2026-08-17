# AyahNow

> **Et si le Coran venait à vous !** Une notification d'āyah différente par heure.
> *The Quran on your screen, without unlocking.*

AyahNow is an offline-first React Native / Expo app that delivers a short,
editorially-reviewed āyah of the Quran to your lock screen at times you
choose — no account, no server, no internet connection required to use the
app day to day.

**"AyahNow" is a working name.** Every brand-specific value (app name,
bundle identifiers, EAS project id, contact address, privacy policy URL,
brand colors) lives in one file, [`src/config/appConfig.ts`](src/config/appConfig.ts),
so it can be replaced before publication without hunting through the codebase.

---

## ⚠️ Status: not production-ready

This repository is a complete, working **architecture and implementation**
of everything the product spec asks for — but it ships with a small
**development-only sample corpus** (5 ayat, Arabic text only, zero
translations) rather than a complete, licensed, religiously-validated Quran
corpus. See [docs/CORPUS.md](docs/CORPUS.md) and [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md)
for exactly why, and exactly what has to happen before a real release.
`npm run corpus:validate:prod` enforces this: **a production build with the
current corpus fails on purpose.**

---

## Features

- Local, scheduled notifications carrying a Quran āyah — Arabic text,
  translation, or both, in your chosen order.
- Fully offline: no account, no backend, no analytics, no ads.
- 10 interface languages: Arabic, English, French, Spanish, Portuguese,
  Hindi, Bengali, Simplified Chinese, Italian, Russian — with full RTL
  support for Arabic.
- Configurable schedule: active hours, days, frequency (1/2/3/4/6/12h),
  fixed times, quiet night hours, optional random jitter.
- Themes (patience, gratitude, hope, mercy, …) to bias which āyāt you
  receive — entirely on-device, no profiling.
- History, favorites, "another āyah", share, copy.
- A Diagnostics screen explaining exactly what the app can and cannot
  guarantee about delivery timing on your device.
- Light/dark/system themes, adjustable text size, WCAG AA color contrast.
- An optional, **disabled-by-default** "Support AyahNow" donation flow
  (Stripe Payment Link opened in the system browser — no server, no
  in-app WebView, no card data ever touches the app). See
  [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md).

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full breakdown.
Short version:

```
app/                  Expo Router screens (thin: composition + navigation)
src/domain/           Framework-free types & constants
src/data/corpus/      Static corpus (Arabic text, catalog, translations, sources)
src/storage/          SQLite (history/favorites/notifications/logs) + AsyncStorage (preferences)
src/services/selectionEngine/  Pure, seedable āyah-selection algorithm
src/notifications/    Scheduling logic (pure) + expo-notifications integration
src/i18n/              10-language catalogs, typed, with a schema every locale must satisfy
src/theme/             Design tokens, light/dark, ThemeProvider
src/components/        Reusable UI components
src/hooks/             React state glue (preferences store, DB provider, ayah view)
scripts/               Corpus validator + translation import tool
tests/                 Unit, integration, and component tests
docs/                  Architecture, notifications, corpus, translations, privacy,
                        accessibility, release checklist, known limitations
```

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- For native builds: Xcode (iOS, macOS only) and/or Android Studio (Android)
- An Expo account if you intend to use EAS Build

## Installation

```bash
npm install
```

## Commands

| Command | What it does |
|---|---|
| `npm start` | Start the Metro bundler (Expo Go compatible for most screens) |
| `npm run android` | Build & run on a connected Android device/emulator (Development Build) |
| `npm run ios` | Build & run on iOS simulator/device (Development Build, macOS only) |
| `npm run web` | Run the web build (secondary target; not the focus of this app) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint-config-expo`) |
| `npm test` | Jest unit/integration/component tests |
| `npm run corpus:validate` | Validate the corpus (development mode — warns, doesn't block) |
| `npm run corpus:validate:prod` | Validate the corpus in production mode — **fails the build** on demo/unverified data |
| `npm run corpus:import` | Import a real, licensed translation file (see docs/TRANSLATIONS.md) |
| `npm run security:check-secrets` | Fail if an IBAN or Stripe secret key is found in app files (see docs/STRIPE_SETUP.md) |
| `npm run check` | typecheck + lint + test + corpus:validate + security:check-secrets, in that order |

## Running on Android

```bash
npm run android
```

This requires a **Development Build** (not the plain Expo Go app) because
the project uses `expo-notifications` with a custom notification icon/color
and `expo-sqlite`, both of which need native code. Expo will offer to build
one for you automatically the first time.

## Running on iOS

```bash
npm run ios
```

macOS + Xcode required. Same Development Build requirement as Android —
local notifications with actions/categories are not testable in the plain
Expo Go client.

## Creating a Development Build explicitly

```bash
npx expo prebuild
npx expo run:android   # or: npx expo run:ios
```

Or via EAS (no local native toolchain required):

```bash
npx eas build --profile development --platform android
```

## Tests

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Tests cover: the selection engine (determinism, anti-repeat, length/theme
filtering, fallback relaxation, favorites-only mode, reference consistency,
theme-rotation balance), the scheduler (normal/midnight-crossing windows,
DST spring-forward/fall-back, timezone-change detection, no duplicates,
never-in-the-past, fixed times, disabled schedule), the reschedule
integration flow, preferences storage (corruption recovery, migration),
i18n (schema completeness across all 10 locales, plural category
correctness for Russian/Arabic/Chinese, script-presence checks for
Arabic/Cyrillic/Devanagari/Bengali/Han, unused/unknown key detection),
notification-tap parsing, RTL direction resolution, the seedable RNG, and
platform notification limits. See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md)
for what is **not** covered by automated tests (real-device behavior after
reboot, actual lock-screen rendering, App/Play Store review).

## Corpus: import and validation

```bash
npm run corpus:validate
npm run corpus:import -- --locale fr --file /path/to/licensed.json \
  --translator "..." --title "..." --version "1.0" \
  --source-url "https://..." --license "..." --notice "..."
```

Full details, including exactly why the shipped corpus is demo-only and
what "publishable" means, are in [docs/CORPUS.md](docs/CORPUS.md) and
[docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).

## Adding a translation

See [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md) — short version: obtain a
translation text from a source whose license explicitly permits
redistribution in a mobile app, run `npm run corpus:import`, fill in the
printed source-registry entry by hand (this is deliberately manual: a human
must confirm the license before it ships), then re-run
`npm run corpus:validate:prod`.

## Notification system: what it can and cannot promise

Short version — **read [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md) for
the full explanation**:

- AyahNow has no server. Every notification is scheduled locally, ahead of
  time, as a sliding queue.
- iOS enforces an unpublished, informally-observed ceiling (~64) on
  pending local notifications per app; AyahNow stays well under it and
  relies on you opening the app occasionally to keep the queue full.
- Android has no comparable hard ceiling, but battery optimization and
  manufacturer-specific restrictions can delay delivery; exact-alarm
  permission status cannot be read programmatically from Expo APIs.
- Lock-screen previews depend entirely on your OS notification settings;
  AyahNow cannot detect or override that.
- **We never promise second-precise delivery, and we never truncate an āyah
  to fit a shorter time slot — a shorter āyah is selected instead.**

## Time zones

The scheduler always computes slot times against the device's *current*
system time zone (via JavaScript's local `Date` semantics — no separate
"target time zone" concept). A time-zone or DST change is detected on next
reschedule (app foreground, preference change, or the Diagnostics
"Reschedule now" button) and triggers a full recompute. See
[docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md).

## Offline-first / Privacy

No account, no login, no backend, no analytics SDK, no ad SDK, no tracking
identifier, no data leaves the device. See [docs/PRIVACY.md](docs/PRIVACY.md).

## Ownership & Licenses

AyahNow is proprietary software. All application source code, architecture,
and original brand assets are the exclusive intellectual property of
**Nadir Echaara** — see [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
This is not an open-source project and no license is granted to third
parties. Third-party package licenses: see
[`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md). Corpus/translation
licenses: see [docs/CORPUS.md](docs/CORPUS.md) and
[docs/TRANSLATIONS.md](docs/TRANSLATIONS.md) — **do not assume Quran text or
translations carry the same license as the app code.**

## Publishing

See [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) for the full
Google Play / App Store checklist and [eas.json](eas.json) / [app.config.ts](app.config.ts)
for build configuration.

## What must be replaced before publication

All of these are marked `PROVISIONAL` / `TODO` in code with a pointer to
this section — see [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)
for the full list:

- `src/config/appConfig.ts`: iOS bundle identifier, Android package name,
  EAS project id, contact email, privacy policy URL.
- `eas.json`: Apple/Google submission credentials.
- The corpus itself (`src/data/corpus/`): real, licensed, editorially- and
  religiously-validated Quran text and translations — see
  [docs/CORPUS.md](docs/CORPUS.md).
- App icon / splash screen: a temporary but original icon ships in
  `assets/images/` (source in `assets/source/*.svg`, regenerate via
  `node scripts/generateIconAssets.mjs`); replace with final brand art if desired.
- An Arabic-specific typeface (none is bundled — see
  [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)).
- The "Support AyahNow" donation feature: a real Stripe Payment Link URL
  and the legal/religious/App Store/Play Store review flags — see
  [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md). Ships fully built but
  **disabled**; no bank account (IBAN) is ever entered anywhere in this
  app or its source code — that's configured directly in the Stripe
  Dashboard by the project owner.
