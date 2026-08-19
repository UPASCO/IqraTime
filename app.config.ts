/**
 * Copyright (c) 2026 Nadir Echaara. All Rights Reserved.
 * AyahNow is proprietary software — see LICENSE and NOTICE.md at the
 * repository root. No license is granted to any other party.
 */
import type { ExpoConfig, ConfigContext } from "expo/config";
// eslint-disable-next-line @typescript-eslint/no-require-imports -- the Expo CLI loads this file in a plain Node context that cannot resolve a local TS module; see config/shared.js
const appConfig = require("./config/shared.js");

/**
 * Dynamic Expo config. Reads brand/publishing identity from
 * config/shared.js (the same raw data src/config/appConfig.ts types and
 * re-exports for in-app use) so there is a single place to update before
 * a real store submission. See docs/RELEASE_CHECKLIST.md.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appConfig.appName,
  slug: "ayahnow",
  scheme: appConfig.deepLinkScheme,
  version: appConfig.version,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  primaryColor: appConfig.brand.deepGreen,
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: appConfig.iosBundleIdentifier,
    buildNumber: String(appConfig.buildNumber),
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ["fetch", "remote-notification"],
      NSUserNotificationsUsageDescription:
        "AyahNow uses local notifications to deliver a Quran verse to your lock screen at the times you choose. No data leaves your device.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: appConfig.androidPackage,
    versionCode: appConfig.buildNumber,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: appConfig.brand.night,
    },
    permissions: [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.VIBRATE",
    ],
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    "expo-localization",
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: appConfig.brand.deepGreen,
        // Sound files are omitted from the demo build; see docs/NOTIFICATIONS.md
        // for how to add a licensed custom sound before production.
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: appConfig.brand.ivory,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  // The "extra.eas.projectId" field is only included once easProjectId
  // holds a real id from `eas init` — the PROVISIONAL placeholder must
  // never be sent as if it were a real project id (see config/shared.js),
  // otherwise EAS mistakenly reports the project as "already linked".
  ...(appConfig.easProjectId && appConfig.easProjectId !== "00000000-0000-0000-0000-000000000000"
    ? {
        extra: { eas: { projectId: appConfig.easProjectId } },
        updates: { url: `https://u.expo.dev/${appConfig.easProjectId}` },
      }
    : {}),
  runtimeVersion: { policy: "appVersion" },
  owner: undefined,
});
