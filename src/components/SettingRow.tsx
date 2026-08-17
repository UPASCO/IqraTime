import React from "react";
import { View, Text, Switch, Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export interface SettingRowProps {
  label: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  valueLabel?: string;
  disabled?: boolean;
}

/** One settings-screen row: either a toggle (value/onValueChange) or a navigable link (onPress + valueLabel). */
export function SettingRow(props: SettingRowProps): React.JSX.Element {
  const { colors, spacing, typography, border, fontScaleMultiplier } = useThemeWithBorder();

  const content = (
    <View style={[styles.row, { paddingVertical: spacing.sm, borderColor: border }]}>
      <View style={styles.textColumn}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{props.label}</Text>
        {props.description ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, marginTop: 2 }}>
            {props.description}
          </Text>
        ) : null}
      </View>
      {props.onValueChange ? (
        <Switch
          value={!!props.value}
          onValueChange={props.onValueChange}
          disabled={props.disabled}
          accessibilityLabel={props.label}
          trackColor={{ true: colors.accent, false: colors.border }}
        />
      ) : props.valueLabel !== undefined ? (
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{props.valueLabel}</Text>
      ) : null}
    </View>
  );

  if (props.onPress) {
    return (
      <Pressable onPress={props.onPress} accessibilityRole="button" accessibilityLabel={props.label} disabled={props.disabled}>
        {content}
      </Pressable>
    );
  }
  return content;
}

function useThemeWithBorder() {
  const theme = useTheme();
  return { ...theme, border: theme.colors.border };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  textColumn: { flex: 1, paddingEnd: 12 },
});
