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
import { getHadithTransliteration } from "@/data/corpus/hadith";
import { routeParamToHadithId } from "@/utils/routeParams";
import { formatHadithShareText, buildGetTheAppLine } from "@/utils/shareText";
import { incrementShareCount } from "@/storage/shareCounterStore";
import { addToHifz, isInHifz, removeFromHifz } from "@/storage/hifzStore";

export default function HadithDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string }>();
  const hadithId = params.id ? routeParamToHadithId(params.id) : undefined;
  const router = useRouter();
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences, update } = usePreferencesStore();

  const hadithView = useHadithView(hadithId, preferences.translationLocale);
  const transliteration = preferences.showTransliteration && hadithId ? getHadithTransliteration(hadithId) : undefined;
  const [isFavorite, setIsFavorite] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [memorizing, setMemorizing] = useState(false);

  useEffect(() => {
    if (!hadithId) return;
    isHadithFavorite(hadithId).then(setIsFavorite);
    isInHifz(hadithId).then(setMemorizing);
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

  const toggleMemorize = async (): Promise<void> => {
    if (!hadithId) return;
    if (memorizing) {
      await removeFromHifz(hadithId);
      setMemorizing(false);
    } else {
      await addToHifz(hadithId, new Date(), "hadith");
      setMemorizing(true);
    }
  };

  const shareText = formatHadithShareText({
    translationText: hadithView.translationText,
    arabicText: hadithView.arabicText,
    collectionDisplayName: hadithView.collectionDisplayName,
    hadithNumber: hadithView.hadithNumber,
    includeArabic: preferences.showArabicText,
    includeTranslation: preferences.textDisplayMode !== "arabic_only",
    appName: t("common.appName"),
    getTheAppLine: buildGetTheAppLine(t),
  });

  return (
    <Screen onBack={() => router.back()}>
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
        {transliteration ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontStyle: "italic",
              fontSize: typography.sizes.body * fontScaleMultiplier,
              lineHeight: typography.lineHeights.body * fontScaleMultiplier,
            }}
          >
            {transliteration}
          </Text>
        ) : null}
        {hadithView.translationText ? <TranslationText text={hadithView.translationText} /> : (
          <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("hadith.translationUnavailable")}</Text>
        )}
        <Button
          label={preferences.showTransliteration ? t("common.hideTransliterationCta") : t("common.showTransliterationCta")}
          variant="ghost"
          onPress={() => update({ showTransliteration: !preferences.showTransliteration })}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
          {t("hadith.disclaimer")}
        </Text>

        {/* No "Show explanation" button: no verified sharh source ships yet
            (docs/CORPUS.md "Hadith"), and a button whose only outcome is
            "unavailable" is worse than none — the same rule the āyah slide
            applies to its tafsir button. Reinstate it with the i18n keys
            hadith.explanation* once a real source exists. */}

        <Button
          label={memorizing ? t("hifz.removeCta") : t("hifz.memorizeHadithCta")}
          variant={memorizing ? "ghost" : "secondary"}
          onPress={toggleMemorize}
        />

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
