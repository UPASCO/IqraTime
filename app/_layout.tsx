import React, { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { I18nProvider, applyNativeLayoutDirection } from "@/i18n/I18nProvider";
import { AppDatabaseProvider, useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import {
  registerNotificationCategory,
  ensureAndroidNotificationChannels,
  registerBackgroundRequeueTask,
  useNotificationResponseHandler,
} from "@/notifications";
import { reschedule } from "@/notifications/rescheduleService";
import { detectTimeZone } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import { ayahIdToRouteParam } from "@/utils/routeParams";

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * The system status bar (clock/battery/signal icons) never tracks the
 * in-app theme choice on its own — without this, choosing "Dark" while the
 * device is in system light mode (or vice versa) leaves icons the wrong
 * color against the app's background. `expo-status-bar`'s "auto" mode goes
 * by the device's system scheme, not resolvedScheme, so it has to be driven
 * explicitly here.
 */
function ThemedStatusBar(): React.JSX.Element {
  const { resolvedScheme } = useTheme();
  return <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />;
}

function NotificationRouting(): null {
  const router = useRouter();

  useNotificationResponseHandler(
    useCallback(
      (action) => {
        if (!action.data) return;
        router.push(`/ayah/${ayahIdToRouteParam(action.data.ayahId)}`);
      },
      [router],
    ),
  );

  return null;
}

function AutoRescheduler(): null {
  const db = useAppDatabase();
  const { preferences, hydrated } = usePreferencesStore();

  const runReschedule = useCallback(() => {
    if (!db || !hydrated) return;
    reschedule({
      db,
      preferences,
      now: new Date(),
      timeZone: detectTimeZone(),
      generateId: generateLocalId,
    }).catch(() => {
      // Failures are recorded per-slot inside reschedule(); nothing further to do here.
    });
  }, [db, hydrated, preferences]);

  useEffect(() => {
    runReschedule();
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") runReschedule();
    });
    return () => sub.remove();
  }, [runReschedule]);

  return null;
}

function RootNavigator(): React.JSX.Element {
  const { preferences, hydrated, hydrate } = usePreferencesStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
    ensureAndroidNotificationChannels().catch(() => {});
    registerBackgroundRequeueTask().catch(() => {});
  }, [hydrate]);

  useEffect(() => {
    if (ready) {
      applyNativeLayoutDirection(preferences.interfaceLocale);
      registerNotificationCategory(preferences.interfaceLocale).catch(() => {});
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, preferences.interfaceLocale]);

  if (!ready || !hydrated) {
    return <></>;
  }

  return (
    <ThemeProvider initialMode={preferences.appThemeMode} initialTextSizeScale={preferences.textSizeScale}>
      <I18nProvider locale={preferences.interfaceLocale}>
        <AppDatabaseProvider>
          <ThemedStatusBar />
          <NotificationRouting />
          <AutoRescheduler />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding/index" />
            <Stack.Screen name="(tabs)" />
            {/* Every screen below pushes as a plain "card" — one uniform
                stack for the whole app. Mixing "modal" (for a list/menu)
                with a further "card" push on top of it (its own detail
                screen) produced a compounding shrink/zoom artifact on iOS
                and made "back" behave inconsistently; a single push model
                fixes both. */}
            <Stack.Screen name="ayah/[id]" options={{ presentation: "card" }} />
            <Stack.Screen name="hadith/[id]" options={{ presentation: "card" }} />
            <Stack.Screen name="themes" options={{ presentation: "card" }} />
            <Stack.Screen name="library" options={{ presentation: "card" }} />
            <Stack.Screen name="progress" options={{ presentation: "card" }} />
            <Stack.Screen name="moment/index" options={{ presentation: "card" }} />
            <Stack.Screen name="quran/index" options={{ presentation: "card" }} />
            <Stack.Screen name="quran/[surah]" options={{ presentation: "card" }} />
            <Stack.Screen name="hadith/index" options={{ presentation: "card" }} />
            <Stack.Screen name="hifz/index" options={{ presentation: "card" }} />
            <Stack.Screen name="diagnostics" />
            <Stack.Screen name="sources" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="about" />
            <Stack.Screen name="support" />
          </Stack>
        </AppDatabaseProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default function RootLayout(): React.JSX.Element {
  return <RootNavigator />;
}
