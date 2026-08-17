import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export interface EmptyStateProps {
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.xl, gap: spacing.sm }]} accessibilityRole="text">
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.sizes.subtitle * fontScaleMultiplier,
          fontWeight: typography.weights.semibold,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.sizes.body * fontScaleMultiplier,
            textAlign: "center",
          }}
        >
          {body}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
