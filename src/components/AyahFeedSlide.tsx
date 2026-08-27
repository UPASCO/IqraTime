import React, { useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Share, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

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
  themeLabels?: readonly string[];
  textOrder: TextOrder;
  isFavorite?: boolean;
  showSwipeHint?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  /** Fires the moment the share button is tapped, regardless of whether the image capture or the plain-text fallback ends up being used — the single point for counting a share attempt. */
  onShareAttempted?: () => void;
  /** The same plain-text share content `onShare` would send alone — attached alongside the captured image on iOS, where the native share sheet supports both together (unlike Android, where combining a local file with text reliably needs a content:// URI expo-sharing already handles; there the image ships alone, same as before). */
  shareText?: string;
  onCopy?: () => void;
  onOpenDetail?: () => void;
  /**
   * Opens the ayah's tafsir. Pass only when a tafsir actually exists for
   * this ayah in the reader's language (3 of 12 locales have no edition at
   * all — see docs/CORPUS.md "Tafsir"), so the rail never offers a button
   * that leads to an "unavailable" message.
   */
  onOpenTafsir?: () => void;
}

/** One full-bleed, immersive slide in the swipeable ayah feed — always the fixed brand palette, independent of light/dark theme, like a splash/hero moment rather than a themed UI surface. */
export function AyahFeedSlide(props: AyahFeedSlideProps): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, direction } = useI18n();
  const [justCopied, setJustCopied] = React.useState(false);
  const [isPreparingShareImage, setIsPreparingShareImage] = React.useState(false);
  const shotRef = useRef<ViewShotRef>(null);

  const handleCopy = (): void => {
    props.onCopy?.();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  /**
   * Shares a rendered image of the card itself (exactly what's on screen,
   * minus the floating action rail) rather than plain text — a proper
   * quote card instead of a wall of unstyled text in the recipient's chat.
   * Falls back to the plain-text share the parent screen supplies if the
   * capture or the native share sheet is unavailable for any reason.
   *
   * The brand/download footer only exists for the captured image, not for
   * someone just swiping through the feed — so it's mounted right before
   * capture and unmounted right after, rather than always being on screen.
   */
  const handleShare = async (): Promise<void> => {
    props.onShareAttempted?.();
    try {
      setIsPreparingShareImage(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const uri = await shotRef.current?.capture?.();
      setIsPreparingShareImage(false);
      if (uri && Platform.OS === "ios") {
        // iOS's native share sheet supports a local file url and a message
        // together — the only way to actually deliver "the āyah + the
        // download link" alongside the image, since expo-sharing's
        // image-only API (used below for Android) has no way to attach text.
        await Share.share({ url: uri, message: props.shareText ?? "" });
        return;
      }
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: t("home.shareCta") });
        return;
      }
    } catch {
      setIsPreparingShareImage(false);
      // Fall through to the plain-text share below.
    }
    props.onShare?.();
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
      {/* The longest āyāt (Āyat al-Kursī sets the ceiling) can just exceed a
          phone screen, so the slide scrolls internally. `bounces={false}`
          matters: at the top/bottom edge the gesture is handed straight back
          to the paging list instead of rubber-banding, so swiping between
          āyāt still feels immediate. */}
      <ViewShot ref={shotRef} style={[styles.tapArea, { backgroundColor: appConfig.brand.night }]} options={{ format: "png", quality: 0.95 }}>
      <ScrollView
        style={styles.tapArea}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={props.onOpenDetail}
          accessibilityRole={props.onOpenDetail ? "button" : undefined}
          accessibilityLabel={props.onOpenDetail ? `${referenceLabel}. ${props.translationText ?? ""}` : undefined}
        >
          {/* Right padding is wider than left: the favorite/share/copy rail is
              pinned to the physical right edge for the whole card height, so
              text needs a permanent clearance there — otherwise a long ayah's
              last lines render underneath the buttons, unreadable where the
              two overlap (spec: keep the action rail legible against text at
              every content length). */}
          <View style={{ gap: spacing.lg, paddingLeft: spacing.lg, paddingRight: spacing.lg + 56 }}>
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

          {props.themeLabels && props.themeLabels.length > 0 ? (
            <View style={styles.themeRow}>
              {props.themeLabels.map((label) => (
                <View key={label} style={[styles.themePill, { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs }]}>
                  <Text style={{ color: appConfig.brand.ivory, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{label}</Text>
                </View>
              ))}
            </View>
            ) : null}

          {/* Baked into the captured image only (mounted only while
              isPreparingShareImage is true — see handleShare) — not shown
              while swiping through the feed. Once shared, a screenshot or a
              forwarded image carries no text alongside it on most chat apps,
              so the card needs its own brand recall for a curious viewer to
              find the app afterwards. */}
          {isPreparingShareImage ? (
            <View style={[styles.brandFooter, { borderTopColor: "rgba(247,243,232,0.16)", paddingTop: spacing.sm }]}>
              <Text style={{ color: appConfig.brand.goldLight, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                {appConfig.appName}
              </Text>
              <Text style={{ color: appConfig.brand.ivory, opacity: 0.6, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                {t("common.imageBrandFooter")}
              </Text>
            </View>
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
            <Ionicons
              name={props.isFavorite ? "heart" : "heart-outline"}
              size={26}
              color={props.isFavorite ? appConfig.brand.goldLight : appConfig.brand.warmWhite}
            />
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
        {props.onOpenTafsir ? (
          <Pressable
            onPress={props.onOpenTafsir}
            hitSlop={8}
            style={({ pressed }) => [styles.railButton, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
            accessibilityRole="button"
            accessibilityLabel={t("ayah.tafsirShowCta")}
          >
            <Ionicons name="book-outline" size={22} color={appConfig.brand.warmWhite} />
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
  tapArea: { flex: 1 },
  // flex-start rather than center: on a tall device the slide fills most of
  // the screen below the header, and centering left the text floating in
  // empty space with nothing above it — reads as the app's body sitting
  // too low. Anchoring near the top instead puts it right under the header,
  // the way a reading app should look; longer ayat still scroll normally.
  scrollContent: { flexGrow: 1, justifyContent: "flex-start", paddingTop: 32, paddingBottom: 24 },
  arabicText: { textAlign: "right", writingDirection: "rtl", fontWeight: "500" },
  themeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  brandFooter: { borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
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
