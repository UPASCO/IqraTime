import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import { getAllNames, getDailyNameNumber, nameMeaningFor, type NameOfAllah } from "@/data/names";
import { isNameFavorite, toggleNameFavorite } from "@/storage/extrasFavoritesStore";
import { addToHifz, isInHifz, removeFromHifz } from "@/storage/hifzStore";

/**
 * One name in the list, with its two quiet actions: favorite (heart) and
 * memorize (adds the name to the same spaced-repetition rotation as āyāt
 * and invocations — learning the 99 by heart is the whole tradition).
 */
function NameRow({ name, highlighted, isDaily, meaning }: { name: NameOfAllah; highlighted: boolean; isDaily: boolean; meaning: string }): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const [favorite, setFavorite] = useState(false);
  const [memorizing, setMemorizing] = useState(false);

  useEffect(() => {
    isNameFavorite(name.number).then(setFavorite);
    isInHifz(String(name.number)).then(setMemorizing);
  }, [name.number]);

  const toggleMemorize = async (): Promise<void> => {
    if (memorizing) {
      await removeFromHifz(String(name.number));
      setMemorizing(false);
    } else {
      await addToHifz(String(name.number), new Date(), "name");
      setMemorizing(true);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: highlighted ? colors.surfaceElevated : colors.surface,
        borderWidth: 1,
        borderColor: highlighted || isDaily ? colors.goldDecorative : colors.border,
        borderRadius: radii.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.xs,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDaily ? colors.gold : colors.surfaceElevated,
          borderWidth: 1,
          borderColor: isDaily ? colors.gold : colors.border,
        }}
      >
        <Text style={{ color: isDaily ? colors.textOnAccent : colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {name.number}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
          {name.transliteration}
        </Text>
        {meaning ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{meaning}</Text>
        ) : null}
      </View>
      <View style={{ alignItems: "flex-end", gap: spacing.xxs }}>
        <Text style={{ color: colors.gold, fontSize: 24 * fontScaleMultiplier, lineHeight: 40 * fontScaleMultiplier, writingDirection: "rtl" }}>
          {name.arabic}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Pressable
            onPress={() => {
              toggleNameFavorite(name.number).then(setFavorite);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={favorite ? t("home.favoriteRemove") : t("home.favoriteAdd")}
            accessibilityState={{ selected: favorite }}
          >
            <Ionicons name={favorite ? "heart" : "heart-outline"} size={18} color={favorite ? colors.gold : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={toggleMemorize}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={memorizing ? t("hifz.removeCta") : t("hifz.title")}
            accessibilityState={{ selected: memorizing }}
          >
            <Ionicons name={memorizing ? "school" : "school-outline"} size={18} color={memorizing ? colors.gold : colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * The 99 Names of Allah (Al-Asma ul-Husna). One hero card carries the Name
 * of the day — the same name every user in the world sees that day, walking
 * the canonical order (see src/data/names) — above the full browsable list.
 * `?n=<number>` (from a Name-of-the-day notification tap) scrolls to and
 * highlights that name.
 */
export default function NamesScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ n?: string }>();

  const names = getAllNames();
  const dailyNumber = getDailyNameNumber();
  const highlightNumber = useMemo(() => {
    const parsed = Number(params.n);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= names.length ? parsed : undefined;
  }, [params.n, names.length]);

  const listRef = useRef<FlatList<NameOfAllah>>(null);

  useEffect(() => {
    if (!highlightNumber) return;
    // A short delay lets the list finish its first layout pass; without it
    // scrollToIndex on mount is silently ignored on Android.
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({ index: highlightNumber - 1, viewPosition: 0.25, animated: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightNumber]);

  const daily = names[dailyNumber - 1];

  return (
    <Screen scroll={false} contentContainerStyle={{ padding: 0, flex: 1 }} onBack={() => router.back()}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: appConfig.brand.night,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
            gap: spacing.xs,
            borderBottomLeftRadius: radii.lg,
            borderBottomRightRadius: radii.lg,
          }}
        >
          <Text style={{ color: appConfig.brand.warmWhite, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
            {t("names.title")}
          </Text>
          <Text style={{ color: appConfig.brand.ivory, opacity: 0.75, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("names.subtitle")}
          </Text>
        </View>

        <FlatList
          ref={listRef}
          data={names}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          onScrollToIndexFailed={(info) => {
            // The target row isn't laid out yet — jump near it, then retry
            // precisely once the surrounding rows have rendered.
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: info.index, viewPosition: 0.25, animated: false });
            }, 250);
          }}
          ListHeaderComponent={
            daily ? (
              <View
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: colors.goldDecorative,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  gap: spacing.xs,
                  alignItems: "center",
                  marginBottom: spacing.md,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
                  <Ionicons name="sunny-outline" size={14} color={colors.gold} />
                  <Text
                    style={{
                      color: colors.gold,
                      fontSize: typography.sizes.caption * fontScaleMultiplier,
                      fontWeight: typography.weights.semibold,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {t("names.dailyLabel")}
                  </Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 40 * fontScaleMultiplier, lineHeight: 64 * fontScaleMultiplier, writingDirection: "rtl" }}>
                  {daily.arabic}
                </Text>
                <Text style={{ color: colors.gold, fontSize: typography.sizes.subtitle * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
                  {daily.transliteration}
                </Text>
                {nameMeaningFor(daily, locale) ? (
                  <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, textAlign: "center" }}>
                    {nameMeaningFor(daily, locale)}
                  </Text>
                ) : null}
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                  {t("names.positionLabel", { number: daily.number })}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <NameRow
              name={item}
              highlighted={item.number === highlightNumber}
              isDaily={item.number === dailyNumber}
              meaning={nameMeaningFor(item, locale)}
            />
          )}
        />
      </View>
    </Screen>
  );
}
