# Architecture

## Layering

```
app/            Expo Router screens — composition + navigation only.
                Business logic is imported from src/, never re-implemented here.

src/domain/     Framework-free types, ids, and constants (no React, no RN, no Expo imports).
                This is the vocabulary every other layer speaks.

src/data/       Static, build-time data: the Quran corpus (Arabic text, editorial
                catalog, translations, source/license registry).

src/storage/    Persistence: SQLite (history, favorites, hidden ayat, notification
                slots, local error log) via expo-sqlite, and a small AsyncStorage-backed
                key-value store for user preferences. Exposes repository *interfaces*
                (src/storage/types.ts) so business logic can be tested against an
                in-memory fake instead of a real database.

src/services/   Pure business logic. Currently: the āyah selection engine
                (src/services/selectionEngine/), which takes no React/Expo dependency
                and is fully unit-testable with an injected random seed.

src/notifications/  Two halves:
                - scheduler.ts: pure functions computing *when* slots should fire,
                  given a schedule and "now" — no expo-notifications import.
                - notificationService.ts / permissions.ts / handlers.ts:
                  the expo-notifications integration layer.
                - rescheduleService.ts: the composition root that ties schedule +
                  corpus + selection engine + storage + OS notifications together.

src/i18n/       Ten typed locale catalogs. English (locales/en.ts) is the source of
                truth: `TranslationSchema = typeof en` (src/i18n/schema.ts), and every
                other locale file is declared `const xx: TranslationSchema = {...}`,
                so a missing/misspelled/extra key is a `tsc` compile error, not a
                silent runtime fallback. Plural strings use a hand-rolled
                `PluralForm` + `Intl.PluralRules`-based resolver (see
                src/i18n/plural.ts) rather than a full i18n library, since our plural
                surface is small and this keeps the dependency footprint down.

src/theme/      Design tokens (colors, spacing, radii, typography, shadows) + a
                ThemeProvider exposing light/dark/system resolution and a
                user-adjustable text-size multiplier.

src/components/ Reusable, presentational UI components. No direct storage or
                notification calls — they take data and callbacks as props.

src/hooks/      React-level glue: the Zustand-backed preferences store
                (src/hooks/usePreferencesStore.ts), the AppDatabase React context
                (src/hooks/AppDatabaseProvider.tsx), and useAyahView (resolves an
                ayah id + locale into everything a screen needs to render it).

src/config/     appConfig.ts — the single place that holds brand/publishing identity
                (see README "What must be replaced before publication").

src/utils/      Small, stateless helpers (date formatting, id generation, route
                param encoding, share-text formatting, a dev-only console logger).

scripts/        Node/ts-node CLI tools: corpus validator, translation importer,
                icon-asset generator. Not bundled into the app.

tests/          Jest. unit/ (pure logic), integration/ (reschedule flow against an
                in-memory database), components/ (React Native Testing Library),
                fixtures/ (synthetic test data — never real Quran text).
```

## Data flow: from preferences to a scheduled notification

```
UserPreferences (Zustand store, persisted via AsyncStorage)
        │
        ▼
reschedule() [src/notifications/rescheduleService.ts]
        │
        ├─ reads: current schedule, corpus (getRuntimeCorpus), history/favorites/hidden
        │  from AppDatabase
        │
        ├─ planNotifications() [scheduler.ts, pure]
        │      computes desired future slot *times* as a diff against what's
        │      already scheduled (keep valid future slots, cancel obsolete ones,
        │      generate only what's missing) — never duplicates, respects the
        │      platform's pending-notification ceiling (limits.ts)
        │
        ├─ for each new slot time: selectAyah() [selectionEngine.ts, pure]
        │      filters + weights + picks one ayah id, with progressive filter
        │      relaxation as a documented fallback strategy (see its own doc
        │      comment and docs/NOTIFICATIONS.md)
        │
        ├─ scheduleOsNotification() [notificationService.ts]
        │      calls expo-notifications with a Date trigger, using the slot's
        │      own id as the OS notification identifier (so cancellation is
        │      exact and idempotent)
        │
        └─ persists the resulting NotificationSlot rows via
           AppDatabase.notificationSlots, and a LastRescheduleInfo summary via
           AsyncStorage (src/storage/diagnosticsStore.ts) for the Diagnostics screen.
```

`reschedule()` runs: once at app startup, whenever the app returns to the
foreground (`AppState` listener in `app/_layout.tsx`), whenever a
notification-relevant preference changes, and on-demand from the
Diagnostics screen's "Reschedule now" button.

## Why no i18next / react-i18next

The translation surface here is bounded and fully known ahead of time (a
fixed set of UI strings across 12 languages), and the one thing that needed
real i18n-library sophistication — CLDR plural category selection — is
covered by the built-in `Intl.PluralRules`. A hand-rolled ~150-line
resolver (`src/i18n/index.ts` + `plural.ts`) gets us: (a) compile-time key
completeness checking across all 12 locales (not available from
i18next's runtime-resolved resources without extra tooling), (b) zero
extra runtime dependency, and (c) an explicit, auditable fallback chain
(exact locale → same base language → English, with a dev-mode console
warning on fallback) that matches the spec's requirement almost verbatim.

## Why Zustand (and not just React Context) for preferences

Preferences are read and written from many unrelated screens (every
settings row, onboarding, Home's status card, Diagnostics). A plain
Context would re-render every consumer on every keystroke-level update and
push a lot of prop-drilling boilerplate; Zustand is a ~1KB, actively
maintained, MIT-licensed store with no data collection, and it lets each
component subscribe to only the slice it reads.

## Why SQLite for history/favorites/notification slots, AsyncStorage for preferences

History and favorites need substring search and ordering (`ORDER BY
received_at_utc DESC`, indexed), and the notification-slot table needs
range queries (`WHERE fire_at_utc >= ?`) to find "what's upcoming" — all
naturally expressed in SQL with indexes (see
`src/storage/migrations/001_init.ts`). Preferences are a single small JSON
blob read/written as a whole, for which a key-value store is simpler and
faster than a SQL table with no meaningful query pattern. Using SQLite for
everything would be one storage technology instead of two, but preferences
would either need their own single-row table (extra ceremony for no
benefit) or become one of many rows in a generic key-value table
(re-inventing what AsyncStorage already is). Two purpose-fit technologies,
not more.

## Dependency injection for testability

- Selection engine: takes `corpus`, `getTranslation`, and `randomSeed` as
  plain parameters — no import-time singleton, no hidden global state.
- Scheduler: takes `now: Date` and `randomSeed` explicitly, so DST/timezone
  edge cases are testable without mocking the system clock.
- Storage: repositories are defined as interfaces
  (`src/storage/types.ts`); the real app wires them to SQLite
  (`src/storage/index.ts`), tests wire them to
  `tests/fixtures/inMemoryDatabase.ts`.

## Error handling philosophy

See `docs/KNOWN_LIMITATIONS.md` and the "Gestion des erreurs" requirements
in the product spec. In short: every storage read that can fail (corrupted
JSON, missing keys) falls back to a safe default and is reported via
`wasCorrupted` rather than throwing; the selection engine always returns a
`SelectionResult` (never throws for "no candidates" — only for genuine
internal consistency violations, which would indicate a corpus bug, not a
runtime condition); the reschedule flow accumulates per-slot errors into a
`RescheduleResult.errors` array and a persisted `LastRescheduleInfo`,
surfaced on the Diagnostics screen with a "Reschedule now" retry action.
