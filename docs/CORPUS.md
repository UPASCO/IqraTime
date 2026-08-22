# Corpus

## Current status: real content, not yet human-reviewed

`src/data/corpus/arabic.json` ships **300 āyāt**, fetched verbatim from
the King Fahd Complex Uthmani edition and curated down to a set a
knowledgeable Muslim would recognise as significant on sight (see
"Curated downselection" in `scripts/buildFullCorpus.mjs`) — not
hand-typed, not a placeholder sample. 11 of the app's 12 supported
languages have a real, licensed Quran translation for every one of those
āyāt (Arabic readers use the Arabic text itself, no translation needed).
Every entry is still marked `status: "technically_verified"`, never
`"publishable"`: `npm run corpus:validate:prod` fails the build until a
qualified human completes the reviewer checklist below, on purpose.

## Convention

| | |
|---|---|
| Riwaya (reading) | Hafs 'an 'Asim |
| Script | Uthmani (rasm) |
| Numbering | Standard Kufi/Madani ayah numbering (Tanzil / King Fahd Complex convention) |
| Basmala handling | **Not yet decided** — the sample corpus contains no surah-opening ayah, so no attachment convention has been chosen. Must be documented here before importing any surah's first ayah. |
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
Every entry therefore stays `status: "technically_verified"`, never
`"publishable"`, until a qualified person completes the reviewer
checklist below. This is the intended gate, not a bug: build the full
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
mixed, never a random blend). Shown in its own swipeable feed slide and
`/hadith/[id]` detail screen; favorited hadith live in AsyncStorage
(`src/storage/hadithFavoritesStore.ts`), separate from the SQLite
favorites table ayat use — deliberately, to avoid touching the schema
and pipeline the notification system depends on while this feature is
still new. **Hadith is not yet wired into scheduled notifications** —
only ayat are, for now.

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
