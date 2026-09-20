import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, Chip } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import {
  DUA_CATEGORIES,
  duaTitleFor,
  duaTranslationFor,
  getAllDuas,
  getDailyDua,
  type DuaCategory,
  type DuaEntry,
} from "@/data/duas";

const MAX_PREVIEW_CHARS = 90;

function DuaRow({ dua, onPress }: { dua: DuaEntry; onPress: () => void }): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const preview = duaTranslationFor(dua, locale) ?? dua.arabic;
  const trimmed = preview.length > MAX_PREVIEW_CHARS ? `${preview.slice(0, MAX_PREVIEW_CHARS).trim()}…` : preview;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.md,
        padding: spacing.sm,
        gap: spacing.xxs,
        marginBottom: spacing.xs,
      }}
    >
      <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
        {duaTitleFor(dua, locale)}
      </Text>
      <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{trimmed}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
        {t(`duas.categories.${dua.category}` as Parameters<typeof t>[0])}
      </Text>
    </Pressable>
  );
}

/**
 * The invocations (duas & adhkar) library: the Invocation of the day on
 * top — the same one for every user that day, like the daily āyah — then
 * the full collection, filterable by category. See src/data/duas for the
 * datasets and their provenance.
 */
export default function DuasScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale, direction } = useI18n();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | undefined>(undefined);

  const all = getAllDuas();
  const daily = getDailyDua();
  const filtered = useMemo(
    () => (selectedCategory ? all.filter((d) => d.category === selectedCategory) : all),
    [all, selectedCategory],
  );

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
            {t("duas.title")}
          </Text>
          <Text style={{ color: appConfig.brand.ivory, opacity: 0.75, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("duas.subtitle")}
          </Text>
        </View>

        <View style={{ flex: 1, padding: spacing.md, gap: spacing.sm }}>
          {daily ? (
            <Pressable
              onPress={() => router.push(`/duas/${daily.id}`)}
              accessibilityRole="button"
              style={{
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.goldDecorative,
                borderRadius: radii.lg,
                padding: spacing.md,
                gap: spacing.xxs,
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
                  {t("duas.dailyLabel")}
                </Text>
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
                {duaTitleFor(daily, locale)}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, flex: 1 }} numberOfLines={1}>
                  {duaTranslationFor(daily, locale) ?? daily.arabic}
                </Text>
                <Ionicons name={direction === "rtl" ? "chevron-back" : "chevron-forward"} size={16} color={colors.textSecondary} />
              </View>
            </Pressable>
          ) : null}

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DUA_CATEGORIES}
            keyExtractor={(k) => k}
            contentContainerStyle={{ gap: spacing.xs, paddingVertical: spacing.xxs }}
            renderItem={({ item }) => (
              <Chip
                label={t(`duas.categories.${item}` as Parameters<typeof t>[0])}
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory((prev) => (prev === item ? undefined : item))}
              />
            )}
            style={{ flexGrow: 0 }}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <DuaRow dua={item} onPress={() => router.push(`/duas/${item.id}`)} />}
          />
        </View>
      </View>
    </Screen>
  );
}
