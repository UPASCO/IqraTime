import React from "react";
import { Text, StyleSheet, type StyleProp, type TextStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export interface ArabicTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

/** Right-aligned, RTL-flagged Arabic text block. Never truncates (no numberOfLines) — a longer ayah simply wraps and scrolls with its container. */
export function ArabicText({ text, style }: ArabicTextProps): React.JSX.Element {
  const { colors, typography, fontScaleMultiplier } = useTheme();
  return (
    <Text
      accessibilityLanguage="ar"
      style={[
        styles.text,
        {
          color: colors.textPrimary,
          fontSize: typography.sizes.arabicBody * fontScaleMultiplier,
          lineHeight: typography.lineHeights.arabicBody * fontScaleMultiplier,
          fontFamily: typography.fontFamilyArabic,
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { textAlign: "right", writingDirection: "rtl" },
});
