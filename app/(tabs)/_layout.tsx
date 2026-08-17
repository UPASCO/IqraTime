import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Bottom tab bar: Home, History, Favorites, Settings. No hamburger menu,
 * icon + visible label on every tab, RTL-aware (expo-router's Tabs sit on
 * React Navigation's bottom-tabs, which mirrors tab order automatically
 * once native RTL layout is active — see docs/ACCESSIBILITY.md for the
 * "restart recommended" caveat on a live language switch).
 */
export default function TabsLayout(): React.JSX.Element {
  const { colors, typography } = useTheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: typography.sizes.caption, fontWeight: typography.weights.medium },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.title"),
          tabBarLabel: t("home.title"),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: t("home.title"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("history.title"),
          tabBarLabel: t("history.title"),
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: t("history.title"),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("favorites.title"),
          tabBarLabel: t("favorites.title"),
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: t("favorites.title"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarLabel: t("settings.title"),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: t("settings.title"),
        }}
      />
    </Tabs>
  );
}
