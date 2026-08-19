import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

/**
 * Settings-style section heading. Draws a full-width rule above itself so
 * consecutive groups of rows read as distinct blocks rather than one long
 * undifferentiated list; `first` omits the rule at the top of a screen.
 */
export function SectionHeader({ title, first }: { title: string; first?: boolean }): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  return (
    <View
      style={{
        marginTop: first ? spacing.xs : spacing.xl,
        marginBottom: spacing.xs,
        paddingTop: first ? 0 : spacing.md,
        borderTopWidth: first ? 0 : StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          color: colors.gold,
          fontSize: typography.sizes.caption * fontScaleMultiplier,
          fontWeight: typography.weights.bold,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
