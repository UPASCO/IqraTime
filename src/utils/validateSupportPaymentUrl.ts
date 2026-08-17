/**
 * Official Stripe Payment Link / Checkout hosts. A custom Stripe domain can
 * be added explicitly via EXPO_PUBLIC_SUPPORT_ALLOWED_HOST
 * (see src/config/supportConfig.ts) — never derived from the URL itself.
 */
export const DEFAULT_ALLOWED_PAYMENT_HOSTS: readonly string[] = ["buy.stripe.com", "checkout.stripe.com"];

/**
 * Validates a support-payment URL before it is ever opened. Pure and
 * synchronous — deliberately never constructs a URL from user input; the
 * only input is the pre-configured value from EXPO_PUBLIC_SUPPORT_PAYMENT_URL.
 *
 * Rejects: empty/missing, malformed, any non-`https:` scheme (explicitly
 * including `http:`, `javascript:`, `data:`, `file:`), embedded
 * credentials (`user:pass@host`), and any host not on the allow-list.
 */
export function validateSupportPaymentUrl(
  url: string | null | undefined,
  allowedHosts: readonly string[] = DEFAULT_ALLOWED_PAYMENT_HOSTS,
): boolean {
  if (!url || !url.trim()) return false;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;

  const host = parsed.hostname.toLowerCase();
  const isAllowed = allowedHosts.some(
    (allowed) => host === allowed.toLowerCase() || host.endsWith(`.${allowed.toLowerCase()}`),
  );
  return isAllowed;
}
