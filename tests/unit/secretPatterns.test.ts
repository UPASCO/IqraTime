import { scanTextForSecrets } from "@/utils/secretPatterns";

/**
 * Fixture strings are assembled from parts at runtime rather than written
 * as literals, so no secret-shaped string sits directly in this file's
 * committed source — GitHub's own push-protection secret scanner (rightly)
 * flags realistic-looking literal API keys, even fake/synthetic ones used
 * purely as test fixtures. None of the values below are real credentials.
 */
const FAKE_STRIPE_LIVE_KEY = ["sk", "live", "51ABCDEFGHIJKLMNOPQRSTUVWX"].join("_");
const FAKE_STRIPE_TEST_KEY = ["sk", "test", "51ABCDEFGHIJKLMNOPQRSTUVWX"].join("_");
const FAKE_STRIPE_PUBLISHABLE_KEY = ["pk", "live", "51ABCDEFGHIJKLMNOPQRSTUVWX"].join("_");
const FAKE_WEBHOOK_SECRET = ["whsec", "abcdefghijklmnopqrstuvwxyz0123456789"].join("_");
const FAKE_IBAN = ["FR76", "3000", "6000", "0112", "3456", "7890", "189"].join("");

describe("scanTextForSecrets", () => {
  it("finds nothing in ordinary application code", () => {
    const code = `
      export const appConfig = {
        appName: "IqraTime",
        contactEmail: "contact@iqratime.example",
      };
    `;
    expect(scanTextForSecrets(code)).toEqual([]);
  });

  it("detects an IBAN-shaped string", () => {
    const findings = scanTextForSecrets(`const leaked = "${FAKE_IBAN}";`);
    expect(findings.some((f) => f.kind === "iban")).toBe(true);
  });

  it("detects a Stripe live secret key", () => {
    const findings = scanTextForSecrets(`STRIPE_KEY=${FAKE_STRIPE_LIVE_KEY}`);
    expect(findings.some((f) => f.kind === "stripe_secret_key")).toBe(true);
  });

  it("detects a Stripe test secret key", () => {
    const findings = scanTextForSecrets(FAKE_STRIPE_TEST_KEY);
    expect(findings.some((f) => f.kind === "stripe_secret_key")).toBe(true);
  });

  it("detects a Stripe webhook signing secret", () => {
    const findings = scanTextForSecrets(FAKE_WEBHOOK_SECRET);
    expect(findings.some((f) => f.kind === "stripe_webhook_secret")).toBe(true);
  });

  it("does not flag a public Stripe Payment Link URL", () => {
    const text = "EXPO_PUBLIC_SUPPORT_PAYMENT_URL=https://buy.stripe.com/test_abc123";
    expect(scanTextForSecrets(text)).toEqual([]);
  });

  it("does not flag a Stripe publishable key (pk_live_/pk_test_ are public by design)", () => {
    expect(scanTextForSecrets(FAKE_STRIPE_PUBLISHABLE_KEY)).toEqual([]);
  });

  it("does not false-positive on an unrelated uppercase+digits identifier", () => {
    const text = 'const id = "XX1234567890";'; // "XX" is not a real IBAN country code
    expect(scanTextForSecrets(text)).toEqual([]);
  });
});
