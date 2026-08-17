import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "./Button";

export interface NotificationStatusCardProps {
  message: string;
  tone?: "info" | "warning";
  actionLabel?: string;
  onAction?: () => void;
}

/** A small, dismissable-by-nature status card shown on Home only when there is something useful to say (spec: "afficher une petite carte uniquement si elle apporte une information utile"). */
export function NotificationStatusCard({ message, tone = "info", actionLabel, onAction }: NotificationStatusCardProps): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const iconColor = tone === "warning" ? colors.warning : colors.accentMuted;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radii.md,
          borderColor: tone === "warning" ? colors.warning : colors.border,
          padding: spacing.sm,
          gap: spacing.xs,
        },
      ]}
      accessibilityRole="summary"
    >
      <View style={styles.row}>
        <Ionicons name={tone === "warning" ? "alert-circle-outline" : "notifications-outline"} size={18} color={iconColor} />
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.sizes.caption * fontScaleMultiplier,
            flex: 1,
          }}
        >
          {message}
        </Text>
      </View>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
