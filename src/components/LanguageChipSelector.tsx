import React from "react";
import { View, StyleSheet } from "react-native";

import { appConfig, type SupportedLocale } from "@/config/appConfig";
import { LOCALE_NATIVE_NAMES } from "@/i18n/localeNames";
import { Chip } from "./Chip";

export interface LanguageChipSelectorProps {
  value: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
}

export function LanguageChipSelector({ value, onChange }: LanguageChipSelectorProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      {appConfig.supportedLocales.map((locale) => (
        <Chip key={locale} label={LOCALE_NATIVE_NAMES[locale]} selected={value === locale} onPress={() => onChange(locale)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
