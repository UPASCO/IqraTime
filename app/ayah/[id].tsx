import React, { useEffect, useState } from "react";
import { View, Text, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { Screen, ArabicText, TranslationText, QuranicReference, FavoriteButton, ThemeBadge, EmptyState, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import { routeParamToAyahId } from "@/utils/routeParams";
import { formatShareText } from "@/utils/shareText";

export default function AyahDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string }>();
  const ayahId = params.id ? routeParamToAyahId(params.id) : undefined;
  const router = useRouter();
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const db = useAppDatabase();

  const ayahView = useAyahView(ayahId, preferences.translationLocale);
  const [isFavorite, setIsFavorite] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  useEffect(() => {
    if (!db || !ayahId) return;
    db.favorites.isFavorite(ayahId).then(setIsFavorite);
  }, [db, ayahId]);

  if (!ayahView.found) {
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
    if (!db || !ayahId) return;
    if (isFavorite) {
      await db.favorites.remove(ayahId);
    } else {
      await db.favorites.add({ ayahId, locale: preferences.translationLocale, addedAtUtcIso: new Date().toISOString() });
    }
    setIsFavorite(!isFavorite);
  };

  const shareText = formatShareText({
    translationText: ayahView.translationText,
    arabicText: ayahView.arabicText,
    surah: ayahView.surah,
    ayah: ayahView.ayah,
    includeArabic: preferences.showArabicText,
    includeTranslation: preferences.textDisplayMode !== "arabic_only",
    referenceLabel: t("ayah.surahLabel"),
    appName: t("common.appName"),
  });

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <QuranicReference surah={ayahView.surah} ayah={ayahView.ayah} />
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </View>

        {preferences.showArabicText && ayahView.arabicText ? <ArabicText text={ayahView.arabicText} /> : null}
        {ayahView.translationText ? <TranslationText text={ayahView.translationText} /> : (
          <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("errors.translationMissing")}</Text>
        )}

        {ayahView.translatorLabel ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("ayah.translatorLabel")}: {ayahView.translatorLabel}
          </Text>
        ) : null}

        {ayahView.themeLabels.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ayahView.themeLabels.map((label) => (
              <ThemeBadge key={label} label={label} />
            ))}
          </View>
        ) : null}

        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
          {t("ayah.disclaimer")}
        </Text>

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
          <Button label={t("home.shareCta")} variant="secondary" onPress={() => Share.share({ message: shareText })} />
        </View>
      </View>
    </Screen>
  );
}
