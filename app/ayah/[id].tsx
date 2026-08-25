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
import { getTafsir, tafsirSources } from "@/data/corpus";
import { routeParamToAyahId } from "@/utils/routeParams";
import { formatShareText, buildGetTheAppLine } from "@/utils/shareText";
import { incrementShareCount } from "@/storage/shareCounterStore";
import { addToHifz, isInHifz, removeFromHifz } from "@/storage/hifzStore";

export default function AyahDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string; tafsir?: string }>();
  const ayahId = params.id ? routeParamToAyahId(params.id) : undefined;
  const router = useRouter();
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const db = useAppDatabase();

  const ayahView = useAyahView(ayahId, preferences.translationLocale);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inHifz, setInHifz] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  // `?tafsir=1` opens straight into the tafsir — the feed's tafsir button
  // (AyahFeedSlide's rail) links here rather than duplicating the tafsir
  // rendering, disclaimer and source attribution inside the slide.
  const [showTafsir, setShowTafsir] = useState(params.tafsir === "1");

  const tafsir = ayahId ? getTafsir(ayahId, preferences.translationLocale) : undefined;
  const tafsirSource = tafsir ? tafsirSources.find((s) => s.id === tafsir.sourceId) : undefined;

  useEffect(() => {
    if (!db || !ayahId) return;
    db.favorites.isFavorite(ayahId).then(setIsFavorite);
  }, [db, ayahId]);

  useEffect(() => {
    if (!ayahId) return;
    isInHifz(ayahId).then(setInHifz);
  }, [ayahId]);

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
    getTheAppLine: buildGetTheAppLine(t),
  });

  return (
    <Screen onBack={() => router.back()}>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <QuranicReference surah={ayahView.surah} ayah={ayahView.ayah} />
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </View>

        {preferences.showArabicText && ayahView.arabicText ? <ArabicText text={ayahView.arabicText} /> : null}
        {ayahView.translationText ? <TranslationText text={ayahView.translationText} /> : (
          <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("errors.translationMissing")}</Text>
        )}

        {ayahView.themeLabels.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ayahView.themeLabels.map((label) => (
              <ThemeBadge key={label} label={label} />
            ))}
          </View>
        ) : null}

        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm }}>
          <Button
            label={showTafsir ? t("ayah.tafsirHideCta") : t("ayah.tafsirShowCta")}
            variant="secondary"
            onPress={() => setShowTafsir((v) => !v)}
          />
          {showTafsir ? (
            tafsir ? (
              <View style={{ gap: spacing.xs }}>
                <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, lineHeight: typography.lineHeights.body * fontScaleMultiplier }}>
                  {tafsir.text}
                </Text>
                {tafsirSource ? (
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                    {t("ayah.tafsirSourceLabel")}: {tafsirSource.tafsirTitle} — {tafsirSource.authorName}
                  </Text>
                ) : null}
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
                  {t("ayah.tafsirDisclaimer")}
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("ayah.tafsirUnavailable")}</Text>
            )
          ) : null}
        </View>

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
          <Button
            label={t("home.shareCta")}
            variant="secondary"
            onPress={() => {
              incrementShareCount();
              Share.share({ message: shareText });
            }}
          />
        </View>

        <Button
          label={inHifz ? t("hifz.removeCta") : t("hifz.memorizeCta")}
          variant="secondary"
          onPress={async () => {
            if (!ayahId) return;
            if (inHifz) {
              await removeFromHifz(ayahId);
              setInHifz(false);
            } else {
              await addToHifz(ayahId);
              setInHifz(true);
              router.push("/hifz");
            }
          }}
        />

        <Button
          label={t("quran.openInReaderCta")}
          // replace, not push: this screen might itself have just replaced
          // the surah reader (see AyahRow.onOpenDetail in
          // app/quran/[surah].tsx), so pushing here would grow the stack on
          // every bounce between the two. Replacing means "back" from the
          // reader always returns in one hop to wherever the āyah was
          // actually opened from (feed, favorites, history, …).
          variant="ghost"
          onPress={() => router.replace(`/quran/${ayahView.surah}?ayah=${ayahView.ayah}`)}
        />
      </View>
    </Screen>
  );
}
