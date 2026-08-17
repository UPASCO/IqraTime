import type { ExpoConfig, ConfigContext } from "expo/config";
import { appConfig } from "./src/config/appConfig";

/**
 * Dynamic Expo config. Reads brand/publishing identity from
 * src/config/appConfig.ts so there is a single place to update before a
 * real store submission. See docs/RELEASE_CHECKLIST.md.
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
      backgroundColor: appConfig.brand.deepGreen,
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
  extra: {
    eas: {
      projectId: appConfig.easProjectId,
    },
  },
  owner: undefined,
});
