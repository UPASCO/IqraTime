import React, { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { I18nProvider, applyNativeLayoutDirection } from "@/i18n/I18nProvider";
import { AppDatabaseProvider, useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { registerNotificationCategory, useNotificationResponseHandler } from "@/notifications";
import { reschedule } from "@/notifications/rescheduleService";
import { detectTimeZone } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import { ayahIdToRouteParam } from "@/utils/routeParams";

SplashScreen.preventAutoHideAsync().catch(() => {});

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
          <NotificationRouting />
          <AutoRescheduler />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding/index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ayah/[id]" options={{ presentation: "card" }} />
            <Stack.Screen name="themes" options={{ presentation: "modal" }} />
            <Stack.Screen name="diagnostics" />
            <Stack.Screen name="sources" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="about" />
          </Stack>
        </AppDatabaseProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default function RootLayout(): React.JSX.Element {
  return <RootNavigator />;
}
