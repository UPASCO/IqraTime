import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

export interface TranslationTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

/** Translation text, aligned naturally for the active interface/translation language direction. Never truncates. */
export function TranslationText({ text, style }: TranslationTextProps): React.JSX.Element {
  const { colors, typography, fontScaleMultiplier } = useTheme();
  const { direction } = useI18n();
  return (
    <Text
      style={[
        {
          color: colors.textPrimary,
          fontSize: typography.sizes.body * fontScaleMultiplier,
          lineHeight: typography.lineHeights.body * fontScaleMultiplier,
          textAlign: direction === "rtl" ? "right" : "left",
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}
