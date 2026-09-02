# Corpus

## Current status: real content, not yet human-reviewed

`src/data/corpus/arabic.json` ships **561 āyāt**, fetched verbatim from
the King Fahd Complex Uthmani edition — not hand-typed, not a placeholder
sample. They come from two passes:

- **300** selected by `scripts/buildFullCorpus.mjs`: a mechanical
  standalone filter plus a curated downselection ("Curated downselection"
  in that script) to a set a knowledgeable Muslim would recognise as
  significant on sight.
- **261** added by `scripts/extendCorpus.mjs` from the hand-picked
  whitelist in `scripts/curatedAyatAdditions.mjs` — see "Curated
  additions" below for how that list was made and what it deliberately
  leaves out.

11 of the app's 12 supported languages have a real, licensed Quran
translation for every one of those āyāt (Arabic readers use the Arabic
text itself, no translation needed). All entries are marked
`status: "publishable"`: the original 300 were promoted in bulk by the
project owner rather than individually walked through the reviewer
checklist below (see `docs/RELEASE_CHECKLIST.md`); the additions were each
read against checklist item 4 (standalone adequacy) when they were
whitelisted, but not by a scholar. The text and its sourcing are exactly
the datasets' own. `scripts/reviewCorpus.mjs` remains available for a
proper pass.

## Convention

| | |
|---|---|
| Riwaya (reading) | Hafs 'an 'Asim |
| Script | Uthmani (rasm) |
| Numbering | Standard Kufi/Madani ayah numbering (Tanzil / King Fahd Complex convention) |
| Basmala handling | Decided when the full Qur'an reader was built (see "Full Qur'an reader" below): rendered as a decorative header above a surah's āyāt — never a numbered āyah of its own — for every surah except At-Tawbah (9). Al-Fatiha (1) is the one exception to *that* exception: its āyah 1 already *is* the basmala in this numbering, so no separate header is added for it. The header text is 1:1's own verbatim text, not retyped. The curated notification corpus still contains no surah-opening āyah, so this convention has never applied there. |
| Recommended source | [Tanzil Project](https://tanzil.net/download/) — Uthmani Quran text |

Do not mix ayat from sources using an incompatible numbering convention or
riwaya into the same build.

## Why the corpus is incomplete (read this before assuming it's a bug)

Every āyah, Arabic and translated, is fetched verbatim from a canonical
open dataset (King Fahd Complex Uthmani text and licensed translations
via `fawazahmed0/quran-api`, see `scripts/buildFullCorpus.mjs`) — never
typed from memory, never generated or translated by an AI model, per this
project's absolute rule ("ne jamais traduire les āyāt avec un modèle de
langage"). So the text itself is not the missing piece.

What's still missing is **human judgement**: `scripts/buildFullCorpus.mjs`
selects and curates by MECHANICAL criteria only (length bounds, sentence
completeness, a hand-picked list of widely-recognised āyāt) — it cannot
assess religious or rhetorical significance, and it does not claim to.
Entries are written as `status: "technically_verified"` by the build
script and only a human should promote them past that. The gate itself is
still in place (`getPublishableCorpus()` / `validateCorpus.ts`); what
changed is that the owner exercised it deliberately in bulk rather than
per entry — see the status note at the top of this file.

This is the intended gate, not a bug: build the full
architecture and real content, block a silent production build, require
a human sign-off before anything ships as final.

## Editorial whitelist — why not just "pick short verses"

`src/data/corpus/catalog.json` is a deliberate **whitelist**, not an
algorithmic filter over verse length. A short verse is not automatically
suitable for standalone, out-of-context presentation as a notification —
some depend heavily on the preceding verse, some are directed at a
specific historical situation, some are legal rulings or warnings that
read very differently in isolation. Each catalog entry is expected to go
through this checklist before being marked `publishable`:

### Reviewer checklist (for a qualified person to complete)

1. **Arabic text** — verify character-by-character against a canonical
   source (Tanzil Uthmani text recommended). Check every diacritic.
2. **Reference** — confirm surah number, ayah number, and that they match
   the canonical numbering convention declared above.
3. **Translation** (once one is imported) — confirm it is the verbatim,
   unmodified text from the declared licensed source, not paraphrased.
4. **Standalone adequacy** — does this ayah read as a complete, correct
   thought without its surrounding context? Flag (and likely reject)
   ayat that:
   - depend grammatically or semantically on the immediately preceding
     ayah (e.g. continue a list, a conditional clause, or a quoted
     speech's referent),
   - are a legal ruling stated without its conditions,
   - concern warfare/conflict and could read as a general directive
     without its historical context,
   - state a threat or punishment without the surrounding mercy/context,
   - are addressed to a specific person or situation in a way that risks
     being misread as a general statement.
5. **Themes** — do the assigned theme tags (`src/domain/types.ts`
   `ThemeKey`) genuinely match the ayah's content? Avoid speculative or
   overly interpretive theme assignments.
6. **Sensitivity note** — if the ayah needs a one-line editorial context
   note to avoid misreading (`CatalogEntry.editorialNote`), write one;
   keep it factual, not exegetical.
7. Only after all of the above: promote `status` from `"draft"` →
   `"technically_verified"` → `"editorially_validated"` →
   `"religiously_validated"` → `"publishable"`, in that order
   (`EDITORIAL_STATUS_ORDER` in `src/domain/types.ts`). Only
   `"publishable"` entries are eligible for a production build
   (`getPublishableCorpus()`).

Current entries do not carry a per-entry `editorialNote` (see
`catalog.json`'s `_readme` for why: repeating the same "machine-selected,
awaiting review" caveat on 300 entries individually would just bloat the
shipped bundle without adding information) — a reviewer works from the
checklist above directly, not from a pre-flagged concern per āyah.

## Curated additions (`scripts/curatedAyatAdditions.mjs`)

The mechanical build above plus its round-robin "one per surah" top-up
left out a long list of āyāt any practising Muslim recognises on sight —
the parable of the grain of charity (2:261), "you will never attain
righteousness until you spend of what you love" (3:92), "Allah wrongs not
even an atom's weight" (4:40), Yusuf's dua (12:101), "We made the Qur'an
easy to remember" (54:17), "He is the First and the Last" (57:3), the
opening of Surat al-Ikhlas (112:1) — while the same surah's slot went to
a mechanically "quotable" but forgettable neighbour.

`scripts/curatedAyatAdditions.mjs` is a hand-picked whitelist of such
āyāt, applied by `node scripts/extendCorpus.mjs`:

- Every id passes the **same mechanical standalone filter**
  `buildFullCorpus.mjs` applies (length bounds, no mid-sentence opening
  in any Latin-script edition, no continuation or referential opening, no
  trailing continuation punctuation in any edition). `extendCorpus.mjs`
  re-checks and refuses anything that fails; the few admitted exceptions
  are listed and justified in `MECHANICAL_CHECK_EXCEPTIONS` in the same
  file (currently one: 23:1, four characters under the English length
  floor but a complete sentence everywhere).
- Every id was read against reviewer checklist item 4. Famous āyāt whose
  subject is only known from the previous āyah ("So We answered his
  call…", "He said: …", "Fear not, I am with you both") were left out,
  as were two widely cited āyāt that attribute misfortune to one's own
  deeds (4:79, 42:30): true, but read cold on a lock screen by someone
  ill or grieving they land as blame, and a notification cannot carry
  the context that softens them.
- **No text is typed.** The Arabic and all eleven translations are copied
  from `src/data/quran/` (the full-Qur'an reader dataset, built from the
  exact same editions — `extendCorpus.mjs` refuses to run if the two ever
  disagree on an āyah they both contain), and tafsir is fetched from the
  same edition `scripts/fetchTafsir.mjs` uses, for the added surahs only.
- Themes come from the shared tagger in `scripts/ayahThemes.mjs`, the
  `notable` flag from `ICONIC_REFS` — the same rules as the original 300.

To drop an addition later, remove it from the whitelist and from the
corpus JSON files (or rebuild with `buildFullCorpus.mjs` and re-run
`extendCorpus.mjs`).

## Notable āyāt (`notable` flag)

`scripts/markNotableAyat.mjs` writes a `notable: true` flag onto the
shipped entries listed in `scripts/iconicRefs.mjs` (262 of the 561 as of
the curated extension) — āyāt frequently cited on their own (dua,
khutbahs, calligraphy), the same list that gave those āyāt priority when
the corpus was downselected to 300 in the first place, extended with the
most-cited of the curated additions. `iconicRefs.mjs` is the single
source of truth for both, so the build-time curation and the runtime
weighting cannot drift apart.

At runtime the selection engine weights these up heavily
(`NOTABLE_BOOST` in `src/services/selectionEngine/weighting.ts`), so a
rotation front-loads the āyāt a reader is most likely to recognise. It is
a weight and never a filter: combined with the anti-repeat window (see
below), every other āyah is still reached before anything repeats — the
notable ones simply tend to come first in the cycle.

Like theme tags, this is a recall-oriented heuristic, not a religious
ranking. A wrong entry only costs an āyah a weighting boost.

## Anti-repeat window

`getAntiRepeatWindow()` (`src/data/corpus/index.ts`) returns the full
runtime corpus size, so the selection engine excludes every āyah already
in recent history until a complete rotation has been shown. This
replaced a user-facing "reduce repetition" setting that defaulted to 30
— under hourly notifications that let an āyah return after about a day
and a half. When a rotation is genuinely exhausted, the engine's
progressive relaxation drops the filter and the cycle restarts, so it can
never dead-end.

## Consistency checks

`scripts/validateCorpus.ts` (run via `npm run corpus:validate`) checks,
every time, in both development and production mode:

- unique ids, valid surah (1-114) and ayah numbers
- `arabic.id === catalog.id` referential consistency
- non-empty Arabic text, no artificial truncation (trailing `...`/`…`)
- known, valid editorial status
- every assigned theme is a recognized `ThemeKey`
- every registered translation source has a license, translator name,
  source URL, and confirmed redistribution rights
- every one of the 12 supported languages has a UI catalog (always true —
  compile-time enforced, see `docs/TRANSLATIONS.md`) and reports (warns in
  dev, **errors in production**) if it has zero imported Quran translations

In production mode (`CORPUS_ENV=production`, set automatically by the
`production` EAS build profile) it additionally **fails the build** if any
shipped entry is `isDemoOnly`, any shipped entry is not `"publishable"`,
or there are zero publishable non-demo entries.

## Tafsir (scholarly explanation/context)

`src/data/corpus/tafsir/{locale}.json` holds, for every āyah in the
current corpus, a short tafsir (exegesis) entry — shown in the app behind
a "Show tafsir" tap on the āyah detail screen, never inline in the feed.

All entries are **Al-Mukhtasar fi Tafsir al-Qur'an al-Karim**, produced
and reviewed by the Tafsir Center for Quranic Studies (Madinah), fetched
verbatim via `scripts/fetchTafsir.mjs` from `spa5k/tafsir_api`
(github.com/spa5k/tafsir_api), which mirrors the tafsir texts served by
quran.com. Chosen specifically because: (a) it is the one tafsir
available in nearly every language this app supports — see
`tafsirSources` in `src/data/corpus/sources.ts` for the exact edition per
locale — and (b) it is deliberately concise, unlike classical multi-volume
works (Ibn Kathir, al-Tabari, al-Qurtubi — also present in the same API
for Arabic/English, and a reasonable future addition as an optional
"read more" behind a second tap) whose entries run to several paragraphs
and don't fit a mobile context panel.

**No tafsir text is ever generated, paraphrased, or altered by this
codebase or by an AI model** — the same rule this document already
applies to Arabic text and translations, extended to exegesis for the
same reason: misattributing invented words to real scholars would be a
serious integrity failure, not a cosmetic one.

Portuguese, Dutch, and German have no entry (`getTafsir()` returns
`undefined`, the UI shows an explicit "not available in this language"
message) — no tafsir edition exists for those languages in the source
dataset, and this app never silently substitutes another language's
text under the user's own language label.

Like every other corpus asset, this is `technically_checked`
(programmatically fetched, cross-matched against the shipped āyāt, from
a well-established source) and explicitly **not** yet reviewed by a
qualified human for accuracy — the same reviewer checklist above applies
before any of it can be represented as fully vetted.

## Hadith

`src/data/corpus/hadith/` holds a separate corpus of hadith (Prophetic
tradition) text, opt-in via Settings → "What to show" (ayat only by
default, hadith only, or mixed — strictly one hadith then one ayah when
mixed, never a random blend). Shown in its own swipeable feed slide, a
dedicated **"Hadith" menu** (`app/hadith/index.tsx`) that lists all 584
entries filterable by theme and searchable by collection/number, and the
`/hadith/[id]` detail screen; favorited hadith live in AsyncStorage
(`src/storage/hadithFavoritesStore.ts`), separate from the SQLite
favorites table ayat use — deliberately, to avoid touching the schema
and pipeline the notification system depends on while this feature is
still new. Hadith **are** scheduled as notifications under the "hadith
only" and "mixed" modes — see `docs/NOTIFICATIONS.md` "Hadith
notifications".

Only **Sahih al-Bukhari** and **Sahih Muslim** are used — by scholarly
consensus (the "Sahihayn") the two most rigorously authenticated hadith
collections in existence, which is the basis for calling this "the most
reliable" hadith. Text is fetched verbatim via `scripts/buildHadithCorpus.mjs`
from `fawazahmed0/hadith-api` (github.com/fawazahmed0/hadith-api — the
same author/API style as the Quran data already used here). Selection is
MECHANICAL only (length bounds, non-empty across required languages, no
cross-reference stub, deduplicated) — 500 entries, split evenly between
the two collections. No hadith text is ever generated, paraphrased, or
altered by an AI model, for the same reason the Quran text and its tafsir
never are.

**Curated additions (84 entries).** That mechanical selection took a dozen
consecutive hadith numbers from each of twenty evenly spaced ranges —
good for spread, blind to fame — and so skipped nearly every hadith people
actually quote ("Do not become angry", "the strong is the one who
controls himself in anger", "speak good or keep silent", "be in this
world as a stranger", "two blessings many people lose", "Allah does not
look at your faces and wealth but at your hearts and deeds", "charity
does not decrease wealth", "O My servants, I have forbidden oppression
for Myself"…). `scripts/curatedHadithAdditions.mjs` lists those by
number, each located by its distinctive wording in the English edition
and chosen among the collection's own duplicates of the report as the
shortest variant complete in all four required languages; reports whose
only version is embedded in a long story, or that need historical context
to read fairly on a lock screen, were left out, and reports already in
the corpus under another number were not duplicated.
`node scripts/extendHadithCorpus.mjs` fetches them verbatim from the same
editions and appends them; it refuses any id not complete in Arabic,
English, French and Bengali.

**Theme tags** (powering the "Hadith" menu's theme filter) are assigned by
the same MECHANICAL keyword-matching approach `scripts/buildFullCorpus.mjs`
uses for ayat, but against `HADITH_THEME_KEYS` (`src/domain/types.ts`) — a
deliberately reduced, 12-entry subset of the full 23-key `ThemeKey`
taxonomy, curated to match the familiar, popular topical categories a
hadith collection is traditionally organized by (intentions/good deeds,
prayer, family ties, charity, knowledge, patience, mercy, forgiveness,
humility, brotherhood, justice, remembrance) rather than the broader
emotional range built for standalone Quranic āyāt. Every one of these 12
keys is a `ThemeKey` value that already has a reviewed translation in all
12 locales, so no separate hadith-only vocabulary or new translations were
needed. This is explicitly a topic hint, not a religious classification —
about 60% of the entries don't match a specific keyword list and fall
back to the "good_deeds" category (a real, intentional catch-all, not a
bug). `scripts/retagHadithThemes.mjs` re-tags the already-fetched
entries against this list without a network re-fetch; the keyword map
itself lives once in `scripts/hadithThemes.mjs`, shared by the build,
retag and extend scripts. Like every
other mechanically assigned theme in this app, these are a starting point
for the human reviewer checklist below, not a finished classification.

**Only 5 of the app's 12 languages have any hadith coverage in the
source dataset**: Arabic, English, French, Bengali, and (noticeably less
complete — roughly two-thirds) Russian. Spanish, Portuguese, Hindi,
Italian, Chinese, Dutch, and German have none at all — a real, current
limitation, not an oversight. The feed and Settings degrade gracefully
for those languages: hadith modes silently fall back to ayah-only with
an explicit on-screen notice, never a broken or empty card.

**No hadith explanation/commentary (sharh) is shown yet.** The "Show
explanation" button on the hadith detail screen exists as UI scaffolding
for future real data, but currently always reports "no verified source
available" — no attempt was made to generate, guess, or approximate a
scholarly explanation, the same discipline `docs/CORPUS.md`'s tafsir
section applies to ayat.

Like every other corpus asset, hadith entries are `technically_verified`
only, pending the same qualified-human reviewer checklist above before
any of it can be considered `publishable`.

## Full Qur'an reader

`src/data/quran/` holds the **complete** Qur'an — all 114 surahs, all 6236
āyāt — powering the "Read the Qur'an" screen (`app/quran/index.tsx`, a
searchable surah list, and `app/quran/[surah].tsx`, the continuous reading
view for one surah). This is a **separate dataset from `src/data/corpus/`**,
the curated 300-āyah set used for notifications — nothing in `src/data/quran/`
feeds the notification/selection engine, and nothing in the curated corpus
is duplicated here. Built by `scripts/buildQuranReaderData.mjs` from the
exact same sources as `scripts/buildFullCorpus.mjs` (King Fahd Complex
Uthmani text and the same eleven translation editions, via
`fawazahmed0/quran-api`) — same translators, same license terms, same
`TranslationSourceInfo` registry in `src/data/corpus/sources.ts` — just
without the mechanical standalone-suitability filter or the curation
downselection, because a reader that skips most of the Qur'an isn't a
reader. Arabic readers use the Arabic text itself, same as everywhere else
in this app.

Any āyah, whether or not it's in the curated 300, resolves through
`useAyahView()` (it falls back to this full dataset when the curated
corpus doesn't have an entry) — so favoriting, sharing, copying, and
viewing history all work uniformly for every āyah in the Qur'an, not just
the curated set. Tapping an āyah's number in the reader opens the same
`/ayah/[id]` detail screen used everywhere else; tafsir there gracefully
shows "not available" for the 5,900+ āyāt outside the curated set, exactly
like it already does for any language gap — never a crash, never a
misleading fallback.

**Pointing from any āyah back into the reader**: the āyah detail screen has
an "Open in the full Qur'an" action that opens `/quran/[surah]?ayah=[n]`,
which scrolls to and highlights that exact āyah — the round trip the
feature exists for (find an āyah in a notification, a favorite, or "a
moment for you", then locate it in its full surah context).

Like every other corpus asset, this text is `technically_verified` (fetched
verbatim, structurally validated — `scripts/buildQuranReaderData.mjs`
refuses to write anything short of the full 6236 āyāt per language) but not
yet reviewed character-by-character by a qualified human — the same
reviewer checklist above applies before it can be considered fully vetted,
even though "curation" in the editorial-whitelist sense doesn't apply here:
this is the complete text in its own surah context, not an extracted
standalone excerpt.

## Adding real corpus data

1. Obtain the Arabic text from a source whose license explicitly permits
   redistribution in a mobile app (Tanzil is the recommended default —
   confirm its current license terms directly, since this session could
   not verify them live).
2. Replace/extend `src/data/corpus/arabic.json` with verified text,
   following the existing shape (`ArabicAyahText` in `src/domain/types.ts`).
3. Add matching `CatalogEntry` rows to `catalog.json`, `status: "draft"`
   initially.
4. Run a qualified person through the reviewer checklist above for each
   entry, updating `status` as it progresses.
5. Import translations per `docs/TRANSLATIONS.md`.
6. Run `npm run corpus:validate:prod` — it must pass with zero errors
   before a production build.
