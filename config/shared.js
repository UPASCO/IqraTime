/**
 * Copyright (c) 2026 Nadir Echaara. All Rights Reserved.
 * AyahNow is proprietary software — see LICENSE and NOTICE.md at the
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
 */
module.exports = {
  appName: "AyahNow",
  tagline: {
    fr: "Et si le Coran venait à vous ! Une notification d'Ayah différente par heure.",
    alt_fr: "Le Coran sur votre écran, sans déverrouiller.",
  },
  version: "0.1.0",
  buildNumber: 1,
  iosBundleIdentifier: "com.example.ayahnow.provisional",
  androidPackage: "com.example.ayahnow.provisional",
  easProjectId: "5aa33698-7d7f-424c-845f-1a1e548ec93e",
  contactEmail: "contact@ayahnow.example",
  privacyPolicyUrl: "https://ayahnow.example/privacy",
  deepLinkScheme: "ayahnow",
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
    startHour: 8,
    endHour: 22,
    frequencyHours: 1,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    quietNightEnabled: true,
  },
  notificationLimits: {
    iosEffectivePendingLimit: 64,
    iosSafetyMargin: 6,
    androidSoftLimit: 200,
  },
  supportedLocales: ["ar", "en", "fr", "es", "pt", "hi", "bn", "zh-CN", "it", "ru"],
  fallbackLocale: "en",
};
