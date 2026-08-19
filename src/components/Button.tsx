import React from "react";
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
}

/** Primary interactive control. Minimum 44x44 hit target for accessibility; disabled state never relies on color alone (label + reduced opacity + disabled state announced to screen readers). */
export function Button({ label, onPress, variant = "primary", disabled, style, accessibilityHint, testID }: ButtonProps): React.JSX.Element {
  const { colors, radii, spacing, typography, fontScaleMultiplier } = useTheme();

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.accent, fg: colors.textOnAccent },
    secondary: { bg: colors.surfaceElevated, fg: colors.textPrimary, border: colors.border },
    ghost: { bg: "transparent", fg: colors.accent },
    danger: { bg: colors.danger, fg: colors.textOnAccent },
  };
  const p = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border ?? "transparent",
          borderWidth: p.border ? 1 : 0,
          borderRadius: radii.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <Text
        style={{
          color: p.fg,
          fontSize: typography.sizes.body * fontScaleMultiplier,
          fontWeight: typography.weights.semibold,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
