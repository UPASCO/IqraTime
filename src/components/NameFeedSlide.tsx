import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";

export interface NameFeedSlideProps {
  height: number;
  number: number;
  arabic: string;
  transliteration: string;
  /** Localized one-line meaning; empty string for Arabic readers, where the name speaks for itself. */
  meaning: string;
  showSwipeHint?: boolean;
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
  const [justCopied, setJustCopied] = React.useState(false);

  const handleCopy = (): void => {
    props.onCopy?.();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

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

      <View style={[styles.rail, { gap: spacing.lg }]}>
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
        {props.onOpenDetail ? (
          <Pressable
            onPress={props.onOpenDetail}
            hitSlop={8}
            style={({ pressed }) => [styles.railButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
            accessibilityRole="button"
            accessibilityLabel={t("names.title")}
          >
            <Ionicons name="diamond-outline" size={22} color={appConfig.brand.warmWhite} />
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
  slide: { width: "100%" },
  center: { flex: 1, justifyContent: "center" },
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
