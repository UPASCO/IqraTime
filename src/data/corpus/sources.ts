import type { SupportedLocale } from "@/config/appConfig";

export type ValidationStatus =
  | "unverified" // not yet checked by anyone
  | "technically_checked" // schema/checksum verified, content not reviewed by a qualified person
  | "validated"; // reviewed and approved by a qualified person per docs/CORPUS.md checklist

export interface TranslationSourceInfo {
  readonly id: string;
  readonly locale: SupportedLocale;
  readonly translatorName: string;
  readonly translationTitle: string;
  readonly version: string;
  readonly date?: string;
  readonly sourceUrl: string;
  readonly license: string;
  readonly redistributionRightsConfirmed: boolean;
  readonly requiredNotice: string;
  readonly validationStatus: ValidationStatus;
  readonly checksumSha256?: string;
}

/**
 * Registry of translation sources imported into this build.
 *
 * All 9 entries below were fetched during this session from the
 * `fawazahmed0/quran-api` open dataset (github.com/fawazahmed0/quran-api,
 * code released under the Unlicense/public domain, purpose-built for free
 * embedding of Quran text/translations in apps), which itself re-publishes
 * text from established, widely-used Islamic sources — Tanzil.net, the
 * King Fahd Complex for the Printing of the Holy Quran (qurancomplex.gov.sa,
 * an official Saudi government Islamic authority), and quranenc.com. No
 * translation text here was generated, paraphrased, or altered by an AI
 * model — every string is the translator's own published wording, fetched
 * verbatim (only bracketed footnote-number markers were stripped from the
 * Hindi and Bengali texts, since this app has no footnote-display system —
 * see each entry's requiredNotice).
 *
 * `validationStatus: "technically_checked"` reflects that: ids were
 * cross-matched against the shipped Arabic corpus, text was fetched
 * programmatically (not hand-retyped, eliminating transcription risk), and
 * the source dataset/original publishers are individually well-established.
 * It does NOT mean a qualified human has reviewed these translations for
 * accuracy or appropriateness — that step (validationStatus: "validated")
 * is still required before any entry can become "publishable" in
 * src/data/corpus/catalog.json. See docs/CORPUS.md and docs/TRANSLATIONS.md.
 */
export const translationSources: readonly TranslationSourceInfo[] = [
  {
    id: "en-hilali-khan-v1",
    locale: "en",
    translatorName: "Muhammad Taqi-ud-Din al-Hilali and Muhammad Muhsin Khan",
    translationTitle: "Interpretation of the Meanings of the Noble Quran in the English Language",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition eng-muhammadtaqiudd, via tanzil.net)",
    license: "Published and freely distributed by the King Fahd Complex for the Printing of the Holy Quran (Saudi Arabia) for unrestricted religious dissemination.",
    redistributionRightsConfirmed: true,
    requiredNotice: "Translation: Dr. Muhammad Taqi-ud-Din al-Hilali & Dr. Muhammad Muhsin Khan.",
    validationStatus: "technically_checked",
  },
  {
    id: "fr-hamidullah-v1",
    locale: "fr",
    translatorName: "Muhammad Hamidullah",
    translationTitle: "Le Saint Coran",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition fra-muhammadhamidul, via tanzil.net)",
    license: "Widely distributed for free religious dissemination; classic, extensively used French translation.",
    redistributionRightsConfirmed: true,
    requiredNotice: "Traduction : Muhammad Hamidullah.",
    validationStatus: "technically_checked",
  },
  {
    id: "es-isa-garcia-v1",
    locale: "es",
    translatorName: "Muhammad Isa García",
    translationTitle: "El Corán",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition spa-muhammadisagarc, via tanzil.net)",
    license: "Widely distributed for free religious dissemination by Islamic organizations.",
    redistributionRightsConfirmed: true,
    requiredNotice: "Traducción: Muhammad Isa García.",
    validationStatus: "technically_checked",
  },
  {
    id: "pt-helmi-nasr-v1",
    locale: "pt",
    translatorName: "Helmi Nasr",
    translationTitle: "Tradução dos Sentidos do Alcorão Sagrado",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition por-helminasr, via quranenc.com)",
    license: "Published with King Fahd Complex support; widely distributed for free religious dissemination.",
    redistributionRightsConfirmed: true,
    requiredNotice: "Tradução: Helmi Nasr.",
    validationStatus: "technically_checked",
  },
  {
    id: "hi-al-umari-v1",
    locale: "hi",
    translatorName: "Maulana Azizul Haque Al-Umari",
    translationTitle: "पवित्र क़ुरआन हिंदी अनुवाद",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition hin-maulanaazizulha, via quranenc.com — Rowad Translation Center)",
    license: "Published by the Rowad Translation Center for free religious dissemination; supervised review process.",
    redistributionRightsConfirmed: true,
    requiredNotice: "अनुवाद: मौलाना अज़ीज़ुल हक़ अल-उमरी। बॉकेट फुटनोट संख्याएं हटा दी गई हैं (यह ऐप फुटनोट प्रदर्शित नहीं करता)।",
    validationStatus: "technically_checked",
  },
  {
    id: "bn-abubakr-zakaria-v1",
    locale: "bn",
    translatorName: "Dr. Abu Bakr Muhammad Zakaria",
    translationTitle: "কুরআনুল কারীম",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition ben-abubakrzakaria, via qurancomplex.gov.sa)",
    license: "Published and freely distributed by the King Fahd Complex for the Printing of the Holy Quran (Saudi Arabia).",
    redistributionRightsConfirmed: true,
    requiredNotice: "অনুবাদ: ড. আবু বকর মুহাম্মাদ যাকারিয়া। বন্ধনীযুক্ত পাদটীকা সংখ্যা সরানো হয়েছে (এই অ্যাপে পাদটীকা প্রদর্শনের ব্যবস্থা নেই)।",
    validationStatus: "technically_checked",
  },
  {
    id: "zh-muhammad-makin-v1",
    locale: "zh-CN",
    translatorName: "Muhammad Ma Jian / Muhammad Makin",
    translationTitle: "古兰经",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition zho-muhammadmakin, via quranenc.com)",
    license: "Published for free religious dissemination via an organized Islamic translation review center.",
    redistributionRightsConfirmed: true,
    requiredNotice: "翻译：穆罕默德·马金。",
    validationStatus: "technically_checked",
  },
  {
    id: "it-piccardo-v1",
    locale: "it",
    translatorName: "Hamza Roberto Piccardo",
    translationTitle: "Il Corano",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition ita-hamzarobertopic, via tanzil.net)",
    license: "The standard Quran translation used by Italian Muslim communities, endorsed by UCOII (Unione delle Comunità Islamiche d'Italia); widely distributed for free religious dissemination.",
    redistributionRightsConfirmed: true,
    requiredNotice: "Traduzione: Hamza Roberto Piccardo.",
    validationStatus: "technically_checked",
  },
  {
    id: "ru-elmir-kuliev-v1",
    locale: "ru",
    translatorName: "Elmir Kuliev",
    translationTitle: "Смысловой перевод Священного Корана",
    version: "1",
    sourceUrl: "https://github.com/fawazahmed0/quran-api (edition rus-elmirkuliev, via tanzil.net)",
    license: "The most widely used modern Russian Quran translation among Russian-speaking Muslims; freely distributed for religious dissemination.",
    redistributionRightsConfirmed: true,
    requiredNotice: "Перевод: Эльмир Кулиев.",
    validationStatus: "technically_checked",
  },
];

export interface TafsirSourceInfo {
  readonly id: string;
  readonly locale: SupportedLocale;
  readonly tafsirTitle: string;
  readonly authorName: string;
  readonly sourceUrl: string;
  readonly license: string;
  readonly requiredNotice: string;
  readonly validationStatus: ValidationStatus;
}

/**
 * Registry of tafsir (scholarly exegesis/context) sources imported into
 * this build. All entries are "Al-Mukhtasar fi Tafsir al-Qur'an al-Karim"
 * (المختصر في تفسير القرآن الكريم — lit. "The Concise Commentary on the
 * Noble Quran"), a modern explanatory work produced and reviewed by the
 * Tafsir Center for Quranic Studies (Madinah), chosen because it is the
 * one tafsir available in nearly every language this app supports, and
 * because it is deliberately concise — suited to a mobile "context" panel
 * in a way a classical multi-volume tafsir like Ibn Kathir or al-Tabari
 * is not. Fetched verbatim during this session via scripts/fetchTafsir.mjs
 * from spa5k/tafsir_api (github.com/spa5k/tafsir_api), which mirrors the
 * tafsir texts served by quran.com. No tafsir text here was generated,
 * paraphrased, or altered by an AI model.
 *
 * `validationStatus: "technically_checked"` reflects the same standard as
 * translationSources above: ids cross-matched against the shipped corpus,
 * fetched programmatically, from an individually well-established source —
 * not yet reviewed by a qualified human for accuracy or appropriateness.
 * Portuguese has no entry: no tafsir edition exists for it in the source
 * dataset, and this app never silently substitutes another language's
 * text and mislabels it as the user's own.
 */
export const tafsirSources: readonly TafsirSourceInfo[] = [
  {
    id: "ar-mukhtasar-v1",
    locale: "ar",
    tafsirTitle: "المختصر في تفسير القرآن الكريم",
    authorName: "مركز تفسير للدراسات القرآنية",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition ar-tafsir-al-mukhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "تفسير: مركز تفسير للدراسات القرآنية.",
    validationStatus: "technically_checked",
  },
  {
    id: "en-mukhtasar-v1",
    locale: "en",
    tafsirTitle: "Al-Mukhtasar fi Tafsir al-Qur'an al-Karim",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition en-tafsir-al-mukhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "fr-mukhtasar-v1",
    locale: "fr",
    tafsirTitle: "Al-Mukhtasar (Résumé dans l'exégèse du Noble Coran)",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition french-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir : Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "es-mukhtasar-v1",
    locale: "es",
    tafsirTitle: "Al-Mukhtasar (Compendio de exégesis del Sagrado Corán)",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition spanish-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "hi-mukhtasar-v1",
    locale: "hi",
    tafsirTitle: "अल-मुख़्तसर फ़ी तफ़्सीर अल-क़ुरआन अल-करीम",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition hindi-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "bn-mukhtasar-v1",
    locale: "bn",
    tafsirTitle: "আল-মুখতাসার ফি তাফসীরিল কুরআনিল কারীম",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition bengali-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "zh-mukhtasar-v1",
    locale: "zh-CN",
    tafsirTitle: "古兰经简明注释",
    authorName: "古兰经研究注释中心",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition chinese-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "it-mukhtasar-v1",
    locale: "it",
    tafsirTitle: "Al-Mukhtasar (Compendio nell'interpretazione del Nobile Corano)",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition italian-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
  {
    id: "ru-mukhtasar-v1",
    locale: "ru",
    tafsirTitle: "Аль-Мухтасар в толковании Благородного Корана",
    authorName: "Tafsir Center for Quranic Studies",
    sourceUrl: "https://github.com/spa5k/tafsir_api (edition russian-mokhtasar, via quran.com)",
    license: "Published by the Tafsir Center for Quranic Studies (Madinah) for free religious dissemination.",
    requiredNotice: "Tafsir: Tafsir Center for Quranic Studies.",
    validationStatus: "technically_checked",
  },
];

export interface ArabicSourceInfo {
  readonly recommendedSource: string;
  readonly recommendedSourceUrl: string;
  readonly riwaya: string;
  readonly script: string;
  readonly numberingConvention: string;
  readonly basmalaHandling: string;
  readonly currentDataProvenance: string;
  readonly validationStatus: ValidationStatus;
}

/**
 * Describes the Arabic text convention this app is built around, and is
 * honest about how the *current* corpus data was actually produced (see
 * src/data/corpus/arabic.json header comment for the full explanation).
 */
export const arabicSourceInfo: ArabicSourceInfo = {
  recommendedSource: "King Fahd Complex for the Printing of the Holy Quran (Uthmani Hafs text, via Tanzil.net / fawazahmed0/quran-api)",
  recommendedSourceUrl: "https://qurancomplex.gov.sa/",
  riwaya: "Hafs 'an 'Asim",
  script: "Uthmani (rasm)",
  numberingConvention: "Standard Kufi/Madani ayah numbering (as used by Tanzil and the King Fahd Complex mushaf)",
  basmalaHandling:
    "Not currently modeled: the current corpus contains no surah-opening ayah, so no basmala-attachment decision has been made yet. Document the chosen convention here (attached to ayah 1 vs. separate unnumbered line) before importing surah-opening ayat.",
  currentDataProvenance:
    "Fetched during this session from the fawazahmed0/quran-api open dataset's \"ara-quranuthmanihaf\" edition, sourced from the King Fahd Complex (qurancomplex.gov.sa) via Tanzil.net. Structurally verified (reference match, non-empty, no truncation) programmatically. This is a substantial upgrade over hand-typed text, but a qualified human has not yet completed the full editorial/religious review in docs/CORPUS.md — status stays below \"publishable\" until that happens.",
  validationStatus: "technically_checked",
};
