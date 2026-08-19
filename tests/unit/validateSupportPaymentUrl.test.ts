import { validateSupportPaymentUrl, DEFAULT_ALLOWED_PAYMENT_HOSTS } from "@/utils/validateSupportPaymentUrl";

describe("validateSupportPaymentUrl", () => {
  it("rejects an empty or missing URL", () => {
    expect(validateSupportPaymentUrl("")).toBe(false);
    expect(validateSupportPaymentUrl("   ")).toBe(false);
    expect(validateSupportPaymentUrl(null)).toBe(false);
    expect(validateSupportPaymentUrl(undefined)).toBe(false);
  });

  it("rejects HTTP (non-HTTPS) URLs", () => {
    expect(validateSupportPaymentUrl("http://buy.stripe.com/test")).toBe(false);
  });

  it("rejects javascript:, data:, and file: schemes", () => {
    expect(validateSupportPaymentUrl("javascript:alert(1)")).toBe(false);
    expect(validateSupportPaymentUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(validateSupportPaymentUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects a malformed URL", () => {
    expect(validateSupportPaymentUrl("not a url at all")).toBe(false);
    expect(validateSupportPaymentUrl("https://")).toBe(false);
  });

  it("rejects a URL containing embedded credentials", () => {
    expect(validateSupportPaymentUrl("https://user:pass@buy.stripe.com/test")).toBe(false);
  });

  it("rejects a well-formed HTTPS URL on a non-allow-listed host", () => {
    expect(validateSupportPaymentUrl("https://evil.example.com/buy.stripe.com")).toBe(false);
    expect(validateSupportPaymentUrl("https://buy.stripe.com.evil.com/test")).toBe(false);
  });

  it("accepts a valid HTTPS Stripe Payment Link URL", () => {
    expect(validateSupportPaymentUrl("https://buy.stripe.com/test_abc123")).toBe(true);
    expect(validateSupportPaymentUrl("https://checkout.stripe.com/pay/cs_test_abc")).toBe(true);
  });

  it("accepts an explicitly configured custom allowed host", () => {
    expect(validateSupportPaymentUrl("https://pay.example.org/link", ["pay.example.org"])).toBe(true);
    expect(validateSupportPaymentUrl("https://sub.pay.example.org/link", ["pay.example.org"])).toBe(true);
  });

  it("default allow-list only contains official Stripe hosts", () => {
    expect(DEFAULT_ALLOWED_PAYMENT_HOSTS).toContain("buy.stripe.com");
    expect(DEFAULT_ALLOWED_PAYMENT_HOSTS).toContain("checkout.stripe.com");
  });
});
