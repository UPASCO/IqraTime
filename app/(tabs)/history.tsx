import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, SectionList, Alert, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, EmptyState, Button, Chip } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import type { HistoryEntry, ThemeKey } from "@/domain/types";
import { ALL_THEME_KEYS } from "@/domain/types";
import { getCorpusEntry } from "@/data/corpus";
import { formatDateTime } from "@/utils/dateUtils";
import { ayahIdToRouteParam } from "@/utils/routeParams";
import { LOCALE_NATIVE_NAMES } from "@/i18n/localeNames";

const MAX_PREVIEW_CHARS = 90;

function HistoryRow({ entry, onPress }: { entry: HistoryEntry; onPress: () => void }): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { locale, t } = useI18n();
  const view = useAyahView(entry.ayahId, entry.locale);
  const [isFavorite, setIsFavorite] = useState(false);
  const db = useAppDatabase();

  useEffect(() => {
    db?.favorites.isFavorite(entry.ayahId).then(setIsFavorite);
  }, [db, entry.ayahId]);

  if (!view.found) return <></>;

  const fullText = view.translationText ?? view.arabicText ?? "";
  const isPreviewTruncated = fullText.length > MAX_PREVIEW_CHARS;
  const preview = isPreviewTruncated ? `${fullText.slice(0, MAX_PREVIEW_CHARS).trim()}…` : fullText;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderColor: colors.border,
        borderWidth: 1,
        padding: spacing.sm,
        gap: spacing.xxs,
        marginBottom: spacing.xs,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
          {t("ayah.surahLabel")} {view.surah}:{view.ayah}
        </Text>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={16} color={isFavorite ? colors.gold : colors.textSecondary} />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{preview}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {formatDateTime(entry.receivedAtUtcIso, locale)} · {LOCALE_NATIVE_NAMES[entry.locale]}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen(): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState<ThemeKey | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!db) return;
    const [list, favorites] = await Promise.all([db.history.list(500), db.favorites.list()]);
    setEntries(list);
    setFavoriteIds(new Set(favorites.map((f) => f.ayahId)));
  }, [db]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard mount-time data load
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (favoritesOnly && !favoriteIds.has(entry.ayahId)) return false;
      if (themeFilter && !getCorpusEntry(entry.ayahId)?.catalog.themes.includes(themeFilter)) return false;
      if (query && !entry.ayahId.includes(query)) return false;
      return true;
    });
  }, [entries, query, favoritesOnly, favoriteIds, themeFilter]);

  const sections = useMemo(() => {
    const groups = new Map<string, HistoryEntry[]>();
    for (const entry of filtered) {
      const dateKey = entry.receivedAtUtcIso.slice(0, 10);
      const group = groups.get(dateKey) ?? [];
      group.push(entry);
      groups.set(dateKey, group);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, data]) => ({ title: date, data }));
  }, [filtered]);

  const handleClear = (): void => {
    Alert.alert(t("history.clearConfirmTitle"), t("history.clearConfirmBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await db?.history.clear();
          load();
        },
      },
    ]);
  };

  if (entries.length === 0) {
    return (
      <Screen>
        <EmptyState title={t("history.emptyTitle")} body={t("history.emptyBody")} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={{ gap: spacing.sm, flex: 1 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("history.searchPlaceholder")}
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
          accessibilityLabel={t("history.searchPlaceholder")}
        />
        {/* Every topic rather than an arbitrary first six, as one
            horizontal strip so the filter row stays one line tall at any
            text size (same treatment as the hadith menu's theme chips). */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ALL_THEME_KEYS}
          keyExtractor={(theme) => theme}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 8, paddingVertical: spacing.xxs }}
          ListHeaderComponent={
            <Chip label={t("history.favoritesOnlyLabel")} selected={favoritesOnly} onPress={() => setFavoritesOnly((v) => !v)} />
          }
          renderItem={({ item: theme }) => (
            <Chip
              label={t(`themes.names.${theme}` as Parameters<typeof t>[0])}
              selected={themeFilter === theme}
              onPress={() => setThemeFilter((current) => (current === theme ? null : theme))}
            />
          )}
        />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={{ color: colors.textSecondary, marginVertical: spacing.xs, fontWeight: "600" }}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <HistoryRow entry={item} onPress={() => router.push(`/ayah/${ayahIdToRouteParam(item.ayahId)}`)} />
          )}
          ListEmptyComponent={<EmptyState title={t("errors.noMatchingAyah")} />}
        />
        <Button label={t("history.clearCta")} variant="danger" onPress={handleClear} />
      </View>
    </Screen>
  );
}
