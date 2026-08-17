/**
 * Centralized brand & publishing configuration.
 *
 * Every value that is specific to a real-world publisher identity (bundle id,
 * package name, EAS project id, contact address, brand colors, store name)
 * lives here so it can be swapped in one place before a production build.
 *
 * PLACEHOLDER VALUES: everything marked "PROVISIONAL" below is NOT a real,
 * owned identifier. It exists so the project builds and runs end-to-end in
 * development. Replace every PROVISIONAL value with the real, owned
 * identifier before submitting to any store. See docs/RELEASE_CHECKLIST.md.
 */

export const appConfig = {
  /** Working name. Change freely — used across UI, notifications, and app.config.ts. */
  appName: "AyahNow",

  /** Marketing taglines (source language: French, as authored by the product owner). */
  tagline: {
    fr: "Et si le Coran venait à vous ! Une notification d'Ayah différente par heure.",
    alt_fr: "Le Coran sur votre écran, sans déverrouiller.",
  },

  /** Semantic app version shown to users. Keep in sync with package.json + app.config.ts. */
  version: "0.1.0",

  /** Internal build number, bumped on every store submission. */
  buildNumber: 1,

  /**
   * PROVISIONAL — replace before any store submission.
   * Reverse-DNS bundle identifier for iOS.
   */
  iosBundleIdentifier: "com.example.ayahnow.provisional",

  /**
   * PROVISIONAL — replace before any store submission.
   * Android application id.
   */
  androidPackage: "com.example.ayahnow.provisional",

  /**
   * PROVISIONAL — replace with a real EAS project id from `eas init`.
   */
  easProjectId: "00000000-0000-0000-0000-000000000000",

  /**
   * PROVISIONAL — replace with a real, monitored contact address before
   * publishing (required by both stores for support contact).
   */
  contactEmail: "contact@ayahnow.example",

  /**
   * PROVISIONAL — replace with a real, hosted privacy policy URL before
   * publishing. Both stores require a reachable HTTPS URL even though the
   * app collects no personal data; docs/PRIVACY.md is the source text.
   */
  privacyPolicyUrl: "https://ayahnow.example/privacy",

  /** Deep link scheme used for notification taps and universal links. */
  deepLinkScheme: "ayahnow",

  /** Brand colors — also mirrored in src/theme/tokens.ts; keep in sync. */
  brand: {
    deepGreen: "#12372A",
    secondaryGreen: "#2F6B55",
    ivory: "#F7F3E8",
    warmWhite: "#FFFCF5",
    gold: "#C8A45D",
    darkText: "#17201C",
  },

  /** Default onboarding notification schedule (spec section 6). */
  defaultSchedule: {
    startHour: 8,
    endHour: 22,
    frequencyHours: 1 as 1 | 2 | 3 | 4 | 6 | 12,
    activeDays: [0, 1, 2, 3, 4, 5, 6] as const, // 0 = Sunday .. 6 = Saturday
    quietNightEnabled: true,
  },

  /** Safety margin kept below the platform's effective pending-notification ceiling. */
  notificationLimits: {
    iosEffectivePendingLimit: 64,
    iosSafetyMargin: 6,
    androidSoftLimit: 200,
  },

  supportedLocales: [
    "ar",
    "en",
    "fr",
    "es",
    "pt",
    "hi",
    "bn",
    "zh-CN",
    "it",
    "ru",
  ] as const,

  fallbackLocale: "en" as const,
} as const;

export type SupportedLocale = (typeof appConfig.supportedLocales)[number];
