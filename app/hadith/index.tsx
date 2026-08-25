import React, { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Screen, Chip, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useHadithView } from "@/hooks/useHadithView";
import { appConfig } from "@/config/appConfig";
import { getRuntimeHadithCorpus, hasAnyHadithContent, type HadithEntry } from "@/data/corpus/hadith";
import { ALL_THEME_KEYS, type ThemeKey } from "@/domain/types";
import { hadithIdToRouteParam } from "@/utils/routeParams";

const MAX_PREVIEW_CHARS = 110;

function HadithRow({ entry, onPress }: { entry: HadithEntry; onPress: () => void }): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { preferences } = usePreferencesStore();
  const view = useHadithView(entry.arabic.id, preferences.translationLocale);
  const fullText = view.translationText ?? view.arabicText ?? "";
  const preview = fullText.length > MAX_PREVIEW_CHARS ? `${fullText.slice(0, MAX_PREVIEW_CHARS).trim()}…` : fullText;

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
        {view.collectionDisplayName} · #{view.hadithNumber}
      </Text>
      <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{preview}</Text>
    </Pressable>
  );
}

export default function HadithMenuScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { preferences } = usePreferencesStore();

  const [query, setQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | undefined>(undefined);

  const available = hasAnyHadithContent(preferences.translationLocale);
  const corpus = useMemo(() => getRuntimeHadithCorpus(), []);

  const themesInUse = useMemo(() => {
    const set = new Set<ThemeKey>();
    for (const entry of corpus) for (const th of entry.catalog.themes) set.add(th);
    return ALL_THEME_KEYS.filter((k) => set.has(k));
  }, [corpus]);

  const filtered = useMemo(() => {
    let list = corpus;
    if (selectedTheme) list = list.filter((e) => e.catalog.themes.includes(selectedTheme));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) => e.arabic.collectionDisplayName.toLowerCase().includes(q) || String(e.arabic.hadithNumber).includes(q));
    }
    return list;
  }, [corpus, selectedTheme, query]);

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
            {t("hadith.menuTitle")}
          </Text>
          <Text style={{ color: appConfig.brand.ivory, opacity: 0.75, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("hadith.menuSubtitle")}
          </Text>
        </View>

        {!available ? (
          <View style={{ padding: spacing.md }}>
            <EmptyState title={t("hadith.menuTitle")} body={t("hadith.unavailableInLanguageNotice")} />
          </View>
        ) : (
          <View style={{ flex: 1, padding: spacing.md, gap: spacing.sm }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("hadith.searchPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radii.sm,
                padding: spacing.sm,
                color: colors.textPrimary,
                minHeight: 44,
              }}
              accessibilityLabel={t("hadith.searchPlaceholder")}
            />

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={themesInUse}
              keyExtractor={(k) => k}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Chip
                  label={t(`themes.names.${item}` as Parameters<typeof t>[0])}
                  selected={selectedTheme === item}
                  onPress={() => setSelectedTheme((prev) => (prev === item ? undefined : item))}
                />
              )}
              style={{ maxHeight: 44, flexGrow: 0 }}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.arabic.id}
              renderItem={({ item }) => (
                <HadithRow entry={item} onPress={() => router.push(`/hadith/${hadithIdToRouteParam(item.arabic.id)}`)} />
              )}
              ListEmptyComponent={<EmptyState title={t("library.emptyTitle")} body={t("library.emptyBody")} />}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
