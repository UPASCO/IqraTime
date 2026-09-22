import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import { FeedActionRail } from "./FeedActionRail";

export interface NameFeedSlideProps {
  height: number;
  number: number;
  arabic: string;
  transliteration: string;
  /** Localized one-line meaning; empty string for Arabic readers, where the name speaks for itself. */
  meaning: string;
  isFavorite?: boolean;
  isMemorized?: boolean;
  showSwipeHint?: boolean;
  onToggleFavorite?: () => void;
  onToggleMemorize?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onOpenDetail?: () => void;
}

/**
 * One Name of Allah as a full-bleed feed slide — same immersive night
 * canvas as AyahFeedSlide, but centered: a name is a single jewel, not a
 * paragraph, so it sits in the middle of the slide like calligraphy on a
 * wall rather than anchored top-left like reading matter.
 */
export function NameFeedSlide(props: NameFeedSlideProps): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();

  return (
    <View style={[styles.slide, { height: props.height, backgroundColor: appConfig.brand.night }]}>
      <Pressable
        onPress={props.onOpenDetail}
        accessibilityRole={props.onOpenDetail ? "button" : undefined}
        accessibilityLabel={`${props.transliteration}. ${props.meaning}`}
        style={styles.center}
      >
        <View style={{ alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingRight: spacing.lg + 40 }}>
          <Text
            style={{
              color: appConfig.brand.goldLight,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body * fontScaleMultiplier,
              letterSpacing: 2,
            }}
          >
            {t("names.positionLabel", { number: props.number }).toUpperCase()}
          </Text>
          <Text
            accessibilityLanguage="ar"
            style={{
              color: appConfig.brand.warmWhite,
              fontSize: 64 * fontScaleMultiplier,
              lineHeight: 96 * fontScaleMultiplier,
              writingDirection: "rtl",
              textAlign: "center",
            }}
          >
            {props.arabic}
          </Text>
          <Text style={{ color: appConfig.brand.goldLight, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
            {props.transliteration}
          </Text>
          {props.meaning ? (
            <Text
              style={{
                color: appConfig.brand.ivory,
                opacity: 0.92,
                fontSize: typography.sizes.subtitle * fontScaleMultiplier,
                textAlign: "center",
              }}
            >
              {props.meaning}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <FeedActionRail
        isFavorite={props.isFavorite}
        onToggleFavorite={props.onToggleFavorite}
        isMemorized={props.isMemorized}
        onToggleMemorize={props.onToggleMemorize}
        onShare={props.onShare}
        onCopy={props.onCopy}
        onExpand={props.onOpenDetail}
      />

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
  slide: { width: "100%" },
  center: { flex: 1, justifyContent: "center" },
  swipeHint: { position: "absolute", bottom: 28, alignSelf: "center", alignItems: "center", gap: 2 },
});
