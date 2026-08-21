import React, { useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";

export interface HadithFeedSlideProps {
  height: number;
  collectionDisplayName: string;
  hadithNumber: number;
  arabicText?: string;
  translationText?: string;
  translatorLabel?: string;
  textOrder: "arabic_first" | "translation_first";
  isFavorite?: boolean;
  showSwipeHint?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onOpenDetail?: () => void;
}

/**
 * The hadith counterpart to AyahFeedSlide, same immersive brand-palette
 * card. A hadith reference (collection + number) stands in for the
 * surah:ayah reference, and there are no theme pills — hadith entries
 * aren't theme-tagged yet.
 */
export function HadithFeedSlide(props: HadithFeedSlideProps): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, direction } = useI18n();
  const [justCopied, setJustCopied] = React.useState(false);
  const shotRef = useRef<ViewShotRef>(null);

  const handleCopy = (): void => {
    props.onCopy?.();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  const handleShare = async (): Promise<void> => {
    try {
      const uri = await shotRef.current?.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: t("home.shareCta") });
        return;
      }
    } catch {
      // Fall through to the plain-text share below.
    }
    props.onShare?.();
  };

  const referenceLabel = `${props.collectionDisplayName} #${props.hadithNumber}`;

  const arabicBlock = props.arabicText ? (
    <Text
      style={[
        styles.arabicText,
        {
          color: appConfig.brand.warmWhite,
          fontSize: typography.sizes.arabicBody * fontScaleMultiplier * 1.05,
          lineHeight: typography.lineHeights.arabicBody * fontScaleMultiplier * 1.1,
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
      <ViewShot ref={shotRef} style={[styles.tapArea, { backgroundColor: appConfig.brand.night }]} options={{ format: "png", quality: 0.95 }}>
      <ScrollView style={styles.tapArea} contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={props.onOpenDetail}
          accessibilityRole={props.onOpenDetail ? "button" : undefined}
          accessibilityLabel={props.onOpenDetail ? `${referenceLabel}. ${props.translationText ?? ""}` : undefined}
        >
          <View style={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <View style={[styles.hadithPill, { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs }]}>
                <Text style={{ color: appConfig.brand.night, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
                  {t("hadith.badgeLabel")}
                </Text>
              </View>
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
            </View>

            <View style={{ gap: spacing.md }}>
              {orderedBlocks.map((block, index) => (block ? <React.Fragment key={index}>{block}</React.Fragment> : null))}
            </View>

            {props.translatorLabel ? (
              <Text style={{ color: appConfig.brand.ivory, opacity: 0.55, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                {props.translatorLabel}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </ScrollView>
      </ViewShot>

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
            <Ionicons name={props.isFavorite ? "heart" : "heart-outline"} size={26} color={props.isFavorite ? appConfig.brand.goldLight : appConfig.brand.warmWhite} />
          </Pressable>
        ) : null}
        {props.onShare ? (
          <Pressable
            onPress={handleShare}
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
          <Text style={{ color: appConfig.brand.ivory, opacity: 0.6, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{t("home.swipeHint")}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { width: "100%", justifyContent: "center" },
  tapArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  arabicText: { textAlign: "right", writingDirection: "rtl", fontWeight: "500" },
  hadithPill: { backgroundColor: "rgba(228,193,112,0.9)", borderRadius: 999 },
  rail: { position: "absolute", right: 16, bottom: 96, alignItems: "center" },
  railButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.18)", alignItems: "center", justifyContent: "center" },
  swipeHint: { position: "absolute", bottom: 28, alignSelf: "center", alignItems: "center", gap: 2 },
});
