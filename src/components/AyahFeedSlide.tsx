import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import type { TextOrder } from "@/domain/types";

export interface AyahFeedSlideProps {
  height: number;
  surah: number;
  ayah: number;
  arabicText?: string;
  translationText?: string;
  translatorLabel?: string;
  themeLabels?: readonly string[];
  textOrder: TextOrder;
  isFavorite?: boolean;
  showSwipeHint?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onOpenDetail?: () => void;
}

/** One full-bleed, immersive slide in the swipeable ayah feed — always the fixed brand palette, independent of light/dark theme, like a splash/hero moment rather than a themed UI surface. */
export function AyahFeedSlide(props: AyahFeedSlideProps): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, direction } = useI18n();
  const [justCopied, setJustCopied] = React.useState(false);

  const handleCopy = (): void => {
    props.onCopy?.();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  const referenceLabel = `${t("ayah.surahLabel")} ${props.surah}:${props.ayah}`;

  const arabicBlock = props.arabicText ? (
    <Text
      style={[
        styles.arabicText,
        {
          color: appConfig.brand.warmWhite,
          fontSize: typography.sizes.arabicBody * fontScaleMultiplier * 1.15,
          lineHeight: typography.lineHeights.arabicBody * fontScaleMultiplier * 1.2,
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
        color: appConfig.brand.ivory,
        opacity: 0.92,
        fontSize: typography.sizes.subtitle * fontScaleMultiplier,
        lineHeight: typography.sizes.subtitle * 1.5 * fontScaleMultiplier,
        textAlign: direction === "rtl" ? "right" : "left",
      }}
    >
      {props.translationText}
    </Text>
  ) : null;

  const orderedBlocks =
    props.textOrder === "arabic_first" ? [arabicBlock, translationBlock] : [translationBlock, arabicBlock];

  return (
    <View style={[styles.slide, { height: props.height, backgroundColor: appConfig.brand.night }]}>
      <Pressable
        onPress={props.onOpenDetail}
        style={styles.tapArea}
        accessibilityRole={props.onOpenDetail ? "button" : undefined}
        accessibilityLabel={props.onOpenDetail ? `${referenceLabel}. ${props.translationText ?? ""}` : undefined}
      >
        <View style={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
          <Text
            style={{
              color: appConfig.brand.goldLight,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body * fontScaleMultiplier,
              letterSpacing: 1,
            }}
          >
            {referenceLabel.toUpperCase()}
          </Text>

          <View style={{ gap: spacing.md }}>
            {orderedBlocks.map((block, index) => (block ? <React.Fragment key={index}>{block}</React.Fragment> : null))}
          </View>

          {props.translatorLabel ? (
            <Text style={{ color: appConfig.brand.ivory, opacity: 0.55, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
              {props.translatorLabel}
            </Text>
          ) : null}

          {props.themeLabels && props.themeLabels.length > 0 ? (
            <View style={styles.themeRow}>
              {props.themeLabels.map((label) => (
                <View key={label} style={[styles.themePill, { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs }]}>
                  <Text style={{ color: appConfig.brand.ivory, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={[styles.rail, { gap: spacing.lg }]}>
        {props.onToggleFavorite ? (
          <Pressable
            onPress={props.onToggleFavorite}
            hitSlop={8}
            style={({ pressed }) => [styles.railButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
            accessibilityRole="button"
            accessibilityLabel={props.isFavorite ? t("home.favoriteRemove") : t("home.favoriteAdd")}
            accessibilityState={{ selected: !!props.isFavorite }}
          >
            <Ionicons
              name={props.isFavorite ? "heart" : "heart-outline"}
              size={26}
              color={props.isFavorite ? appConfig.brand.goldLight : appConfig.brand.warmWhite}
            />
          </Pressable>
        ) : null}
        {props.onShare ? (
          <Pressable
            onPress={props.onShare}
            hitSlop={8}
            style={({ pressed }) => [styles.railButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
            accessibilityRole="button"
            accessibilityLabel={t("home.shareCta")}
          >
            <Ionicons name="share-outline" size={23} color={appConfig.brand.warmWhite} />
          </Pressable>
        ) : null}
        {props.onCopy ? (
          <Pressable
            onPress={handleCopy}
            hitSlop={8}
            style={({ pressed }) => [styles.railButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
            accessibilityRole="button"
            accessibilityLabel={justCopied ? t("home.copiedConfirmation") : t("home.copyCta")}
          >
            <Ionicons name={justCopied ? "checkmark" : "copy-outline"} size={21} color={justCopied ? appConfig.brand.goldLight : appConfig.brand.warmWhite} />
          </Pressable>
        ) : null}
      </View>

      {props.showSwipeHint ? (
        <View style={styles.swipeHint} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Ionicons name="chevron-up" size={18} color={appConfig.brand.ivory} style={{ opacity: 0.6 }} />
          <Text style={{ color: appConfig.brand.ivory, opacity: 0.6, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("home.swipeHint")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { width: "100%", justifyContent: "center" },
  tapArea: { flex: 1, justifyContent: "center" },
  arabicText: { textAlign: "right", writingDirection: "rtl", fontWeight: "500" },
  themeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  themePill: { backgroundColor: "rgba(247,243,232,0.14)", borderRadius: 999 },
  rail: { position: "absolute", right: 16, bottom: 96, alignItems: "center" },
  railButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  swipeHint: { position: "absolute", bottom: 28, alignSelf: "center", alignItems: "center", gap: 2 },
});
