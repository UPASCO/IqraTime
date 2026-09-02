/**
 * Mechanical theme tagging for āyāt, shared by scripts/buildFullCorpus.mjs
 * (the original 300-entry build) and scripts/extendCorpus.mjs (the curated
 * additions), so both tag by exactly the same rule and the catalog stays
 * internally consistent.
 *
 * Keyword matching on the English translation. Deliberately coarse: theme
 * tags are explicitly part of what a human reviewer must verify (see
 * docs/CORPUS.md, reviewer checklist item 5). Capped at three themes so
 * theme filtering stays meaningful rather than matching everything;
 * "guidance" is the catch-all when nothing matches.
 */
export const AYAH_THEME_KEYWORDS = {
  patience: ["patien", "persever", "steadfast", "endure", "bear with"],
  gratitude: ["grateful", "gratitude", "thank", "bounty", "favour", "favor", "blessing"],
  hope: ["hope", "glad tidings", "good news", "ease", "relief", "despair not", "do not despair"],
  mercy: ["merciful", "mercy", "compassion", "kind"],
  trust_in_god: ["rely upon", "reliance", "trust in allah", "sufficient for us", "put their trust", "disposer of affairs"],
  prayer: ["prayer", "salat", "prostrat", "bow down", "worship him", "establish the"],
  wisdom: ["wisdom", "wise", "understand", "ponder", "reflect", "reason"],
  forgiveness: ["forgiv", "pardon", "overlook", "absolve"],
  generosity: ["spend", "charity", "zakat", "give of", "feed the", "orphan", "needy", "poor"],
  courage: ["fear not", "do not fear", "grieve not", "be not afraid", "strive", "fight in the"],
  humility: ["humble", "humility", "arrogan", "boast", "proud", "haughty"],
  family: ["parents", "mother", "father", "wives", "spouse", "children", "kindred", "relatives"],
  trials: ["test", "trial", "afflict", "hardship", "calamity", "difficulty", "suffer"],
  inner_peace: ["tranquil", "peace", "hearts find rest", "at rest", "serenity", "content"],
  remembrance: ["remember", "remembrance", "mention of allah", "glorify", "praise"],
  protection: ["protect", "guard", "refuge", "shelter", "defend", "preserve"],
  knowledge: ["knowledge", "know", "learn", "teach", "taught", "scholars", "read"],
  good_deeds: ["righteous deed", "good deed", "do good", "does good", "best of deeds", "reward"],
  repentance: ["repent", "turn to allah", "turn in repentance", "seek forgiveness"],
  justice: ["justice", "just", "equit", "oppress", "wrong", "fair", "balance", "witness"],
  brotherhood: ["brother", "believers are", "hold fast", "unity", "reconcil", "each other"],
  creation: ["created", "creation", "heavens and the earth", "sky", "earth", "rain", "sun", "moon", "stars", "night and day"],
  guidance: ["guid", "straight path", "right path", "misguid", "astray", "light"],
};

/** Up to three ThemeKey values for one āyah, from its English translation. */
export function ayahThemesFor(en) {
  const lower = en.toLowerCase();
  const hits = [];
  for (const [theme, words] of Object.entries(AYAH_THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) hits.push(theme);
  }
  if (hits.length === 0) return ["guidance"];
  return hits.slice(0, 3);
}
