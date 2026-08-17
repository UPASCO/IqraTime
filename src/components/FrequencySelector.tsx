import React from "react";
import { View, StyleSheet } from "react-native";

import { FREQUENCY_OPTIONS_HOURS } from "@/domain/constants";
import { useI18n } from "@/i18n/I18nProvider";
import { Chip } from "./Chip";

export interface FrequencySelectorProps {
  value: (typeof FREQUENCY_OPTIONS_HOURS)[number];
  onChange: (hours: (typeof FREQUENCY_OPTIONS_HOURS)[number]) => void;
}

export function FrequencySelector({ value, onChange }: FrequencySelectorProps): React.JSX.Element {
  const { tPlural } = useI18n();

  return (
    <View style={styles.row}>
      {FREQUENCY_OPTIONS_HOURS.map((hours) => (
        <Chip
          key={hours}
          label={tPlural("common.frequencyEveryHour", hours)}
          selected={value === hours}
          onPress={() => onChange(hours)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
