import namesData from "./names.json";

/**
 * The 99 Names of Allah (Asma ul-Husna), in the canonical (Tirmidhi) order.
 * Arabic and English meanings verbatim from the MIT-licensed imanikurd
 * dataset, cross-validated at build time; transliterations and French
 * renderings are editorial — see scripts/fetchNamesAndDuas.mjs and the
 * generated file's _readme for the full provenance note.
 */
export interface NameOfAllah {
  readonly number: number;
  readonly arabic: string;
  readonly transliteration: string;
  readonly meaning: { readonly en: string; readonly fr: string };
}

const entries = namesData.entries as readonly NameOfAllah[];
const byNumber = new Map(entries.map((entry) => [entry.number, entry]));

export function getAllNames(): readonly NameOfAllah[] {
  return entries;
}

export function getName(number: number): NameOfAllah | undefined {
  return byNumber.get(number);
}

/**
 * The meaning in the reader's display language. Only English and French
 * renderings exist (see the dataset's provenance note); every other locale
 * reads the English gloss — a deliberate, visible fallback (a one-line
 * meaning is a gloss, not scripture), never a silent substitution of one
 * translated scripture text for another.
 */
export function nameMeaningFor(name: NameOfAllah, locale: string): string {
  return locale === "fr" ? name.meaning.fr : name.meaning.en;
}

/**
 * Days since the Unix epoch in the device's LOCAL calendar — the same
 * day-boundary logic as the daily āyah (src/services/dailyAyah.ts), kept
 * here as a copy so this data module stays free of service imports.
 */
function localDayNumber(now: Date): number {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

/**
 * The Name of the day: a strict 1 → 99 rotation tied to the local calendar
 * day, so it is the SAME for every user on the same day (communal, like
 * the daily āyah) and walks the canonical order — 99 days covers all 99
 * names in sequence, which is exactly how the list is traditionally
 * memorised.
 */
export function getDailyNameNumber(now: Date = new Date()): number {
  return (localDayNumber(now) % entries.length) + 1;
}

export function getDailyName(now: Date = new Date()): NameOfAllah {
  // The rotation index is always in range, but fall back to the first name
  // rather than crash if the dataset ever shrank.
  return byNumber.get(getDailyNameNumber(now)) ?? (entries[0] as NameOfAllah);
}
