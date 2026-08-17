import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import type { TextOrder } from "@/domain/types";

export interface AyahCardProps {
  surah: number;
  ayah: number;
  arabicText?: string;
  translationText?: string;
  translatorLabel?: string;
  themeLabels?: readonly string[];
  textOrder: TextOrder;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onPress?: () => void;
  receivedAtLabel?: string;
}

export function AyahCard(props: AyahCardProps): React.JSX.Element {
  const { colors, spacing, radii, typography, shadows, fontScaleMultiplier } = useTheme();
  const { t, direction } = useI18n();

  const referenceLabel = `${t("ayah.surahLabel")} ${props.surah}:${props.ayah}`;

  const arabicBlock = props.arabicText ? (
    <Text
      style={[
        styles.arabicText,
        {
          color: colors.textPrimary,
          fontSize: typography.sizes.arabicBody * fontScaleMultiplier,
          lineHeight: typography.lineHeights.arabicBody * fontScaleMultiplier,
          fontFamily: typography.fontFamilyArabic,
        },
      ]}
      accessibilityLanguage="ar"
    >
      {props.arabicText}
    </Text>
  ) : null;

  const translationBlock = props.translationText ? (
    <Text
      style={{
        color: colors.textPrimary,
        fontSize: typography.sizes.body * fontScaleMultiplier,
        lineHeight: typography.lineHeights.body * fontScaleMultiplier,
        textAlign: direction === "rtl" ? "right" : "left",
      }}
    >
      {props.translationText}
    </Text>
  ) : null;

  const orderedBlocks =
    props.textOrder === "arabic_first" ? [arabicBlock, translationBlock] : [translationBlock, arabicBlock];

  const Wrapper = props.onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={props.onPress}
      accessibilityRole={props.onPress ? "button" : undefined}
      accessibilityLabel={props.onPress ? `${referenceLabel}. ${props.translationText ?? ""}` : undefined}
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderColor: colors.border,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {referenceLabel}
        </Text>
        {props.receivedAtLabel ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {props.receivedAtLabel}
          </Text>
        ) : null}
      </View>

      {orderedBlocks.map((block, index) => (block ? <React.Fragment key={index}>{block}</React.Fragment> : null))}

      {props.translatorLabel ? (
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("ayah.translatorLabel")}: {props.translatorLabel}
        </Text>
      ) : null}

      {props.themeLabels && props.themeLabels.length > 0 ? (
        <View style={styles.themeRow}>
          {props.themeLabels.map((label) => (
            <View
              key={label}
              style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xxs,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {(props.onToggleFavorite || props.onShare || props.onCopy) && (
        <View style={[styles.actionsRow, { gap: spacing.md, marginTop: spacing.xs }]}>
          {props.onToggleFavorite ? (
            <Pressable
              onPress={props.onToggleFavorite}
              accessibilityRole="button"
              accessibilityLabel={props.isFavorite ? t("home.favoriteRemove") : t("home.favoriteAdd")}
              hitSlop={8}
              style={styles.actionHit}
            >
              <Text style={{ color: props.isFavorite ? colors.gold : colors.textSecondary, fontSize: typography.sizes.body }}>
                {props.isFavorite ? "★" : "☆"}
              </Text>
            </Pressable>
          ) : null}
          {props.onShare ? (
            <Pressable onPress={props.onShare} accessibilityRole="button" accessibilityLabel={t("home.shareCta")} hitSlop={8} style={styles.actionHit}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body }}>{t("home.shareCta")}</Text>
            </Pressable>
          ) : null}
          {props.onCopy ? (
            <Pressable onPress={props.onCopy} accessibilityRole="button" accessibilityLabel={t("home.copyCta")} hitSlop={8} style={styles.actionHit}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body }}>{t("home.copyCta")}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  arabicText: { textAlign: "right", writingDirection: "rtl" },
  themeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  actionsRow: { flexDirection: "row", alignItems: "center" },
  actionHit: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center" },
});
