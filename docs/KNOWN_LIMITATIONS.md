# Known Limitations

An honest list, organized by area. See also `docs/NOTIFICATIONS.md` for
the platform-notification limits specifically, and
`docs/RELEASE_CHECKLIST.md`'s "Truthfulness" section for what has and
hasn't actually been tested in this development session.

## Corpus & translations

- The shipped corpus is **300 curated āyāt** (real, verbatim Arabic text
  and 11-language translations — see `docs/CORPUS.md`), not yet reviewed
  by a qualified human for religious/editorial accuracy — every entry
  stays `status: "technically_verified"` until that happens.
- Hadith (500 entries, Sahih al-Bukhari + Sahih Muslim only) covers only
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

- **Android boot receiver is not implemented.** `AlarmManager`-based exact
  alarms are cleared on Android reboot; restoring them after boot requires
  a native `BOOT_COMPLETED` broadcast receiver, which needs a custom Expo
  config plugin (Kotlin/Java code) — out of scope for this session. The
  `RECEIVE_BOOT_COMPLETED` permission is declared in `app.config.ts` in
  preparation, but nothing currently listens for that broadcast. Practical
  mitigation: the queue refills automatically next time the app is
  foregrounded.
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
- Text-size setting labels ("small"/"medium"/"large"/"extra_large" chips
  in Settings) are not yet localized strings — a small polish item.
- `settings.antiRepeat` (the anti-repetition window size) is currently
  display-only in Settings; there is no UI control to change it, though
  the underlying preference and selection-engine behavior fully support
  a different value.

## Data model

- Only one storage migration exists (`001_init`) — the migration chain
  has not been exercised across a real schema change, only structurally
  reviewed.
- No checksum verification is implemented for the Arabic corpus data at
  runtime (only structural validation via `scripts/validateCorpus.ts`).
