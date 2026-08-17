import { Platform, Linking } from "react-native";

import { getSupportConfig, getExtraAllowedPaymentHost, type SupportConfig } from "@/config/supportConfig";
import { DEFAULT_ALLOWED_PAYMENT_HOSTS, validateSupportPaymentUrl } from "@/utils/validateSupportPaymentUrl";

/**
 * Independent service for the optional "Support AyahNow" donation feature.
 * Opens a Stripe-hosted Payment Link in the system browser — no in-app
 * WebView, no PaymentSheet, no secret key, no server of any kind. See
 * docs/STRIPE_SETUP.md.
 */

export type SupportUnavailableReason =
  | "disabled"
  | "missing_url"
  | "invalid_url"
  | "legal_not_reviewed"
  | "religious_not_reviewed"
  | "platform_not_approved";

export interface SupportAvailabilityDeps {
  readonly config?: SupportConfig;
  readonly platformOS?: typeof Platform.OS;
}

function allowedHosts(): readonly string[] {
  const extra = getExtraAllowedPaymentHost();
  return extra ? [...DEFAULT_ALLOWED_PAYMENT_HOSTS, extra] : DEFAULT_ALLOWED_PAYMENT_HOSTS;
}

/**
 * Returns the specific reason support is unavailable, or null when it's
 * fully available. Every gate must pass: the feature flag, a present and
 * valid HTTPS Stripe URL, legal review, religious review, and the
 * platform-specific store-policy approval flag (iOS checks
 * EXPO_PUBLIC_SUPPORT_IOS_APPROVED, Android checks
 * EXPO_PUBLIC_SUPPORT_ANDROID_APPROVED).
 */
export function getSupportUnavailableReason(deps: SupportAvailabilityDeps = {}): SupportUnavailableReason | null {
  const config = deps.config ?? getSupportConfig();
  const platformOS = deps.platformOS ?? Platform.OS;

  if (!config.enabled) return "disabled";
  if (!config.paymentUrl) return "missing_url";
  if (!validateSupportPaymentUrl(config.paymentUrl, allowedHosts())) return "invalid_url";
  if (!config.legalReviewed) return "legal_not_reviewed";
  if (!config.religiousReviewed) return "religious_not_reviewed";
  if (platformOS === "ios" && !config.iosApproved) return "platform_not_approved";
  if (platformOS === "android" && !config.androidApproved) return "platform_not_approved";
  return null;
}

export function isSupportAvailable(deps: SupportAvailabilityDeps = {}): boolean {
  return getSupportUnavailableReason(deps) === null;
}

/** Returns the payment URL only when every availability gate passes; null otherwise. Never returns an unvalidated or partially-configured URL. */
export function getSupportPaymentUrl(deps: SupportAvailabilityDeps = {}): string | null {
  const config = deps.config ?? getSupportConfig();
  return isSupportAvailable(deps) ? config.paymentUrl : null;
}

export type OpenSupportPaymentResult =
  | { readonly success: true }
  | { readonly success: false; readonly error: "unavailable" | "no_browser" | "open_failed" };

/**
 * Opens the Stripe Payment Link in the system's default/secure browser
 * (Linking.openURL — never an in-app WebView; on iOS this opens Safari or
 * the user's default browser via the standard system flow, on Android the
 * default browser or a secure custom tab). Returning `{ success: true }`
 * means the OS accepted the request to open the URL — it is NOT proof the
 * page loaded or that any payment happened; the app has no way to know
 * that, by design (no server, no webhook). Never treat the user returning
 * to the app afterward as payment confirmation.
 */
export async function openSupportPaymentPage(deps: SupportAvailabilityDeps = {}): Promise<OpenSupportPaymentResult> {
  const url = getSupportPaymentUrl(deps);
  if (!url) return { success: false, error: "unavailable" };

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) return { success: false, error: "no_browser" };
    await Linking.openURL(url);
    return { success: true };
  } catch {
    return { success: false, error: "open_failed" };
  }
}
