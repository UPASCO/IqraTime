import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export function FavoriteButton({ isFavorite, onToggle, size = 24 }: FavoriteButtonProps): React.JSX.Element {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={({ pressed }) => [styles.hit, { opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? t("home.favoriteRemove") : t("home.favoriteAdd")}
      accessibilityState={{ selected: isFavorite }}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={size}
        color={isFavorite ? colors.gold : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
});
