# Stripe Setup — "Support IqraTime"

IqraTime's optional donation feature has no server component. It opens a
Stripe-hosted **Payment Link** in the system browser; Stripe handles
everything about collecting the payment and paying it out to the project
owner's bank account. This document is the manual procedure the project
owner (not this codebase) must complete before the feature can ever be
turned on. **Claude/an AI assistant must never be asked to create or
handle a Stripe secret key** — everything below happens in the Stripe
Dashboard, by a human, outside of this repository.

## Why this architecture

```
IqraTime  →  system browser (Safari / Chrome / secure custom tab)  →  Stripe Payment Link  →  Stripe  →  the bank account configured in Stripe
```

- **No Stripe secret key, PaymentSheet, or Payment Intents API is used in
  the app.** Those require a server component to create Payment Intents
  securely — IqraTime has no server, and a secret key must never ship
  inside a mobile app bundle (it would be trivially extractable).
- **No in-app WebView.** The payment page opens in the OS's own secure
  browser context, which is what both Apple's and Stripe's guidance
  recommend for exactly this reason (isolation from the app's own code).
- **No local server, no proxy, no webhook receiver.** IqraTime cannot and
  does not verify that a payment succeeded — see "What the app cannot do"
  below.

## One-time manual setup (project owner only)

1. Create or use a verified Stripe account at <https://dashboard.stripe.com>.
2. Complete Stripe's required legal/business identity verification.
3. Add the payout bank account under **Settings → Bank accounts and
   currencies → Payout accounts**. **This is the only place the bank
   account (IBAN or equivalent) is ever entered — never in this repository,
   never in any config file, never in an environment variable.**
4. Set the payout currency to **EUR**.
5. Go to **Payment Links → Create Payment Link**.
6. Choose a one-time payment ("Le client choisit le montant" / "Customer
   chooses the amount") rather than a fixed price.
7. Name the product/contribution **"Soutenir IqraTime"** (or "Support
   IqraTime" for an English-facing link — Stripe Payment Links support one
   name per link; consider creating one per major language if desired,
   each behind its own `EXPO_PUBLIC_SUPPORT_PAYMENT_URL` build config).
8. In the description, clearly state that **no content or benefit is
   purchased** — this is a voluntary contribution only.
9. Enable **Visa** and **Mastercard**.
10. Enable **Bancontact** for EUR payments.
11. Enable **Apple Pay** and **Google Pay** where available and permitted
    by Stripe in your account's region.
12. **Disable** installment/split payments and any "buy now, pay later"
    credit option (Klarna, Afterpay, etc.).
13. **Do not** enable subscriptions or recurring billing for this first
    version.
14. Configure the post-payment confirmation page (Stripe's own hosted
    confirmation — no redirect back into the app is required or expected).
15. Copy the public Payment Link URL Stripe generates (looks like
    `https://buy.stripe.com/xxxxxxxxxxxx`).
16. Put that URL into the app's deployment configuration — see
    "Wiring the URL into the app" below. **Never commit it as if it were
    a secret** (it isn't one — it's a public link, safe to share, exactly
    like a link on a website) but it should still come from EAS
    environment configuration rather than being hardcoded, so it can be
    changed without a code change and so it never accidentally becomes
    the "real" URL in a development build.

## Wiring the URL into the app

The app reads the following **public, non-secret** environment variables
(inlined at build time by Expo's `EXPO_PUBLIC_` mechanism — see
`src/config/supportConfig.ts`):

| Variable | Purpose | Safe to commit a placeholder? |
|---|---|---|
| `EXPO_PUBLIC_SUPPORT_ENABLED` | Master on/off switch | Yes — default `false` |
| `EXPO_PUBLIC_SUPPORT_PAYMENT_URL` | The Stripe Payment Link URL | Only a fake placeholder (see `.env.example`); the real one belongs in EAS env config, not source control |
| `EXPO_PUBLIC_SUPPORT_PROVIDER_NAME` | Displayed provider name (e.g. "Stripe") | Yes |
| `EXPO_PUBLIC_SUPPORT_LEGAL_REVIEWED` | Set to `true` only after legal sign-off | Yes — default `false` |
| `EXPO_PUBLIC_SUPPORT_RELIGIOUS_REVIEWED` | Set to `true` only after religious sign-off | Yes — default `false` |
| `EXPO_PUBLIC_SUPPORT_IOS_APPROVED` | Set to `true` only once App Store guideline compliance (see below) is confirmed | Yes — default `false` |
| `EXPO_PUBLIC_SUPPORT_ANDROID_APPROVED` | Set to `true` only once Google Play policy compliance is confirmed | Yes — default `false` |
| `EXPO_PUBLIC_SUPPORT_ALLOWED_HOST` | Optional: an additional allowed host if using a Stripe custom domain | Yes, optional |

For a production build, set the real values via **EAS environment
variables** (`eas env:create` / the EAS dashboard) tied to the
`production` build profile — never by editing a checked-in `.env` file
with real values. `.env.example` in this repository contains only
placeholder/fake values and is safe to commit.

## Store policy review — required before `*_APPROVED=true`

Both Apple and Google have specific rules about "tipping"/donation flows
vs. in-app purchases of digital content. As of this writing, a genuinely
optional, no-benefit-granted financial contribution that happens entirely
outside the app (via an external browser to a payment processor) is
generally **not** required to go through Apple's In-App Purchase system
or Google Play Billing — but store policies change, and only a human who
has read the *current* guidelines (App Store Review Guidelines section on
"Acceptable" external payment links / donations, and Google Play's Billing
policy on external payment methods) can make this determination
responsibly. **Do not set `EXPO_PUBLIC_SUPPORT_IOS_APPROVED` or
`EXPO_PUBLIC_SUPPORT_ANDROID_APPROVED` to `true` without that review.**

## What the app cannot do (by design)

- It cannot verify a payment succeeded — there is no server, no webhook.
  The Support screen shows, at most, a generic "Thank you for considering
  supporting IqraTime" message after the browser opens; it never claims
  the payment is confirmed.
- It cannot unlock content, remove anything, or grant any benefit based
  on payment — there is nothing to unlock, and building such a mechanism
  without a server would require storing purchase state in a way that's
  trivially bypassable, which is explicitly out of scope and against the
  spec's own requirement that no benefit is exchanged.
- It cannot pre-fill or suggest an amount beyond what Stripe's own
  Payment Link page offers.

## Verifying no secrets ever end up in the app

Run `npm run security:check-secrets` (see `scripts/checkSecrets.ts`) —
it scans `app/`, `src/`, and top-level config files for IBAN-shaped
strings, Stripe secret keys (`sk_live_…`/`sk_test_…`), and webhook secrets
(`whsec_…`), and fails with a non-zero exit code if it finds any. This is
part of `npm run check`, so it runs on every `npm run check` and should be
wired into CI/EAS build hooks as a hard gate before a production build.
