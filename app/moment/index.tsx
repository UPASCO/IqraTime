import React, { useState } from "react";
import { View, Text, Pressable, Share, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

import { Screen, ArabicText, TranslationText, QuranicReference, FavoriteButton, ThemeBadge, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import { getRuntimeCorpus, getTranslation, getCorpusEntry } from "@/data/corpus";
import { selectAyah } from "@/services/selectionEngine";
import { DEFAULT_ANTI_REPEAT_WINDOW, MAX_NOTIFICATION_AYAH_LENGTH } from "@/domain/constants";
import { ALL_MOOD_KEYS, MOOD_THEME_MAP, MOOD_ICONS, type MoodKey } from "@/domain/moods";
import { formatShareText, buildGetTheAppLine } from "@/utils/shareText";
import { incrementShareCount } from "@/storage/shareCounterStore";
import { generateLocalId } from "@/utils/id";
import { appConfig } from "@/config/appConfig";

/** Any corpus entry matching the mood's themes, avoiding an immediate repeat — used only if the selection engine itself finds nothing. */
function pickFallbackForThemes(avoidAyahId: string | undefined, themes: readonly string[]): string | undefined {
  const corpus = getRuntimeCorpus();
  const matching = corpus.filter((e) => e.catalog.themes.some((th) => (themes as readonly string[]).includes(th)) && e.arabic.id !== avoidAyahId);
  const pool = matching.length > 0 ? matching : corpus.filter((e) => e.arabic.id !== avoidAyahId);
  const from = pool.length > 0 ? pool : corpus;
  return from[Math.floor(Math.random() * from.length)]?.arabic.id;
}

export default function MomentScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();
  const { preferences } = usePreferencesStore();

  const [mood, setMood] = useState<MoodKey | undefined>(undefined);
  const [ayahId, setAyahId] = useState<string | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const ayahView = useAyahView(ayahId, preferences.translationLocale);

  const pickForMood = async (chosenMood: MoodKey, avoidAyahId?: string): Promise<void> => {
    if (!db) return;
    setLoading(true);
    try {
      const themes = MOOD_THEME_MAP[chosenMood];
      const [recentAyahIds, favorites, hidden] = await Promise.all([
        db.history.recentAyahIds(preferences.antiRepeatWindow || DEFAULT_ANTI_REPEAT_WINDOW),
        db.favorites.list(),
        db.hiddenAyahs.list(),
      ]);
      const result = selectAyah({
        corpus: getRuntimeCorpus(),
        getTranslation,
        translationLocale: preferences.translationLocale,
        showArabic: preferences.showArabicText,
        requireTranslation: preferences.textDisplayMode !== "arabic_only",
        localHour: new Date().getHours(),
        selectedThemes: themes,
        recentAyahIds,
        recentThemes: recentAyahIds.map((id) => getCorpusEntry(id)?.catalog.themes ?? []).flat(),
        favoriteAyahIds: favorites.map((f) => f.ayahId),
        hiddenAyahIds: hidden.map((h) => h.ayahId),
        maxLength: MAX_NOTIFICATION_AYAH_LENGTH,
        mode: "chosen_themes",
      });
      const nextAyahId = result.status === "selected" ? result.ayahId : pickFallbackForThemes(avoidAyahId, themes);
      if (!nextAyahId) {
        setMood(chosenMood);
        setAyahId(undefined);
        return;
      }

      await db.history.add({
        id: generateLocalId(),
        ayahId: nextAyahId,
        locale: preferences.translationLocale,
        receivedAtUtcIso: new Date().toISOString(),
        source: "mood_pick",
      });
      setIsFavorite(favorites.some((f) => f.ayahId === nextAyahId));
      setMood(chosenMood);
      setAyahId(nextAyahId);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (): Promise<void> => {
    if (!db || !ayahId) return;
    if (isFavorite) {
      await db.favorites.remove(ayahId);
    } else {
      await db.favorites.add({ ayahId, locale: preferences.translationLocale, addedAtUtcIso: new Date().toISOString() });
    }
    setIsFavorite(!isFavorite);
  };

  const shareText = (): string =>
    formatShareText({
      translationText: ayahView.translationText,
      arabicText: ayahView.arabicText,
      surah: ayahView.surah,
      ayah: ayahView.ayah,
      includeArabic: preferences.showArabicText,
      includeTranslation: preferences.textDisplayMode !== "arabic_only",
      referenceLabel: t("ayah.surahLabel"),
      appName: t("common.appName"),
      getTheAppLine: buildGetTheAppLine(t("common.getTheAppShareLine")),
    });

  if (mood && (ayahId || loading)) {
    return (
      <Screen>
        <View style={{ gap: spacing.lg }}>
          <Pressable
            onPress={() => {
              setMood(undefined);
              setAyahId(undefined);
            }}
            accessibilityRole="button"
            accessibilityLabel={t("moment.backCta")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{t("moment.backCta")}</Text>
          </Pressable>

          {loading && !ayahId ? (
            <View style={{ paddingVertical: spacing.xl, alignItems: "center" }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : !ayahId ? (
            <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("moment.emptyBody")}</Text>
          ) : (
            <View
              style={{
                backgroundColor: appConfig.brand.night,
                borderRadius: radii.lg,
                padding: spacing.lg,
                gap: spacing.md,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <QuranicReference surah={ayahView.surah} ayah={ayahView.ayah} />
                <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
              </View>

              {preferences.showArabicText && ayahView.arabicText ? <ArabicText text={ayahView.arabicText} /> : null}
              {ayahView.translationText ? (
                <TranslationText text={ayahView.translationText} />
              ) : (
                <Text style={{ color: appConfig.brand.ivory, opacity: 0.7, fontStyle: "italic" }}>{t("errors.translationMissing")}</Text>
              )}

              {ayahView.themeLabels.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {ayahView.themeLabels.map((label) => (
                    <ThemeBadge key={label} label={label} />
                  ))}
                </View>
              ) : null}
            </View>
          )}

          {ayahId ? (
            <View style={{ gap: spacing.sm }}>
              <Button label={t("moment.anotherCta")} variant="primary" disabled={loading} onPress={() => pickForMood(mood, ayahId)} />
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <Button
                  label={justCopied ? `✓ ${t("home.copiedConfirmation")}` : t("home.copyCta")}
                  variant="secondary"
                  onPress={() => {
                    Clipboard.setStringAsync(shareText());
                    setJustCopied(true);
                    setTimeout(() => setJustCopied(false), 1500);
                  }}
                />
                <Button
                  label={t("home.shareCta")}
                  variant="secondary"
                  onPress={() => {
                    incrementShareCount();
                    Share.share({ message: shareText() });
                  }}
                />
              </View>
              <Button
                label={t("moment.viewFullCta")}
                variant="secondary"
                onPress={() => router.push(`/ayah/${ayahView.surah}-${ayahView.ayah}`)}
              />
            </View>
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: spacing.lg }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("moment.title")}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("moment.subtitle")}</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {ALL_MOOD_KEYS.map((key) => (
            <Pressable
              key={key}
              onPress={() => pickForMood(key)}
              accessibilityRole="button"
              accessibilityLabel={t(`moment.moods.${key}` as Parameters<typeof t>[0])}
              style={{
                width: "47%",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.sm,
                alignItems: "center",
                gap: spacing.xs,
              }}
            >
              <Ionicons name={MOOD_ICONS[key] as keyof typeof Ionicons.glyphMap} size={26} color={colors.accent} />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.sizes.caption * fontScaleMultiplier,
                  fontWeight: typography.weights.medium,
                  textAlign: "center",
                }}
              >
                {t(`moment.moods.${key}` as Parameters<typeof t>[0])}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
