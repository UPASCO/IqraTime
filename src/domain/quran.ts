import type { AyahId } from "./types";

/** Well-established, non-editorial classification — not a religious judgement call. */
export type RevelationPlace = "mecca" | "medina";

export interface SurahMeta {
  readonly number: number; // 1-114
  readonly nameArabic: string;
  readonly nameTransliterated: string;
  readonly ayahCount: number;
  readonly revelationPlace: RevelationPlace;
}

export interface QuranAyahText {
  readonly id: AyahId;
  readonly surah: number;
  readonly ayah: number;
  readonly text: string;
}
