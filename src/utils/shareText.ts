import { appConfig } from "@/config/appConfig";
import type { TranslationKey } from "@/i18n/schema";

type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

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

/**
 * Builds the translated "get the app" line, with both store links filled
 * in — shared by every screen that shares/copies an ayah or hadith.
 *
 * The iOS App Store URL only becomes real once the app has been submitted
 * to App Store Connect at least once (see docs/RELEASE_CHECKLIST.md); until
 * then `appConfig.iosAppStoreUrl` is a placeholder that leads to a dead
 * "Connexion impossible" page in the App Store app. Shipping a guaranteed-
 * broken link in every share defeats the entire point of this growth
 * mechanism, so this detects that case and shares the real, working
 * Android link only — never a link known in advance not to work.
 */
export function buildGetTheAppLine(t: TFunction): string {
  const iosReady = !appConfig.iosAppStoreUrl.includes("PROVISIONAL");
  const key: TranslationKey = iosReady ? "common.getTheAppShareLine" : "common.getTheAppShareLineAndroidOnly";
  return t(key, { iosUrl: appConfig.iosAppStoreUrl, androidUrl: appConfig.androidPlayStoreUrl });
}
