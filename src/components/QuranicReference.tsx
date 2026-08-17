import React from "react";
import { Text } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

export function QuranicReference({ surah, ayah }: { surah: number; ayah: number }): React.JSX.Element {
  const { colors, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();

  return (
    <Text
      accessibilityRole="text"
      style={{
        color: colors.gold,
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.caption * fontScaleMultiplier,
      }}
    >
      {t("ayah.surahLabel")} {surah}:{ayah}
    </Text>
  );
}
