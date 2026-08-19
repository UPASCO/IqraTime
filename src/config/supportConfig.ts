/**
 * "Support AyahNow" (donation) feature configuration.
 *
 * AyahNow has no server of its own. Support payments go entirely through a
 * Stripe-hosted Payment Link opened in the system browser — see
 * docs/STRIPE_SETUP.md for the manual Stripe setup procedure and
 * docs/KNOWN_LIMITATIONS.md for why this feature ships disabled.
 *
 * Every value here comes from an `EXPO_PUBLIC_*` environment variable,
 * inlined at build time by Expo. NONE of these are secrets: the payment
 * URL is a public Stripe Payment Link (safe to expose, exactly like a
 * link you'd put on a website), and the boolean flags are review-status
 * gates, not credentials. The banking account that receives payouts is
 * configured entirely inside the Stripe Dashboard by the project owner —
 * see docs/STRIPE_SETUP.md — and is never referenced anywhere in this
 * codebase, in any form (no IBAN, no account number, no routing number).
 */
export interface SupportConfig {
  readonly enabled: boolean;
  readonly paymentUrl: string;
  readonly providerName: string;
  readonly legalReviewed: boolean;
  readonly religiousReviewed: boolean;
  readonly iosApproved: boolean;
  readonly androidApproved: boolean;
}

function readBooleanEnv(value: string | undefined): boolean {
  return value === "true";
}

export function getSupportConfig(): SupportConfig {
  return {
    enabled: readBooleanEnv(process.env.EXPO_PUBLIC_SUPPORT_ENABLED),
    paymentUrl: process.env.EXPO_PUBLIC_SUPPORT_PAYMENT_URL ?? "",
    providerName: process.env.EXPO_PUBLIC_SUPPORT_PROVIDER_NAME ?? "Stripe",
    legalReviewed: readBooleanEnv(process.env.EXPO_PUBLIC_SUPPORT_LEGAL_REVIEWED),
    religiousReviewed: readBooleanEnv(process.env.EXPO_PUBLIC_SUPPORT_RELIGIOUS_REVIEWED),
    iosApproved: readBooleanEnv(process.env.EXPO_PUBLIC_SUPPORT_IOS_APPROVED),
    androidApproved: readBooleanEnv(process.env.EXPO_PUBLIC_SUPPORT_ANDROID_APPROVED),
  };
}

/** An optional additional allowed host for a custom Stripe domain (Stripe's "custom domains" feature), explicitly opted into — never derived from user input. */
export function getExtraAllowedPaymentHost(): string | undefined {
  const value = process.env.EXPO_PUBLIC_SUPPORT_ALLOWED_HOST?.trim();
  return value ? value.toLowerCase() : undefined;
}
