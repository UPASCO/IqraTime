import React, { useState } from "react";
import { View, Pressable, Text, Platform, StyleSheet } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { formatTime } from "@/utils/dateUtils";

export interface TimeSelectorProps {
  label: string;
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

/**
 * Wraps @react-native-community/datetimepicker. This package works inside
 * Expo Go as well as custom Development Builds (no config plugin needed
 * for the basic clock-picker mode used here) — see docs/NOTIFICATIONS.md
 * "Time picker" for the one caveat: on Android the picker opens as a
 * system dialog (imperative), while iOS renders inline/as a spinner.
 */
export function TimeSelector({ label, hour, minute, onChange }: TimeSelectorProps): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);

  const value = new Date();
  value.setHours(hour, minute, 0, 0);

  const handleChange = (event: DateTimePickerEvent, selected?: Date): void => {
    setOpen(false);
    if (event.type === "dismissed" || !selected) return;
    onChange(selected.getHours(), selected.getMinutes());
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatTime(hour, minute, locale)}`}
        style={[
          styles.field,
          { borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: spacing.sm },
        ]}
      >
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
          {formatTime(hour, minute, locale)}
        </Text>
      </Pressable>
      {open && Platform.OS !== "web" ? (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { minHeight: 44, justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
});
