import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  /**
   * Renders a consistent, always-visible back chevron above the content
   * when provided. The whole app's Stack runs with headerShown: false (see
   * app/_layout.tsx), so without this, a pushed screen's only way back was
   * the iOS edge-swipe gesture or the Android hardware/gesture back — real,
   * but not discoverable, and every screen that skipped this reads as a
   * dead end. Every pushed (non-tab-root) screen should pass this; omit it
   * only for the four tab roots (Home/History/Favorites/Settings), which
   * aren't pushed and have nothing to go "back" to.
   */
  onBack?: () => void;
  /** Optional label next to the chevron; defaults to t("common.back"). */
  backLabel?: string;
}

/** Base screen container: safe area, theme background, RTL-aware writing direction, optional scroll, optional back affordance. */
export function Screen({ children, scroll = true, style, contentContainerStyle, onBack, backLabel }: ScreenProps): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { direction, t } = useI18n();

  const content = (
    <View
      style={[{ flex: scroll ? undefined : 1, padding: spacing.md, direction }, contentContainerStyle]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }, style]} edges={["top", "left", "right"]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel ?? t("common.back")}
          hitSlop={8}
          style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: spacing.md, paddingTop: spacing.xs }}
        >
          <Ionicons name={direction === "rtl" ? "chevron-forward" : "chevron-back"} size={20} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
            {backLabel ?? t("common.back")}
          </Text>
        </Pressable>
      ) : null}
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
