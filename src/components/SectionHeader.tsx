import React from "react";
import { Text } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function SectionHeader({ title }: { title: string }): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{
        color: colors.textSecondary,
        fontSize: typography.sizes.caption * fontScaleMultiplier,
        fontWeight: typography.weights.semibold,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
      }}
    >
      {title}
    </Text>
  );
}
