# Release Checklist

Do not submit to either store until every box below is checked. This
build, as delivered, fails several of these on purpose (see
`docs/CORPUS.md`, `docs/TRANSLATIONS.md`) — that is intentional, not an
oversight.

## Identity & branding (`src/config/appConfig.ts`)

- [ ] `iosBundleIdentifier` — replace the `com.example.ayahnow.provisional` placeholder with a real, owned reverse-DNS id.
- [ ] `androidPackage` — same, for Android.
- [x] `easProjectId` — set to the real EAS project id (`@teamupasco/ayahnow`).
- [ ] `contactEmail` — a real, monitored support address (required by both stores).
- [ ] `privacyPolicyUrl` — a real, publicly reachable HTTPS URL hosting `docs/PRIVACY.md`'s content.
- [ ] `appName`, tagline, brand colors — confirm final wording/branding with the product owner.
- [ ] `eas.json` submit section — real App Store Connect app id (`ascAppId`) and Google Play service account key path. Do **not** add an `appleId` or `appleTeamId` field here: those identify the owner's personal Apple account and must never be committed. Configure an App Store Connect API Key instead (`eas credentials` or the EAS website) — see `docs/PUBLISH_FROM_IPHONE.md`.

## "Support AyahNow" donation feature (`docs/STRIPE_SETUP.md`)

Ships **disabled** by default and should stay that way until every item
below is checked:

- [ ] A real Stripe account is verified and a payout bank account is
      configured **inside the Stripe Dashboard only** (never in this repo).
- [ ] A Stripe Payment Link is created per `docs/STRIPE_SETUP.md`'s
      procedure and its public URL is set as `EXPO_PUBLIC_SUPPORT_PAYMENT_URL`
      via EAS environment configuration (not committed to source control).
- [ ] Legal review completed → `EXPO_PUBLIC_SUPPORT_LEGAL_REVIEWED=true`.
- [ ] Religious review completed → `EXPO_PUBLIC_SUPPORT_RELIGIOUS_REVIEWED=true`.
- [ ] Current Apple App Store guidelines on external payment links/donations
      reviewed and satisfied → `EXPO_PUBLIC_SUPPORT_IOS_APPROVED=true`.
- [ ] Current Google Play Billing policy on external payment methods
      reviewed and satisfied → `EXPO_PUBLIC_SUPPORT_ANDROID_APPROVED=true`.
- [ ] Only once all of the above are true → `EXPO_PUBLIC_SUPPORT_ENABLED=true`.
- [ ] `npm run security:check-secrets` passes (no IBAN, no Stripe secret
      key, no webhook secret anywhere in the app bundle) — this also runs
      as part of `npm run check`.

## Corpus (`docs/CORPUS.md`, `docs/TRANSLATIONS.md`)

- [x] Arabic text sourced verbatim from the King Fahd Complex Uthmani
      edition (4540 āyāt across 113 surahs) via
      `node scripts/buildFullCorpus.mjs` — not hand-typed.
- [ ] Every shipped catalog entry has gone through the reviewer checklist
      in `docs/CORPUS.md` and reached `status: "publishable"`.
- [ ] At least one, ideally all 10, supported languages have a real,
      licensed Quran translation imported via `scripts/importTranslation.ts`
      with `redistributionRightsConfirmed: true` set only after personal
      verification.
- [ ] `npm run corpus:validate:prod` passes with zero errors.
- [ ] A qualified religious reviewer has signed off on the final ayah
      selection, translations, and theme tags — this is a human judgment
      call this codebase cannot make for you.

## App icon & branding assets

- [ ] Confirm the temporary icon/splash (`assets/images/*.png`, sources in
      `assets/source/*.svg`) is acceptable, or replace with final art
      (regenerate via `node scripts/generateIconAssets.mjs` if editing the
      SVGs, or swap in externally-produced PNGs at the same paths/sizes).
- [ ] An Arabic-specific typeface has been added (see `docs/ACCESSIBILITY.md`)
      if the system-font fallback isn't the desired final look.

## Technical verification (this session's actual status — see "Truthfulness" below)

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run security:check-secrets` passes.
- [ ] `npx expo prebuild` succeeds for both platforms.
- [ ] A Development Build runs on a **real** Android device.
- [ ] A Development Build runs on a **real** iOS device.
- [ ] A local test notification is confirmed to arrive and display
      correctly on a locked, real device screen (not just the emulator).
- [ ] App survives a real device restart with notifications still pending
      on iOS; on Android, confirm the current known limitation (no boot
      receiver — see `docs/KNOWN_LIMITATIONS.md`) is acceptable or fixed.
- [ ] All 10 languages spot-checked on a real device (font rendering,
      RTL, text wrapping) — see `docs/ACCESSIBILITY.md`'s manual checklist.
- [ ] `eas build --profile production` succeeds for both platforms.

## Store-specific

### Google Play

- [ ] Data safety form filled out truthfully (this app: no data
      collected — confirm nothing in the final dependency set changed
      that assumption).
- [ ] Target API level meets Play's current minimum requirement at
      submission time.
- [ ] App content rating questionnaire completed.
- [ ] Store listing screenshots taken on a real or accurately-simulated
      device, in at least the primary supported languages.
- [ ] Privacy policy URL live and matching `docs/PRIVACY.md`.

### Apple App Store

- [ ] App Privacy "nutrition label" filled out (no data collected).
- [ ] `ITSAppUsesNonExemptEncryption` confirmed correct (currently `false`
      in `app.config.ts` — re-verify if encryption usage changes).
- [ ] Screenshots for all required device sizes.
- [ ] Review notes explain that all notifications are local/scheduled, no
      account is needed, and (if applicable at submission time) how to
      test the notification flow without a lengthy wait.
- [ ] Privacy policy URL live and matching `docs/PRIVACY.md`.

## Truthfulness about this build's actual state

Per this project's own working rules: don't claim "production ready"
without verification. As delivered by this development session:

- **Verified statically**: TypeScript types, ESLint rules, and the corpus
  validator's structural checks (see the final report in the PR/commit
  message for actual pass/fail results).
- **Verified by automated test**: selection engine, scheduler (including
  DST/timezone edge cases), reschedule integration flow, preferences
  storage, i18n completeness/plurals/scripts, notification-tap parsing,
  RTL resolution, RNG determinism, platform limits — see `npm test` output.
- **Not tested on a simulator** in this session (no iOS/Android toolchain
  available in this sandboxed environment).
- **Not tested on a real device** in this session.
- **Not verified**: actual lock-screen notification rendering, behavior
  after a real device reboot, battery-optimization interaction on a real
  Android OEM skin, App/Play Store review outcomes, corpus religious
  accuracy (explicitly requires a qualified human, see `docs/CORPUS.md`).

Do not represent this build as "production ready" until the boxes above
are independently re-verified.
