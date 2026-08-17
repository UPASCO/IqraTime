import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps): React.JSX.Element {
  const { colors, radii, spacing, typography, fontScaleMultiplier } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.accent : colors.surfaceElevated,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderColor: selected ? colors.accent : colors.border,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? colors.textOnAccent : colors.textPrimary,
          fontSize: typography.sizes.caption * fontScaleMultiplier,
          fontWeight: typography.weights.medium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: StyleSheet.hairlineWidth, minHeight: 36, justifyContent: "center" },
});
