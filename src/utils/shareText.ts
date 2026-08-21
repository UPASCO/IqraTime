export interface ShareTextInput {
  readonly translationText?: string;
  readonly arabicText?: string;
  readonly surah: number;
  readonly ayah: number;
  readonly includeArabic: boolean;
  readonly includeTranslation: boolean;
  readonly referenceLabel: string; // e.g. "Surah"
  readonly appName: string;
}

/**
 * Composes the plain-text share format from spec section 24:
 * "<translation>"
 * Surah X, verset Y
 * Shared with AyahNow
 * No tracking link, no generated image in this version.
 */
export function formatShareText(input: ShareTextInput): string {
  const lines: string[] = [];
  if (input.includeArabic && input.arabicText) lines.push(input.arabicText);
  if (input.includeTranslation && input.translationText) lines.push(`“${input.translationText}”`);
  lines.push(`${input.referenceLabel} ${input.surah}:${input.ayah}`);
  lines.push(input.appName);
  return lines.join("\n");
}

export interface HadithShareTextInput {
  readonly translationText?: string;
  readonly arabicText?: string;
  readonly collectionDisplayName: string;
  readonly hadithNumber: number;
  readonly includeArabic: boolean;
  readonly includeTranslation: boolean;
  readonly appName: string;
}

export function formatHadithShareText(input: HadithShareTextInput): string {
  const lines: string[] = [];
  if (input.includeArabic && input.arabicText) lines.push(input.arabicText);
  if (input.includeTranslation && input.translationText) lines.push(`“${input.translationText}”`);
  lines.push(`${input.collectionDisplayName} #${input.hadithNumber}`);
  lines.push(input.appName);
  return lines.join("\n");
}
