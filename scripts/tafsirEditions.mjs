/**
 * The tafsir edition fetched per locale, shared by scripts/fetchTafsir.mjs
 * (full refetch for every āyah in the corpus) and scripts/extendCorpus.mjs
 * (fetches only the surahs of newly added āyāt). Every locale is the same
 * work — Al-Mukhtasar fi Tafsir al-Qur'an al-Karim — see fetchTafsir.mjs
 * for why that one, and docs/CORPUS.md "Tafsir". Portuguese, Dutch and
 * German have no edition in the source dataset and are deliberately absent.
 */
export const TAFSIR_BASE_URL = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";

export const TAFSIR_EDITIONS = {
  ar: { slug: "ar-tafsir-al-mukhtasar", sourceId: "ar-mukhtasar-v1" },
  en: { slug: "en-tafsir-al-mukhtasar", sourceId: "en-mukhtasar-v1" },
  fr: { slug: "french-mokhtasar", sourceId: "fr-mukhtasar-v1" },
  es: { slug: "spanish-mokhtasar", sourceId: "es-mukhtasar-v1" },
  hi: { slug: "hindi-mokhtasar", sourceId: "hi-mukhtasar-v1" },
  bn: { slug: "bengali-mokhtasar", sourceId: "bn-mukhtasar-v1" },
  "zh-CN": { slug: "chinese-mokhtasar", sourceId: "zh-mukhtasar-v1" },
  it: { slug: "italian-mokhtasar", sourceId: "it-mukhtasar-v1" },
  ru: { slug: "russian-mokhtasar", sourceId: "ru-mukhtasar-v1" },
};
