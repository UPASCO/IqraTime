import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";

import type { WeekdayIndex } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import { Chip } from "./Chip";

export interface DaySelectorProps {
  activeDays: readonly WeekdayIndex[];
  onChange: (days: WeekdayIndex[]) => void;
}

/** Row of 7 toggle chips for active weekdays, using locale-aware short weekday names (Sunday-first, matching WeekdayIndex/Date#getDay()). */
export function DaySelector({ activeDays, onChange }: DaySelectorProps): React.JSX.Element {
  const { locale } = useI18n();

  const labels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2023-01-01 was a Sunday; index 0..6 maps directly to WeekdayIndex.
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2023, 0, 1 + i)));
  }, [locale]);

  const activeSet = new Set(activeDays);

  const toggle = (day: WeekdayIndex): void => {
    const next = activeSet.has(day) ? activeDays.filter((d) => d !== day) : [...activeDays, day];
    onChange(next.sort((a, b) => a - b));
  };

  return (
    <View style={styles.row}>
      {labels.map((label, index) => (
        <Chip key={index} label={label} selected={activeSet.has(index as WeekdayIndex)} onPress={() => toggle(index as WeekdayIndex)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
