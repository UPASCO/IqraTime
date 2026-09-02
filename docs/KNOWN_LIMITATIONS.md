# Known Limitations

An honest list, organized by area. See also `docs/NOTIFICATIONS.md` for
the platform-notification limits specifically, and
`docs/RELEASE_CHECKLIST.md`'s "Truthfulness" section for what has and
hasn't actually been tested in this development session.

## Corpus & translations

- The shipped corpus is **561 curated āyāt** (real, verbatim Arabic text
  and 11-language translations — see `docs/CORPUS.md`): 300 from the
  mechanical build plus 261 from a hand-picked whitelist. Not yet reviewed
  by a qualified scholar for religious/editorial accuracy — the whitelist
  was read for standalone adequacy, nothing more.
- Hadith (584 entries, Sahih al-Bukhari + Sahih Muslim only) covers only
  5 of the app's 12 languages (ar/en/fr/bn/ru); tafsir covers 9 of 12
  (all but Portuguese, Dutch, and German). No edition exists yet in the
  open datasets this project sources from for the missing languages. See
  `docs/CORPUS.md` "Hadith" and "Tafsir".
- Surah name/metadata table for the curated notification corpus covers
  the 113 surahs actually referenced by that corpus (all but 103,
  Al-'Asr — see `docs/CORPUS.md` "Why the corpus is incomplete"). The
  separate full Qur'an reader (`src/data/quran/`) covers all 114.
- The full Qur'an reader ships the complete Arabic text and 11 full
  translations (~16MB of JSON) — a real, accepted size cost for a
  genuine "read the whole Qur'an" feature, not an oversight. Like the
  curated corpus, this text hasn't been reviewed character-by-character
  by a qualified human yet — see `docs/CORPUS.md` "Full Qur'an reader".

## Notifications

- **Android reboot recovery uses a periodic background task, not a native
  boot receiver.** `AlarmManager`-based exact alarms are cleared on Android
  reboot. Rather than a native `BOOT_COMPLETED` broadcast receiver (which
  would need a custom Expo config plugin and Kotlin/Java code), the queue
  self-heals via `src/notifications/backgroundRequeue.ts`: a periodic
  background task (`expo-background-task`, backed by Android's WorkManager
  and iOS's BGTaskScheduler) re-runs the same `reschedule()` the app runs on
  foreground. WorkManager persists its own schedule and re-arms itself
  across a reboot on its own — no receiver code required from the app.
  Trade-off: recovery isn't instant. The OS treats `minimumInterval` (15
  minutes, the floor) as a lower bound, not a guarantee — actual runs can be
  much less frequent, especially on iOS, and are always subject to the same
  battery-optimization/manufacturer restrictions noted below. Opening the
  app still refills the queue immediately regardless.
- Exact-alarm permission status (Android 12+) cannot be read
  programmatically via any currently-available Expo API — see
  `isExactAlarmStatusDetectable()`. Diagnostics links to system settings
  instead of asserting a status it cannot verify.
- No custom notification sound file ships (OS default is used).
- Notification actions (Favorite / Another ayah / Open) all open the app
  to the foreground rather than acting in the background — see
  `docs/NOTIFICATIONS.md` "Notification actions" for why this is a
  deliberate reliability trade-off, not a missing feature.
- Not tested on a real device this session — timing precision, lock-screen
  rendering, and Do Not Disturb/Focus-mode interaction are unverified
  beyond what the code and its unit tests can express.

## Accessibility / RTL

- No Arabic-specific typeface ships (system font fallback) — see
  `docs/ACCESSIBILITY.md`.
- `I18nManager.forceRTL()` (native RTL layout mirroring) requires a JS
  bundle reload to take full effect on React Native — an upstream RN
  limitation. Text-level RTL (alignment, `writingDirection`) is correct
  immediately since every component reads `direction` directly; some
  native-level mirroring could lag until an app restart if the user
  switches into Arabic mid-session.
- No manual screen-reader (VoiceOver/TalkBack) pass has been performed —
  accessibility labels/roles are implemented per component but not
  end-to-end verified with real assistive technology in this session.

## Testing scope

- All automated tests in this repository run under Jest/Node — there is
  no automated device or simulator test suite (e.g. Detox/Maestro) in this
  build.
- Component tests use React Native Testing Library against a small subset
  of screens (currently `AyahCard`); most screens have no dedicated
  component test yet, though all business logic they call
  (selection engine, scheduler, storage, i18n) is covered.
- No visual regression / screenshot testing.

## Platform builds

- This development session had no Xcode or Android Studio available, so
  no native build (`expo prebuild`, `expo run:ios`, `expo run:android`,
  or an EAS cloud build) was actually executed — only `npm install`,
  `tsc`, ESLint, and `jest` were run. See the final report for exact
  commands and results.
- Web (`expo start --web`) is configured as a secondary target but is not
  the focus of this product and has not been manually verified either.

## Localization

- UI strings are complete and type-checked for all 12 languages, but have
  not been proofread by a native speaker of each language beyond the
  translations produced during this session.

## Data model

- Two storage migrations exist (`001_init`, `002_slot_kind`). The second
  is the first real schema change the chain has carried (an added
  column, written as an idempotent function because SQLite has no
  `ADD COLUMN IF NOT EXISTS`); it has been unit-reviewed and exercised
  against the in-memory test database, not yet on a device upgraded from
  an earlier build.
- No checksum verification is implemented for the Arabic corpus data at
  runtime (only structural validation via `scripts/validateCorpus.ts`).
