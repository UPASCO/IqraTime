# Privacy

*This is the source text for the in-app Privacy screen
(`app/privacy.tsx`, `privacy.*` keys in each locale catalog) and for the
hosted privacy policy page that must exist at
`appConfig.privacyPolicyUrl` before publication (both stores require a
reachable HTTPS URL even when — as here — no personal data is collected).*

## Summary

All your preferences, history, and favorites stay on your device. IqraTime
requires no account and does not send this data to any server.

## What IqraTime does not do

- No account, no sign-up, no login, no user identifier of any kind.
- No backend server of any kind for day-to-day operation.
- No analytics SDK, no crash-reporting SDK, no advertising SDK.
- No advertising identifier (IDFA/GAID) is read or generated.
- No profiling, no behavioral tracking, no "personalization" beyond the
  themes/settings the user explicitly picks.
- No GPS or any other location access.
- No access to contacts, microphone, or camera.
- No synchronization of favorites, history, or preferences to any remote
  service.
- No telemetry of any kind, hidden or otherwise.

## What is stored, and where

Everything below lives **only on the device**, in SQLite
(`src/storage/db.ts`) or `AsyncStorage` (`src/storage/preferencesStore.ts`,
`src/storage/diagnosticsStore.ts`):

| Data | Storage | Purpose |
|---|---|---|
| Preferences (language, schedule, theme, etc.) | AsyncStorage | Remember your settings |
| Notification/history/favorites | SQLite | Show history, favorites, and know what to avoid repeating |
| Hidden ayat | SQLite | Respect ayat you've chosen to exclude |
| Scheduled notification slots | SQLite | The sliding notification queue (see docs/NOTIFICATIONS.md) |
| Local error log | SQLite | Diagnostics screen only — never transmitted |

Uninstalling the app deletes all of it. "Reset all local data" in Settings
deletes all of it without uninstalling.

## Optional "Support IqraTime" payments

If enabled (it ships **disabled** by default — see
`docs/STRIPE_SETUP.md`), the Support screen opens a Stripe-hosted Payment
Link in your device's system browser. IqraTime itself never sees, requests,
stores, or transmits any payment data — no card number, no expiration
date, no CVC, no Apple Pay/Google Pay/Bancontact account details, no
payer bank details, no payment amount, no Stripe transaction history. That
page is operated entirely by Stripe and governed by Stripe's own privacy
policy, independent of IqraTime's. The banking account that receives
payouts is configured by the project owner directly inside the Stripe
Dashboard and is never referenced anywhere in this app or its source code.

## Third-party dependencies

Every dependency was chosen partly on this criterion: does it collect data
by default? None of the libraries used (see `THIRD_PARTY_LICENSES.md`)
include a bundled analytics or tracking component. `expo-notifications`
uses Apple/Google's own push infrastructure only for *remote* push, which
this app does not use — all notifications here are scheduled locally.

## Contact

`support@iqratime.com` (`appConfig.contactEmail` in `src/config/appConfig.ts`).
