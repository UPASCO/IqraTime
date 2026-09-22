/**
 * Guards the invariant behind the "translation doesn't match the hadith"
 * bug report (build 36, muslim:5949): every hadith the app can show must
 * (a) pair its Arabic and its translations strictly by id, with no gaps
 * in the required languages, and (b) be a STANDALONE report — never one
 * of Sahih Muslim's chain-of-transmission variant notes ("This hadith has
 * been narrated ... with the same chain of transmitters", "the rest of
 * the hadith is the same", ...), which reference the collection's
 * preceding entry and therefore read as a mismatched translation when
 * shown alone on a card.
 *
 * The pattern list is an independent mirror of
 * scripts/hadithFragmentPatterns.mjs (kept separate on purpose: if the
 * build-time copy drifts and lets a fragment into the shipped JSON, this
 * copy still fails the build).
 */
import { getFullHadithCorpus, getHadithTranslation } from "@/data/corpus/hadith";

import arabicData from "@/data/corpus/hadith/arabic.json";
import enData from "@/data/corpus/hadith/translations/en.json";
import frData from "@/data/corpus/hadith/translations/fr.json";
import bnData from "@/data/corpus/hadith/translations/bn.json";
import ruData from "@/data/corpus/hadith/translations/ru.json";

interface TranslationFile {
  entries: readonly { id: string; text: string }[];
}

const arabicEntries = (arabicData as { entries: readonly { id: string; text: string }[] }).entries;
const arabicIds = arabicEntries.map((e) => e.id);

const REFERENCE_ONLY_PATTERNS = [
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

/** Human-reviewed complete reports whose variant note is only a trailing remark — see scripts/hadithFragmentPatterns.mjs. */
const SELF_CONTAINED_EXCEPTIONS = new Set([
  "muslim:2244",
  "muslim:2255",
  "muslim:2629",
  "muslim:3373",
  "muslim:4884",
  "muslim:5246",
  "muslim:5604",
]);

describe("hadith corpus integrity (Arabic <-> translation pairing)", () => {
  it("has unique ids and an id that always encodes its own collection and number", () => {
    expect(new Set(arabicIds).size).toBe(arabicIds.length);
    for (const entry of arabicEntries) {
      const [collection, number] = entry.id.split(":");
      expect(["bukhari", "muslim"]).toContain(collection);
      expect(Number(number)).toBeGreaterThan(0);
    }
  });

  it.each([
    ["en", enData as TranslationFile],
    ["fr", frData as TranslationFile],
    ["bn", bnData as TranslationFile],
  ])("%s translation file covers exactly the Arabic ids, every text non-empty", (_locale, file) => {
    expect(file.entries.map((e) => e.id)).toEqual(arabicIds);
    for (const entry of file.entries) {
      expect(entry.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("ru translation file (known-incomplete edition) only ever contains Arabic ids, every text non-empty", () => {
    const idSet = new Set(arabicIds);
    for (const entry of (ruData as TranslationFile).entries) {
      expect(idSet.has(entry.id)).toBe(true);
      expect(entry.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves translations strictly by id through the app's own lookup", () => {
    for (const entry of getFullHadithCorpus()) {
      const en = getHadithTranslation(entry.arabic.id, "en");
      expect(en?.id).toBe(entry.arabic.id);
      expect(getHadithTranslation(entry.arabic.id, "fr")?.id).toBe(entry.arabic.id);
    }
  });

  it("contains no reference-only chain-variant entries (the muslim:5949 bug class)", () => {
    const enById = new Map((enData as TranslationFile).entries.map((e) => [e.id, e.text]));
    const offenders: string[] = [];
    for (const id of arabicIds) {
      if (SELF_CONTAINED_EXCEPTIONS.has(id)) continue;
      const text = enById.get(id) ?? "";
      if (REFERENCE_ONLY_PATTERNS.some((p) => p.test(text))) offenders.push(id);
    }
    expect(offenders).toEqual([]);
  });

  it("every whitelisted exception is still present and still a complete report by eye-anchor", () => {
    // Each exception was kept because its full matn is present; anchor one
    // distinctive phrase of that matn so a future regeneration that swaps
    // the text out silently would fail here.
    const enById = new Map((enData as TranslationFile).entries.map((e) => [e.id, e.text]));
    const anchors: Record<string, RegExp> = {
      "muslim:2244": /image without obliterating/i,
      "muslim:2255": /abode of a people who are believers/i,
      "muslim:2629": /concession from Allah/i,
      "muslim:3373": /Uhud is a mountain which loves us/i,
      "muslim:4884": /blots out everything except debt/i,
      "muslim:5246": /Cover vessels/i,
      "muslim:5604": /Jamila/i,
    };
    for (const [id, anchor] of Object.entries(anchors)) {
      const text = enById.get(id);
      expect(text).toBeDefined();
      expect(text).toMatch(anchor);
    }
  });
});
