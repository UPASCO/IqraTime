import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import { FeedActionRail } from "./FeedActionRail";

export interface DuaFeedSlideProps {
  height: number;
  /** Localized functional title, e.g. "Invocation avant de dormir". */
  title: string;
  arabicText: string;
  transliteration?: string;
  translationText?: string;
  source?: string;
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
 * One invocation as a full-bleed feed slide — the same immersive night
 * canvas and reading layout as AyahFeedSlide (title where the surah
 * reference goes, Arabic first, translation under it), so swiping from an
 * āyah to a dua feels like turning a page, not changing apps.
 */
export function DuaFeedSlide(props: DuaFeedSlideProps): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  // Never scrolls internally — see AyahFeedSlide: a vertical swipe on a
  // slide must always mean "next page"; overflowing text is clipped above
  // a "Read more" footer that opens the detail screen.
  const [contentOverflows, setContentOverflows] = React.useState(false);

  return (
    <View style={[styles.slide, { height: props.height, backgroundColor: appConfig.brand.night }]}>
      <ScrollView
        style={styles.tapArea}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
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

      {contentOverflows && props.onOpenDetail ? (
        <View style={styles.readMoreFooter}>
          <Pressable
            onPress={props.onOpenDetail}
            style={({ pressed }) => [styles.readMorePill, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={t("home.readMoreCta")}
          >
            <Text style={{ color: appConfig.brand.goldLight, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
              {t("home.readMoreCta")}
            </Text>
            <Ionicons name="expand-outline" size={14} color={appConfig.brand.goldLight} />
          </Pressable>
        </View>
      ) : null}

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
  tapArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "flex-start", paddingTop: 32, paddingBottom: 24 },
  swipeHint: { position: "absolute", bottom: 28, alignSelf: "center", alignItems: "center", gap: 2 },
  readMoreFooter: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(247,243,232,0.16)",
  },
  readMorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderColor: "rgba(212,180,131,0.5)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
