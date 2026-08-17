import React from "react";
import { ScrollView, View, StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/** Base screen container: safe area, theme background, RTL-aware writing direction, optional scroll. */
export function Screen({ children, scroll = true, style, contentContainerStyle }: ScreenProps): React.JSX.Element {
  const { colors, spacing } = useTheme();
  const { direction } = useI18n();

  const content = (
    <View
      style={[{ flex: scroll ? undefined : 1, padding: spacing.md, direction }, contentContainerStyle]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }, style]} edges={["top", "left", "right"]}>
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
