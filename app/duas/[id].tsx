import React, { useEffect, useState } from "react";
import { View, Text, Share, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { Screen, ArabicText, TranslationText, EmptyState, Button, FavoriteButton } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { duaTitleFor, duaTranslationFor, isDuaTranslationFallback, duaSourceLabel, getDua } from "@/data/duas";
import { buildGetTheAppLine } from "@/utils/shareText";
import { incrementShareCount } from "@/storage/shareCounterStore";
import { isDuaFavorite, toggleDuaFavorite } from "@/storage/extrasFavoritesStore";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { addToHifz, isInHifz, removeFromHifz } from "@/storage/hifzStore";

/**
 * One invocation in full: Arabic, transliteration where the source dataset
 * provides one, the translation in the reader's language (English as a
 * visible fallback — see duaTranslationFor), and the source attribution
 * that every entry ships with.
 */
export default function DuaDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const { preferences, update } = usePreferencesStore();
  const [justCopied, setJustCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [memorizing, setMemorizing] = useState(false);

  const dua = params.id ? getDua(params.id) : undefined;

  useEffect(() => {
    if (!dua) return;
    isDuaFavorite(dua.id).then(setFavorite);
    isInHifz(dua.id).then(setMemorizing);
  }, [dua]);

  if (!dua) {
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

  const title = duaTitleFor(dua, locale);
  const translation = duaTranslationFor(dua, locale);
  const sourceLabel = duaSourceLabel(dua);

  const toggleMemorize = async (): Promise<void> => {
    if (memorizing) {
      await removeFromHifz(dua.id);
      setMemorizing(false);
    } else {
      await addToHifz(dua.id, new Date(), "dua");
      setMemorizing(true);
    }
  };
  // The Hisn-style entries only exist in English translation; when the
  // reader is shown a language that isn't their own, say so rather than
  // letting it pass silently (same policy as the hadith corpus's gaps).
  const showEnglishFallbackNotice = isDuaTranslationFallback(dua, locale);

  const shareText = [
    dua.arabic,
    translation,
    dua.source ? `${title} — ${dua.source}` : title,
    `(${t("common.appName")})`,
    buildGetTheAppLine(t),
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <Screen onBack={() => router.back()}>
      <View style={{ gap: spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.xs }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, flexWrap: "wrap", flexShrink: 1 }}>
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <Text style={{ color: colors.textOnAccent, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
                {t(`duas.categories.${dua.category}` as Parameters<typeof t>[0])}
              </Text>
            </View>
            <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.subtitle * fontScaleMultiplier, flexShrink: 1 }}>
              {title}
            </Text>
          </View>
          <FavoriteButton
            isFavorite={favorite}
            onToggle={() => {
              toggleDuaFavorite(dua.id).then(setFavorite);
            }}
          />
        </View>

        <ArabicText text={dua.arabic} />

        {preferences.showTransliteration && dua.transliteration ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier, fontStyle: "italic" }}>
            {dua.transliteration}
          </Text>
        ) : null}

        {translation ? <TranslationText text={translation} /> : null}

        {dua.transliteration ? (
          <Button
            label={preferences.showTransliteration ? t("common.hideTransliterationCta") : t("common.showTransliterationCta")}
            variant="ghost"
            onPress={() => update({ showTransliteration: !preferences.showTransliteration })}
          />
        ) : null}

        {showEnglishFallbackNotice ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
            {t("duas.englishFallbackNotice")}
          </Text>
        ) : null}

        {sourceLabel ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("duas.sourceLabel")}: {sourceLabel}
          </Text>
        ) : null}

        <Button
          label={memorizing ? t("hifz.removeCta") : t("hifz.memorizeDuaCta")}
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
