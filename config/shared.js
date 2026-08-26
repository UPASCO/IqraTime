/**
 * Copyright (c) 2026 IqraTime. All Rights Reserved.
 * IqraTime is proprietary software — see LICENSE and NOTICE.md at the
 * repository root. No license is granted to any other party.
 *
 * Plain CommonJS data shared between app.config.ts (loaded by the Expo CLI
 * in a plain Node context, which cannot resolve a local TypeScript module
 * import) and src/config/appConfig.ts (loaded by Metro/TypeScript inside
 * the app, which can). This file must stay dependency-free, untyped, and
 * a `.js` CommonJS module for exactly that reason — do not convert it to
 * TypeScript. See docs/ARCHITECTURE.md.
 *
 * This is the single source of truth for brand/publishing identity;
 * src/config/appConfig.ts re-exports it with full TypeScript types added
 * for use inside the app.
 *
 * Renamed from "AyahNow" to "IqraTime" once the app grew beyond
 * Quran-only content to include hadith — "Iqra" ("Read", the first word
 * revealed to the Prophet ﷺ) plus "Time" (the notification-timing core
 * of the app). Only the name and identifiers below changed; the icon's
 * open-book/light/crescent artwork was never AyahNow-specific and needed
 * no redesign.
 */
module.exports = {
  appName: "IqraTime",
  tagline: {
    fr: "Et si chaque notification comptait vraiment ! Une āyah ou un hadith authentique, un peu de hassanat, inchAllah.",
    alt_fr: "Le Coran et les hadiths sur votre écran, sans déverrouiller — une source de hassanat, inchAllah.",
  },
  version: "1.9.4",
  buildNumber: 25,
  iosBundleIdentifier: "com.IqraTime.com",
  // Permanent: Google Play binds a listing to its package name for life —
  // it can never be changed after the first publish, only replaced by a
  // brand-new listing. All-lowercase because Play requires it, so it can't
  // mirror the mixed-case iOS bundle id above verbatim. (The previous
  // com.example.* placeholder would have been rejected outright: Play
  // blocks that prefix.)
  androidPackage: "com.iqratime.app",
  easProjectId: "5aa33698-7d7f-424c-845f-1a1e548ec93e",
  contactEmail: "support@iqratime.com",
  // The public site backing the app. Surfaced in-app (About screen) rather
  // than kept as store-listing-only metadata: a Quran/hadith app asks for a
  // lot of trust, and a reachable site, privacy policy and support address
  // are the cheapest, most direct way to earn it.
  websiteUrl: "https://iqratime.com/index.html",
  privacyPolicyUrl: "https://iqratime.com/privacy.html",
  contactUrl: "https://iqratime.com/contact.html",
  deepLinkScheme: "iqratime",
  // Real as of the app's creation in App Store Connect (Apple ID
  // 6804868769) — see docs/RELEASE_CHECKLIST.md. Shares now include the
  // real iOS link again, via buildGetTheAppLine()'s PROVISIONAL check.
  iosAppStoreUrl: "https://apps.apple.com/app/id6804868769",
  brand: {
    // Darkest stop of the app icon's night sky — used wherever the UI should
    // read as an extension of the icon (the immersive ayah feed, splash).
    night: "#081C13",
    deepGreen: "#12372A",
    secondaryGreen: "#2F6B55",
    ivory: "#F7F3E8",
    warmWhite: "#FFFCF5",
    gold: "#C8A45D",
    // The icon's warm gold, bright enough to stay legible on `night`.
    goldLight: "#E4C170",
    darkText: "#17201C",
  },
  defaultSchedule: {
    // Full 24h coverage by default, no quiet-night blackout — every hour
    // 0 through 23 gets a slot (see dailyLocalTimes() in
    // src/notifications/scheduler.ts: with frequencyHours=1 this walks
    // startHour..endHour inclusive, so 0..23 is the complete day, not 0..22).
    // Still fully user-adjustable from Settings after first launch.
    startHour: 0,
    endHour: 23,
    frequencyHours: 1,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    quietNightEnabled: false,
  },
  notificationLimits: {
    iosEffectivePendingLimit: 64,
    iosSafetyMargin: 6,
    androidSoftLimit: 200,
  },
  supportedLocales: ["ar", "en", "fr", "es", "pt", "hi", "bn", "zh-CN", "it", "ru", "nl", "de"],
  fallbackLocale: "en",
};
