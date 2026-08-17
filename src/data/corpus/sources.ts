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
 * Registry of translation sources actually imported into this build.
 *
 * EMPTY BY DESIGN: this repository ships no translation text for any of
 * the ten supported languages (see docs/TRANSLATIONS.md for why — in
 * short, generating translation text with an AI model is explicitly
 * prohibited by the product spec, and this development session had no
 * network access to fetch and verify a real licensed corpus).
 *
 * Use scripts/importTranslation.ts to add a real, licensed translation
 * file; the importer requires every field below to be filled in before it
 * will accept the file, and appends the resulting entry to this array.
 */
export const translationSources: readonly TranslationSourceInfo[] = [];

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
 * honest about how the *current* sample data was actually produced (see
 * src/data/corpus/arabic.json header comment for the full explanation).
 */
export const arabicSourceInfo: ArabicSourceInfo = {
  recommendedSource: "Tanzil Project — Uthmani Quran text",
  recommendedSourceUrl: "https://tanzil.net/download/",
  riwaya: "Hafs 'an 'Asim",
  script: "Uthmani (rasm)",
  numberingConvention: "Standard Kufi/Madani ayah numbering (as used by Tanzil and the King Fahd Complex mushaf)",
  basmalaHandling:
    "Not currently modeled: the sample corpus contains no surah-opening ayah, so no basmala-attachment decision has been made yet. Document the chosen convention here (attached to ayah 1 vs. separate unnumbered line) before importing surah-opening ayat.",
  currentDataProvenance:
    "UNVERIFIED DEMO DATA. Entered from the assistant's training-time knowledge during a development session with no network access to Tanzil or any canonical digital mushaf. Every entry requires character-by-character verification against the recommended source before production use.",
  validationStatus: "unverified",
};
