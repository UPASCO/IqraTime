/**
 * Pure pattern-matching used by scripts/checkSecrets.ts to scan the
 * application source tree for accidentally-committed banking details or
 * Stripe secrets. Kept separate from the CLI/filesystem-walking code so
 * it can be unit tested directly (see tests/unit/secretPatterns.test.ts).
 *
 * These are heuristics, not a guarantee — they catch the specific,
 * explicitly-named risks (IBAN-shaped strings, Stripe secret/webhook
 * keys), not every conceivable secret format.
 */

export interface SecretFinding {
  readonly kind: "iban" | "stripe_secret_key" | "stripe_webhook_secret";
  readonly match: string;
}

// A reasonably wide set of real ISO 3166-1 alpha-2 country codes that issue
// IBANs, to keep the pattern from matching arbitrary uppercase+digit runs.
const IBAN_COUNTRY_CODES = [
  "AD", "AE", "AL", "AT", "AZ", "BA", "BE", "BG", "BH", "BR", "BY", "CH", "CR", "CY", "CZ",
  "DE", "DK", "DO", "EE", "EG", "ES", "FI", "FO", "FR", "GB", "GE", "GI", "GL", "GR", "GT",
  "HR", "HU", "IE", "IL", "IQ", "IS", "IT", "JO", "KW", "KZ", "LB", "LC", "LI", "LT", "LU",
  "LV", "LY", "MC", "MD", "ME", "MK", "MR", "MT", "MU", "NL", "NO", "PK", "PL", "PS", "PT",
  "QA", "RO", "RS", "SA", "SC", "SE", "SI", "SK", "SM", "ST", "SV", "TL", "TN", "TR", "UA",
  "VA", "VG", "XK",
];

const IBAN_PATTERN = new RegExp(`\\b(${IBAN_COUNTRY_CODES.join("|")})\\d{2}[A-Z0-9]{10,30}\\b`, "g");
const STRIPE_SECRET_KEY_PATTERN = /\bsk_(live|test)_[A-Za-z0-9]{10,}\b/g;
const STRIPE_WEBHOOK_SECRET_PATTERN = /\bwhsec_[A-Za-z0-9]{10,}\b/g;

export function scanTextForSecrets(text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const match of text.matchAll(IBAN_PATTERN)) {
    findings.push({ kind: "iban", match: match[0] });
  }
  for (const match of text.matchAll(STRIPE_SECRET_KEY_PATTERN)) {
    findings.push({ kind: "stripe_secret_key", match: match[0] });
  }
  for (const match of text.matchAll(STRIPE_WEBHOOK_SECRET_PATTERN)) {
    findings.push({ kind: "stripe_webhook_secret", match: match[0] });
  }

  return findings;
}
