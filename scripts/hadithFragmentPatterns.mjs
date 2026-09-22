/**
 * Detection of "reference-only" hadith entries — chain-of-transmission
 * variant notes (mutāba'āt) that Sahih Muslim in particular records as
 * numbered entries, whose text does not contain a standalone report but
 * points at the PRECEDING hadith of the collection: "This hadith has been
 * narrated ... with the same chain of transmitters", "A hadith like this
 * ...", "the rest of the hadith is the same", and so on.
 *
 * Shown alone on a feed card or a notification, such an entry is
 * meaningless — the reader sees a translation that talks about "the same
 * chain" of a hadith the app never showed them, which reads exactly like a
 * mismatched translation (reported against muslim:5949 in build 36). They
 * are therefore excluded from the corpus entirely: exclusion is a
 * SELECTION decision, the same category as the existing "(see Hadith)"
 * cross-reference-stub rule — no text is ever altered.
 *
 * The patterns run against the ENGLISH translation (the most complete
 * edition, and the one the original mechanical selection was based on).
 * They are deliberately broad; an entry that matches but was human-reviewed
 * as carrying its complete report anyway (the variant note is only a
 * trailing remark) is whitelisted in SELF_CONTAINED_EXCEPTIONS.
 *
 * Shared by scripts/buildHadithCorpus.mjs, scripts/extendHadithCorpus.mjs,
 * scripts/pruneHadithChainVariants.mjs and mirrored by
 * tests/unit/hadithCorpusIntegrity.test.ts.
 */
export const REFERENCE_ONLY_PATTERNS = [
  /^(this|the above|the same) hadith\b/i,
  /^a (hadith|tradition) like (this|it)\b/i,
  /^it is through another chain/i,
  /^this tradition has been narrated/i,
  /^the same hadith is mentioned/i,
  /^another version of the tradition/i,
  /the rest of the (hadith|tradition|report) is the same/i,
  /with the same chain of (transmitters|narrators)/i,
  /same chain of tr[az]nsmitters/i,
  /by the same chain/i,
  /through (another|a different) chain/i,
  /by another chain/i,
  /with another chain/i,
  /likewise narrated/i,
  /combining the two chains/i,
  /like this except/i,
  /saying like this/i,
  /except \(?this (variation|difference)/i,
  /(he |and )?made no mention/i,
  /there is no mention/i,
  /did not mention/i,
  /no mention (of|has been made)/i,
  /a similar (hadith|report|tradition)/i,
  /the same as (narrated|reported|transmitted) by/i,
  /but for these words/i,
  /up to the words/i,
  /but with (a slight|this|some)/i,
  /with a slight (variation|change)/i,
];

/**
 * Entries that match a pattern above but were individually reviewed
 * (2026-09-22) and found to carry their COMPLETE report — the matched
 * phrase is only a trailing narrator's remark after a self-contained matn.
 */
export const SELF_CONTAINED_EXCEPTIONS = new Set([
  "muslim:2244", // 'Ali's full instruction (obliterate images, level graves) precedes the chain note
  "muslim:2255", // the complete du'a at al-Baqi'; "Qutaiba did not mention..." is a trailing remark
  "muslim:2629", // full fasting-on-a-journey exchange; Harun's variant note trails it
  "muslim:3373", // the complete "Uhud loves us and we love it" wording is quoted in full
  "muslim:4884", // the full matn ("Death in the way of Allah blots out everything except debt") is present
  "muslim:5246", // the complete cover-the-vessels instruction; Qutaiba note trails it
  "muslim:5604", // the complete renaming of 'Asiya to Jamila; Ahmad's wording note trails it
]);

/** True when this English text is a standalone report a reader can understand alone. */
export function isStandaloneReport(id, enText) {
  if (SELF_CONTAINED_EXCEPTIONS.has(id)) return true;
  return !REFERENCE_ONLY_PATTERNS.some((p) => p.test(enText));
}
