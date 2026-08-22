import React, { useEffect, useState } from "react";
import { View, Text, Share, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { Screen, ArabicText, TranslationText, FavoriteButton, EmptyState, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useHadithView } from "@/hooks/useHadithView";
import { isHadithFavorite, addHadithFavorite, removeHadithFavorite } from "@/storage/hadithFavoritesStore";
import { routeParamToHadithId } from "@/utils/routeParams";
import { formatHadithShareText, buildGetTheAppLine } from "@/utils/shareText";
import { incrementShareCount } from "@/storage/shareCounterStore";

export default function HadithDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string }>();
  const hadithId = params.id ? routeParamToHadithId(params.id) : undefined;
  const router = useRouter();
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();

  const hadithView = useHadithView(hadithId, preferences.translationLocale);
  const [isFavorite, setIsFavorite] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!hadithId) return;
    isHadithFavorite(hadithId).then(setIsFavorite);
  }, [hadithId]);

  if (!hadithView.found) {
    return (
      <Screen>
        <EmptyState
          title={t("ayah.notFoundTitle")}
          body={t("ayah.notFoundBody")}
          action={<Button label={t("common.back")} onPress={() => router.back()} variant="secondary" />}
        />
      </Screen>
    );
  }

  const toggleFavorite = async (): Promise<void> => {
    if (!hadithId) return;
    if (isFavorite) {
      await removeHadithFavorite(hadithId);
    } else {
      await addHadithFavorite(hadithId);
    }
    setIsFavorite(!isFavorite);
  };

  const shareText = formatHadithShareText({
    translationText: hadithView.translationText,
    arabicText: hadithView.arabicText,
    collectionDisplayName: hadithView.collectionDisplayName,
    hadithNumber: hadithView.hadithNumber,
    includeArabic: preferences.showArabicText,
    includeTranslation: preferences.textDisplayMode !== "arabic_only",
    appName: t("common.appName"),
    getTheAppLine: buildGetTheAppLine(t("common.getTheAppShareLine")),
  });

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <Text style={{ color: colors.textOnAccent, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
                {t("hadith.badgeLabel")}
              </Text>
            </View>
            <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.subtitle * fontScaleMultiplier }}>
              {hadithView.collectionDisplayName} #{hadithView.hadithNumber}
            </Text>
          </View>
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </View>

        {preferences.showArabicText && hadithView.arabicText ? <ArabicText text={hadithView.arabicText} /> : null}
        {hadithView.translationText ? <TranslationText text={hadithView.translationText} /> : (
          <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("hadith.translationUnavailable")}</Text>
        )}

        {hadithView.translatorLabel ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("ayah.translatorLabel")}: {hadithView.translatorLabel}
          </Text>
        ) : null}

        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
          {t("hadith.disclaimer")}
        </Text>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm }}>
          <Button
            label={showExplanation ? t("hadith.explanationHideCta") : t("hadith.explanationShowCta")}
            variant="secondary"
            onPress={() => setShowExplanation((v) => !v)}
          />
          {showExplanation ? (
            <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("hadith.explanationUnavailable")}</Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            label={justCopied ? `✓ ${t("home.copiedConfirmation")}` : t("home.copyCta")}
            variant="secondary"
            onPress={() => {
              Clipboard.setStringAsync(shareText);
              setJustCopied(true);
              setTimeout(() => setJustCopied(false), 1500);
            }}
          />
          <Button
            label={t("home.shareCta")}
            variant="secondary"
            onPress={() => {
              incrementShareCount();
              Share.share({ message: shareText });
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
});
