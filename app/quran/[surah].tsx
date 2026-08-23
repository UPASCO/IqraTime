import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, type FlatListProps } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, EmptyState, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { appConfig } from "@/config/appConfig";
import { getSurahMeta, getSurahAyat, getQuranTranslationText } from "@/data/quran";
import type { QuranAyahText } from "@/domain/quran";

interface AyahRowProps {
  ayah: QuranAyahText;
  translationText?: string;
  showArabic: boolean;
  showTranslation: boolean;
  arabicFirst: boolean;
  highlighted: boolean;
  onOpenDetail: () => void;
}

function AyahRow({ ayah, translationText, showArabic, showTranslation, arabicFirst, highlighted, onOpenDetail }: AyahRowProps): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { direction } = useI18n();

  const arabicBlock = showArabic ? (
    <Text
      accessibilityLanguage="ar"
      style={{
        color: colors.textPrimary,
        textAlign: "right",
        writingDirection: "rtl",
        fontSize: typography.sizes.arabicBody * fontScaleMultiplier,
        lineHeight: typography.lineHeights.arabicBody * fontScaleMultiplier,
      }}
    >
      {ayah.text}
    </Text>
  ) : null;

  const translationBlock = showTranslation && translationText ? (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: typography.sizes.body * fontScaleMultiplier,
        lineHeight: typography.lineHeights.body * fontScaleMultiplier,
        textAlign: direction === "rtl" ? "right" : "left",
      }}
    >
      {translationText}
    </Text>
  ) : null;

  const blocks = arabicFirst ? [arabicBlock, translationBlock] : [translationBlock, arabicBlock];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.sm,
        padding: spacing.sm,
        borderRadius: radii.md,
        backgroundColor: highlighted ? colors.accentMuted : "transparent",
        borderWidth: highlighted ? 1 : 0,
        borderColor: highlighted ? colors.gold : "transparent",
      }}
    >
      <Pressable onPress={onOpenDetail} accessibilityRole="button" hitSlop={8}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: radii.pill,
            backgroundColor: appConfig.brand.night,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: appConfig.brand.goldLight, fontWeight: typography.weights.bold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {ayah.ayah}
          </Text>
        </View>
      </Pressable>
      <View style={{ flex: 1, gap: spacing.xs }}>
        {blocks.map((block, index) => (block ? <React.Fragment key={index}>{block}</React.Fragment> : null))}
      </View>
    </View>
  );
}

export default function QuranSurahReaderScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ surah: string; ayah?: string }>();
  const surahNumber = Number(params.surah);
  const router = useRouter();
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();

  const meta = getSurahMeta(surahNumber);
  const ayat = useMemo(() => getSurahAyat(surahNumber), [surahNumber]);

  const [highlightedAyah, setHighlightedAyah] = useState<number | undefined>(
    params.ayah ? Number(params.ayah) : undefined,
  );
  const [jumpInput, setJumpInput] = useState("");
  const [jumpError, setJumpError] = useState(false);
  const listRef = useRef<FlatList<QuranAyahText>>(null);

  const scrollToAyah = (ayahNumber: number): void => {
    const index = ayat.findIndex((a) => a.ayah === ayahNumber);
    if (index < 0) return;
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
  };

  useEffect(() => {
    if (highlightedAyah === undefined || ayat.length === 0) return;
    const id = setTimeout(() => scrollToAyah(highlightedAyah), 150);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the target changes or the surah's ayat finish loading
  }, [highlightedAyah, ayat.length]);

  if (!meta) {
    return (
      <Screen>
        <EmptyState
          title={t("quran.emptyTitle")}
          body={t("quran.emptyBody")}
          action={<Button label={t("quran.allSurahsCta")} onPress={() => router.replace("/quran")} variant="secondary" />}
        />
      </Screen>
    );
  }

  // The basmala prefixes every surah except At-Tawbah (9) as a decorative
  // header — never a numbered āyah of its own — with the sole exception of
  // Al-Fatiha (1), where the basmala genuinely *is* āyah 1 in this
  // numbering, so showing it again here would duplicate it. Sourced
  // verbatim from 1:1 of the same Uthmani text as every other āyah in this
  // app, never retyped. See docs/CORPUS.md "Basmala handling".
  const basmalaText = surahNumber !== 1 && surahNumber !== 9 ? getSurahAyat(1)[0]?.text : undefined;

  const showArabic = preferences.showArabicText;
  const showTranslation = preferences.textDisplayMode !== "arabic_only";
  const arabicFirst = preferences.textOrder === "arabic_first";

  const handleJump = (): void => {
    const n = Number.parseInt(jumpInput, 10);
    if (!Number.isInteger(n) || n < 1 || n > meta.ayahCount) {
      setJumpError(true);
      return;
    }
    setJumpError(false);
    setHighlightedAyah(n);
    scrollToAyah(n);
  };

  const onScrollToIndexFailed: NonNullable<FlatListProps<QuranAyahText>["onScrollToIndexFailed"]> = (info) => {
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
      setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.2 }), 100);
    }, 100);
  };

  return (
    <Screen scroll={false} contentContainerStyle={{ padding: 0, flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: appConfig.brand.night,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
            gap: spacing.sm,
            borderBottomLeftRadius: radii.lg,
            borderBottomRightRadius: radii.lg,
          }}
        >
          <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="chevron-back" size={18} color={appConfig.brand.ivory} />
            <Text style={{ color: appConfig.brand.ivory, opacity: 0.8, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
              {t("quran.allSurahsCta")}
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View style={{ gap: 2, flexShrink: 1 }}>
              <Text style={{ color: appConfig.brand.warmWhite, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
                {meta.nameTransliterated}
              </Text>
              <Text style={{ color: appConfig.brand.ivory, opacity: 0.7, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                {t(meta.revelationPlace === "mecca" ? "quran.meccan" : "quran.medinan")} · {t("quran.ayahCountLabel", { count: meta.ayahCount })}
              </Text>
            </View>
            <Text style={{ color: appConfig.brand.goldLight, fontSize: typography.sizes.title * fontScaleMultiplier }} accessibilityLanguage="ar">
              {meta.nameArabic}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: spacing.xs, alignItems: "center" }}>
            <TextInput
              value={jumpInput}
              onChangeText={(v) => {
                setJumpInput(v.replace(/[^0-9]/g, ""));
                setJumpError(false);
              }}
              onSubmitEditing={handleJump}
              keyboardType="number-pad"
              placeholder={t("quran.jumpToAyahPlaceholder")}
              placeholderTextColor="rgba(247,243,232,0.5)"
              accessibilityLabel={t("quran.jumpToAyahLabel")}
              style={{
                flex: 1,
                backgroundColor: "rgba(247,243,232,0.1)",
                borderColor: jumpError ? colors.danger : appConfig.brand.goldLight,
                borderWidth: 1,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                color: appConfig.brand.warmWhite,
                minHeight: 40,
              }}
            />
            <Pressable
              onPress={handleJump}
              accessibilityRole="button"
              accessibilityLabel={t("quran.jumpToAyahCta")}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radii.sm,
                backgroundColor: appConfig.brand.goldLight,
                minHeight: 40,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: appConfig.brand.night, fontWeight: typography.weights.semibold }}>{t("quran.jumpToAyahCta")}</Text>
            </Pressable>
          </View>
          {jumpError ? (
            <Text style={{ color: colors.danger, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{t("quran.jumpToAyahInvalid")}</Text>
          ) : null}
        </View>

        <FlatList
          ref={listRef}
          data={ayat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.xs }}
          onScrollToIndexFailed={onScrollToIndexFailed}
          ListHeaderComponent={
            basmalaText ? (
              <Text
                accessibilityLanguage="ar"
                style={{
                  color: colors.gold,
                  textAlign: "center",
                  fontSize: typography.sizes.subtitle * fontScaleMultiplier,
                  marginBottom: spacing.md,
                }}
              >
                {basmalaText}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <AyahRow
              ayah={item}
              translationText={getQuranTranslationText(item.id, preferences.translationLocale)}
              showArabic={showArabic}
              showTranslation={showTranslation}
              arabicFirst={arabicFirst}
              highlighted={highlightedAyah === item.ayah}
              onOpenDetail={() => router.push(`/ayah/${item.surah}-${item.ayah}`)}
            />
          )}
        />
      </View>
    </Screen>
  );
}
