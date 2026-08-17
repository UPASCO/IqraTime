import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function ThemeBadge({ label }: { label: string }): React.JSX.Element {
  const { colors, radii, spacing, typography, fontScaleMultiplier } = useTheme();
  return (
    <View
      accessibilityRole="text"
      style={[
        styles.badge,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
        },
      ]}
    >
      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: StyleSheet.hairlineWidth, alignSelf: "flex-start" },
});
