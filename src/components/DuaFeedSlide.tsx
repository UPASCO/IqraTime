import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";

export interface DuaFeedSlideProps {
  height: number;
  /** Localized functional title, e.g. "Invocation avant de dormir". */
  title: string;
  arabicText: string;
  transliteration?: string;
  translationText?: string;
  source?: string;
  showSwipeHint?: boolean;
  onShare?: () => void;
  onCopy?: () => void;
  onOpenDetail?: () => void;
}

/**
 * One invocation as a full-bleed feed slide — the same immersive night
 * canvas and reading layout as AyahFeedSlide (title where the surah
 * reference goes, Arabic first, translation under it), so swiping from an
 * āyah to a dua feels like turning a page, not changing apps.
 */
export function DuaFeedSlide(props: DuaFeedSlideProps): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const [justCopied, setJustCopied] = React.useState(false);
  // Same Android nested-scroll trap as AyahFeedSlide: only let the inner
  // ScrollView take the gesture when the dua genuinely overflows.
  const [contentOverflows, setContentOverflows] = React.useState(false);

  const handleCopy = (): void => {
    props.onCopy?.();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  return (
    <View style={[styles.slide, { height: props.height, backgroundColor: appConfig.brand.night }]}>
      <ScrollView
        style={styles.tapArea}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={contentOverflows}
        nestedScrollEnabled
        onContentSizeChange={(_w, contentHeight) => setContentOverflows(contentHeight > props.height)}
      >
        <Pressable
          onPress={props.onOpenDetail}
          accessibilityRole={props.onOpenDetail ? "button" : undefined}
          accessibilityLabel={`${props.title}. ${props.translationText ?? ""}`}
        >
          <View style={{ gap: spacing.lg, paddingLeft: spacing.lg, paddingRight: spacing.lg + 56 }}>
            <Text
              style={{
                color: appConfig.brand.goldLight,
                fontWeight: typography.weights.semibold,
                fontSize: typography.sizes.body * fontScaleMultiplier,
                letterSpacing: 1,
              }}
            >
              {props.title.toUpperCase()}
            </Text>

            <Text
              accessibilityLanguage="ar"
              style={{
                color: appConfig.brand.warmWhite,
                fontSize: typography.sizes.arabicBody * fontScaleMultiplier * 1.15,
                lineHeight: typography.lineHeights.arabicBody * fontScaleMultiplier * 1.2,
                textAlign: "right",
                writingDirection: "rtl",
                fontWeight: "500",
              }}
            >
              {props.arabicText}
            </Text>

            {props.transliteration ? (
              <Text
                style={{
                  color: appConfig.brand.ivory,
                  opacity: 0.7,
                  fontStyle: "italic",
                  fontSize: typography.sizes.body * fontScaleMultiplier,
                }}
              >
                {props.transliteration}
              </Text>
            ) : null}

            {props.translationText ? (
              <Text
                style={{
                  color: appConfig.brand.ivory,
                  opacity: 0.92,
                  fontSize: typography.sizes.subtitle * fontScaleMultiplier,
                  lineHeight: typography.sizes.subtitle * 1.5 * fontScaleMultiplier,
                }}
              >
                {props.translationText}
              </Text>
            ) : null}

            {props.source ? (
              <Text style={{ color: appConfig.brand.ivory, opacity: 0.55, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                {props.source}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </ScrollView>

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
            accessibilityLabel={t("duas.title")}
          >
            <Ionicons name="flower-outline" size={22} color={appConfig.brand.warmWhite} />
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
  tapArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "flex-start", paddingTop: 32, paddingBottom: 24 },
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
