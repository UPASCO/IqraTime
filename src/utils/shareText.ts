import { appConfig } from "@/config/appConfig";

/**
 * The "get the app" line appended to every shared ayah/hadith — this is the
 * app's only growth mechanism (no ads, no referral backend, no account
 * system): every share is itself an invitation, carrying both store links
 * so the line works regardless of the recipient's platform. `getTheAppLine`
 * is provided by the caller (an i18n string with `{iosUrl}`/`{androidUrl}`
 * placeholders already filled in) so this module stays free of UI/i18n concerns.
 */
function appendGetTheAppLine(lines: string[], getTheAppLine?: string): string[] {
  if (getTheAppLine) lines.push(getTheAppLine);
  return lines;
}

export interface ShareTextInput {
  readonly translationText?: string;
  readonly arabicText?: string;
  readonly surah: number;
  readonly ayah: number;
  readonly includeArabic: boolean;
  readonly includeTranslation: boolean;
  readonly referenceLabel: string; // e.g. "Surah"
  readonly appName: string;
  /** Pre-rendered "Get the app" line (translated, with store links already filled in) — omit to leave it out. */
  readonly getTheAppLine?: string;
}

/**
 * Composes the plain-text share format from spec section 24:
 * "<translation>"
 * Surah X, verset Y
 * Shared with IqraTime
 * 📲 Get the app: <iOS link> · <Android link>
 */
export function formatShareText(input: ShareTextInput): string {
  const lines: string[] = [];
  if (input.includeArabic && input.arabicText) lines.push(input.arabicText);
  if (input.includeTranslation && input.translationText) lines.push(`“${input.translationText}”`);
  lines.push(`${input.referenceLabel} ${input.surah}:${input.ayah}`);
  lines.push(input.appName);
  return appendGetTheAppLine(lines, input.getTheAppLine).join("\n");
}

export interface HadithShareTextInput {
  readonly translationText?: string;
  readonly arabicText?: string;
  readonly collectionDisplayName: string;
  readonly hadithNumber: number;
  readonly includeArabic: boolean;
  readonly includeTranslation: boolean;
  readonly appName: string;
  readonly getTheAppLine?: string;
}

export function formatHadithShareText(input: HadithShareTextInput): string {
  const lines: string[] = [];
  if (input.includeArabic && input.arabicText) lines.push(input.arabicText);
  if (input.includeTranslation && input.translationText) lines.push(`“${input.translationText}”`);
  lines.push(`${input.collectionDisplayName} #${input.hadithNumber}`);
  lines.push(input.appName);
  return appendGetTheAppLine(lines, input.getTheAppLine).join("\n");
}

/** Fills the store links into the translated "get the app" template — shared by every screen that shares/copies an ayah or hadith. */
export function buildGetTheAppLine(template: string): string {
  return template.replace("{iosUrl}", appConfig.iosAppStoreUrl).replace("{androidUrl}", appConfig.androidPlayStoreUrl);
}
