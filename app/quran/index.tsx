import React, { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import { getSurahList } from "@/data/quran";
import type { SurahMeta } from "@/domain/quran";

function matches(surah: SurahMeta, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (String(surah.number) === q) return true;
  if (surah.nameTransliterated.toLowerCase().includes(q)) return true;
  if (surah.nameArabic.includes(query.trim())) return true;
  return false;
}

function SurahRow({ surah, onPress }: { surah: SurahMeta; onPress: () => void }): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.sm,
          marginBottom: spacing.xs,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: appConfig.brand.night, borderRadius: radii.pill }]}>
        <Text style={{ color: appConfig.brand.goldLight, fontWeight: typography.weights.bold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {surah.number}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.body * fontScaleMultiplier }}>
          {surah.nameTransliterated}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t(surah.revelationPlace === "mecca" ? "quran.meccan" : "quran.medinan")} · {t("quran.ayahCountLabel", { count: surah.ayahCount })}
        </Text>
      </View>

      <Text style={{ color: colors.gold, fontSize: typography.sizes.subtitle * fontScaleMultiplier, fontWeight: typography.weights.medium }} accessibilityLanguage="ar">
        {surah.nameArabic}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function QuranSurahListScreen(): React.JSX.Element {
  const { spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const surahs = useMemo(() => getSurahList(), []);
  const filtered = useMemo(() => surahs.filter((s) => matches(s, query)), [surahs, query]);

  return (
    <Screen scroll={false} contentContainerStyle={{ padding: 0, flex: 1 }} onBack={() => router.back()}>
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
          <Text
            style={{ color: appConfig.brand.warmWhite, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}
          >
            {t("quran.title")}
          </Text>
          <Text style={{ color: appConfig.brand.ivory, opacity: 0.75, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("quran.subtitle")}
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("quran.searchPlaceholder")}
            placeholderTextColor="rgba(247,243,232,0.5)"
            style={{
              backgroundColor: "rgba(247,243,232,0.1)",
              borderColor: appConfig.brand.goldLight,
              borderWidth: 1,
              borderRadius: radii.sm,
              padding: spacing.sm,
              color: appConfig.brand.warmWhite,
              minHeight: 44,
            }}
            accessibilityLabel={t("quran.searchPlaceholder")}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={{ padding: spacing.md }}
          renderItem={({ item }) => <SurahRow surah={item} onPress={() => router.push(`/quran/${item.number}`)} />}
          ListEmptyComponent={<EmptyState title={t("quran.emptyTitle")} body={t("quran.emptyBody")} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1 },
  badge: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
});
