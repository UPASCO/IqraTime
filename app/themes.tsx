import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

import { Screen, Chip, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { ALL_THEME_KEYS, type ThemeKey } from "@/domain/types";

export default function ThemesScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { preferences, update } = usePreferencesStore();

  const toggle = (theme: ThemeKey): void => {
    const has = preferences.selectedThemes.includes(theme);
    const next = has ? preferences.selectedThemes.filter((th) => th !== theme) : [...preferences.selectedThemes, theme];
    update({ selectedThemes: next, selectionMode: next.length > 0 ? "chosen_themes" : "balanced_random" });
  };

  return (
    <Screen onBack={() => router.back()}>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("themes.title")}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("themes.subtitle")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ALL_THEME_KEYS.map((theme) => (
            <Chip
              key={theme}
              label={t(`themes.names.${theme}` as Parameters<typeof t>[0])}
              selected={preferences.selectedThemes.includes(theme)}
              onPress={() => toggle(theme)}
            />
          ))}
        </View>
        <Button
          label={t("themes.resetCta")}
          variant="secondary"
          onPress={() => update({ selectedThemes: [], selectionMode: "balanced_random" })}
        />
      </View>
    </Screen>
  );
}
