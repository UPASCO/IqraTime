/**
 * Copyright (c) 2026 Nadir Echaara. All Rights Reserved.
 * AyahNow is proprietary software — see LICENSE and NOTICE.md at the
 * repository root. No license is granted to any other party.
 *
 * Centralized brand & publishing configuration.
 *
 * Every value that is specific to a real-world publisher identity (bundle id,
 * package name, EAS project id, contact address, brand colors, store name)
 * lives here so it can be swapped in one place before a production build.
 *
 * The raw values themselves live in ../../config/shared.js (plain
 * CommonJS) rather than being duplicated here, because app.config.ts is
 * loaded by the Expo CLI in a plain Node context that cannot resolve a
 * local TypeScript module import — see config/shared.js's own comment and
 * docs/ARCHITECTURE.md. This file adds full TypeScript typing (literal
 * unions, readonly tuples) on top of that shared raw data for use inside
 * the app; app.config.ts consumes config/shared.js directly instead.
 *
 * PLACEHOLDER VALUES: everything marked "PROVISIONAL" below is NOT a real,
 * owned identifier. It exists so the project builds and runs end-to-end in
 * development. Replace every PROVISIONAL value with the real, owned
 * identifier before submitting to any store. See docs/RELEASE_CHECKLIST.md.
 */
import shared from "../../config/shared.js";

interface SharedConfigShape {
  appName: string;
  tagline: { fr: string; alt_fr: string };
  version: string;
  buildNumber: number;
  iosBundleIdentifier: string;
  androidPackage: string;
  easProjectId: string;
  contactEmail: string;
  privacyPolicyUrl: string;
  deepLinkScheme: string;
  brand: {
    deepGreen: string;
    secondaryGreen: string;
    ivory: string;
    warmWhite: string;
    gold: string;
    darkText: string;
  };
  defaultSchedule: {
    startHour: number;
    endHour: number;
    frequencyHours: number;
    activeDays: number[];
    quietNightEnabled: boolean;
  };
  notificationLimits: {
    iosEffectivePendingLimit: number;
    iosSafetyMargin: number;
    androidSoftLimit: number;
  };
  supportedLocales: string[];
  fallbackLocale: string;
}

const raw = shared as SharedConfigShape;

export const appConfig = {
  /** Working name. Change freely — used across UI, notifications, and app.config.ts. */
  appName: raw.appName,

  /** Marketing taglines (source language: French, as authored by the product owner). */
  tagline: raw.tagline,

  /** Semantic app version shown to users. Keep in sync with package.json + app.config.ts. */
  version: raw.version,

  /** Internal build number, bumped on every store submission. */
  buildNumber: raw.buildNumber,

  /**
   * PROVISIONAL — replace before any store submission.
   * Reverse-DNS bundle identifier for iOS.
   */
  iosBundleIdentifier: raw.iosBundleIdentifier,

  /**
   * PROVISIONAL — replace before any store submission.
   * Android application id.
   */
  androidPackage: raw.androidPackage,

  /** Real EAS project id, from `eas init` (@teamupasco/ayahnow). */
  easProjectId: raw.easProjectId,

  /**
   * PROVISIONAL — replace with a real, monitored contact address before
   * publishing (required by both stores for support contact).
   */
  contactEmail: raw.contactEmail,

  /**
   * PROVISIONAL — replace with a real, hosted privacy policy URL before
   * publishing. Both stores require a reachable HTTPS URL even though the
   * app collects no personal data; docs/PRIVACY.md is the source text.
   */
  privacyPolicyUrl: raw.privacyPolicyUrl,

  /** Deep link scheme used for notification taps and universal links. */
  deepLinkScheme: raw.deepLinkScheme,

  /** Brand colors — also mirrored in src/theme/tokens.ts; keep in sync. */
  brand: raw.brand,

  /** Default onboarding notification schedule (spec section 6). */
  defaultSchedule: {
    startHour: raw.defaultSchedule.startHour,
    endHour: raw.defaultSchedule.endHour,
    frequencyHours: raw.defaultSchedule.frequencyHours as 1 | 2 | 3 | 4 | 6 | 12,
    activeDays: raw.defaultSchedule.activeDays as unknown as readonly [0, 1, 2, 3, 4, 5, 6], // 0 = Sunday .. 6 = Saturday
    quietNightEnabled: raw.defaultSchedule.quietNightEnabled,
  },

  /** Safety margin kept below the platform's effective pending-notification ceiling. */
  notificationLimits: raw.notificationLimits,

  supportedLocales: raw.supportedLocales as unknown as readonly [
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
  ],

  fallbackLocale: raw.fallbackLocale as "en",
} as const;

export type SupportedLocale = (typeof appConfig.supportedLocales)[number];
