# Translations

Two entirely different things are called "translations" in this codebase —
keep them separate:

1. **UI string translations** (`src/i18n/locales/*.ts`) — the app's own
   interface text (buttons, labels, onboarding copy) in 10 languages.
   **These ship complete** in this build; see "UI translations" below.
2. **Quran translations** (`src/data/corpus/translations/*.json`) — a
   translator/institution's rendering of the Quran's meaning into a
   target language. **None ship in this build.** See "Quran translations"
   below for why and how to add real ones.

## UI translations (complete, all 10 languages)

`src/i18n/locales/en.ts` is the source of truth. `src/i18n/schema.ts`
derives `TranslationSchema = typeof en`, and every other locale file is
declared `export const xx: TranslationSchema = { ... }` — so `tsc` fails
to compile if any locale is missing a key, has an extra key, or nests a
key differently than English does. This is checked again at runtime by
`tests/unit/i18nCompleteness.test.ts`, which also verifies:

- no empty string values in any locale,
- Russian's plural forms include the full `one`/`few`/`many`/`other`
  Slavic category set,
- Arabic's plural forms include more than the minimal `one`/`other` set
  (it has up to 6 CLDR categories: zero/one/two/few/many/other),
- Simplified Chinese's plural forms correctly supply only `other` (Chinese
  has no grammatical plural),
- Arabic/Russian/Hindi/Bengali/Simplified-Chinese strings actually contain
  their expected Unicode script (regex `\p{Script=...}` checks — catches a
  locale file accidentally left in English or mis-copied),
- every statically-referenced `t("some.key")` call across `app/` and
  `src/` resolves to a real key (catches typos/stale renames).

### Adding an 11th UI language

1. Add the locale code to `appConfig.supportedLocales` in
   `src/config/appConfig.ts`.
2. Create `src/i18n/locales/xx.ts`, copying `en.ts`'s structure, typed as
   `TranslationSchema` — `tsc` will list every key you still need to fill in.
3. Register it in the `catalogs` map in `src/i18n/index.ts`.
4. Add its native-language name to `LOCALE_NATIVE_NAMES` in
   `src/i18n/localeNames.ts`.
5. Run `npm test` — the completeness suite covers the new locale
   automatically via `appConfig.supportedLocales`.

## Quran translations (none ship — read this before assuming it's a bug)

The product spec contains an explicit, absolute rule: **never translate an
ayah with a language model, automated service, or improvised wording.**
Combined with this development session having no network access to fetch
and verify a real licensed translation file, the only correct choice was
to ship **zero** Quran translation text rather than either (a) violate
that rule or (b) guess at a real translator's exact wording from memory
and risk misattributing incorrect text to a real person or institution.

What *is* built and ready:

- `src/data/corpus/translations/schema.ts` — the exact JSON shape expected.
- `src/data/corpus/sources.ts` — the `TranslationSourceInfo` registry
  (translator, title, version, date, source URL, license, redistribution
  confirmation, required notice, validation status, checksum). Currently
  empty (`translationSources = []`).
- `scripts/importTranslation.ts` — a documented CLI tool that validates a
  translation file's ids/text against the shipped Arabic corpus,
  computes a checksum, writes the per-locale JSON file, and prints the
  exact remaining manual steps (deliberately manual: a human must
  personally confirm the license before it ships).
- The Sources & Translations screen (`app/sources.tsx`) already renders
  whatever is registered, including a translator name, version, license,
  and validation status per active language — it will start showing real
  data the moment a source is imported and registered.
- `getTranslation()` / `hasAnyTranslations()` in `src/data/corpus/index.ts`
  gracefully return "not available" rather than crashing when a language
  has no imported translation — exercised by the `arabic_only` fallback
  path in the selection engine and the "Translation missing" UI state on
  the ayah detail screen.

### How to add a real, licensed translation

1. **Choose a source whose license explicitly permits redistribution
   inside a mobile app.** Being freely readable on a website does **not**
   imply redistribution rights — read the actual license terms. Public
   domain translations (copyright expired) are the safest category;
   several are commonly distributed this way for older English
   renderings. For any translation still under copyright, get explicit
   written permission or use a source that states redistribution terms
   compatible with a commercial mobile app.
2. **Never use an AI model to translate or "improve" the text.** Copy the
   translator's exact published wording, unmodified except for the
   technical transformations you document (e.g. removing footnote
   markers) — see `TranslationSourceInfo` fields for what must be
   recorded about any transformation applied.
3. Format the text as `{ "entries": [{ "id": "94:5", "text": "..." }] }`
   (`TranslationFile` in `translations/schema.ts`), matching ids from
   `src/data/corpus/arabic.json`.
4. Run:
   ```bash
   npm run corpus:import -- \
     --locale fr \
     --file /path/to/your-file.json \
     --translator "Full name or institution" \
     --title "Translation title" \
     --version "1.0" \
     --source-url "https://..." \
     --license "License name/summary" \
     --notice "Any required attribution text"
   ```
5. The tool writes `src/data/corpus/translations/<locale>.json` and prints
   a `TranslationSourceInfo` object to paste into
   `src/data/corpus/sources.ts` — **set `redistributionRightsConfirmed:
   true` only after you have personally verified this**, and set
   `validationStatus` to `"technically_checked"` once someone has
   confirmed the imported text matches the source verbatim, or
   `"validated"` once a qualified person has reviewed it against
   `docs/CORPUS.md`'s checklist.
6. Add the one static-import line into `src/data/corpus/index.ts`'s
   `translationsByLocale` map (the tool prints the exact snippet; Metro
   requires static imports, so this step isn't automatable).
7. Run `npm run corpus:validate:prod` — it will now report that language
   as covered instead of missing.

### Repeat for all 10 languages before a real production release

`scripts/validateCorpus.ts` reports (warning in dev, **error in
production**) any of the 10 supported languages with zero imported
translations. A commercial release should have all 10 covered, or the
unsupported ones should be removed from `appConfig.supportedLocales` and
the onboarding/settings language pickers until they are.
