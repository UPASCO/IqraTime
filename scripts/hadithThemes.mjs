/**
 * Mechanical theme tagging for hadith, shared by scripts/buildHadithCorpus.mjs,
 * scripts/retagHadithThemes.mjs and scripts/extendHadithCorpus.mjs so every
 * hadith entry — original or curated addition — is tagged by exactly the
 * same rule.
 *
 * Keyword matching on the English translation against HADITH_THEME_KEYS
 * (src/domain/types.ts) — the reduced, classic-hadith subset of the ayah
 * theme taxonomy. A topic hint for the "browse hadith by theme" screen,
 * never a religious classification (docs/CORPUS.md "Hadith"). Up to three
 * themes; "good_deeds" is the deliberate catch-all.
 */
export const HADITH_THEME_KEYWORDS = {
  good_deeds: ["good deed", "righteous", "best of you", "best deed", "reward", "honest", "trustworthy", "intention", "actions are"],
  prayer: ["prayer", "pray", "salat", "prostrat", "mosque", "wudu", "ablution", "straighten your row"],
  family: ["parents", "mother", "father", "wife", "wives", "husband", "children", "kinship", "relatives"],
  generosity: ["charity", "sadaqah", "zakat", "spend", "feed", "orphan", "needy", "poor"],
  knowledge: ["knowledge", "learn", "teach", "scholar", "seek knowledge"],
  patience: ["patien", "persever", "steadfast", "endure"],
  mercy: ["merciful", "mercy", "compassion", "kind to"],
  forgiveness: ["forgiv", "pardon", "overlook", "repent", "seek forgiveness"],
  humility: ["humble", "humility", "arrogan", "proud", "haughty"],
  brotherhood: ["brother", "brotherhood", "muslim is the brother", "reconcil", "each other", "neighbour", "neighbor"],
  justice: ["justice", "just", "oppress", "wrong", "fair", "usury", "riba"],
  remembrance: ["remember", "remembrance", "dhikr", "glorify", "praise"],
};

/** Up to three HADITH_THEME_KEYS values for one hadith, from its English translation. */
export function hadithThemesFor(en) {
  const lower = en.toLowerCase();
  const hits = [];
  for (const [theme, words] of Object.entries(HADITH_THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) hits.push(theme);
  }
  if (hits.length === 0) return ["good_deeds"];
  return hits.slice(0, 3);
}
