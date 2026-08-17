import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, Share } from "react-native";
import { useRouter } from "expo-router";

import { Screen, EmptyState, Button, Chip } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import type { FavoriteEntry } from "@/domain/types";
import { ayahIdToRouteParam } from "@/utils/routeParams";
import { formatDateTime } from "@/utils/dateUtils";
import { formatShareText } from "@/utils/shareText";

type SortMode = "date" | "surah";

function FavoriteRow({
  entry,
  onPress,
  onRemove,
}: {
  entry: FavoriteEntry;
  onPress: () => void;
  onRemove: () => void;
}): React.JSX.Element | null {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const { preferences } = usePreferencesStore();
  const view = useAyahView(entry.ayahId, entry.locale);

  if (!view.found) return null;

  const preview = view.translationText ?? view.arabicText ?? "";

  const share = (): void => {
    const message = formatShareText({
      translationText: view.translationText,
      arabicText: view.arabicText,
      surah: view.surah,
      ayah: view.ayah,
      includeArabic: preferences.showArabicText,
      includeTranslation: preferences.textDisplayMode !== "arabic_only",
      referenceLabel: t("ayah.surahLabel"),
      appName: t("common.appName"),
    });
    Share.share({ message });
  };

  return (
    <Pressable
      onPress={onPress}
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
      <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
        {t("ayah.surahLabel")} {view.surah}:{view.ayah}
      </Text>
      <Text numberOfLines={3} style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
        {preview}
      </Text>
      {view.themeLabels[0] ? (
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{view.themeLabels[0]}</Text>
      ) : null}
      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
        {formatDateTime(entry.addedAtUtcIso, locale)}
      </Text>
      <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xxs }}>
        <Button label={t("common.share")} variant="ghost" onPress={share} />
        <Button label={t("common.delete")} variant="ghost" onPress={onRemove} />
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen(): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();

  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [pendingUndo, setPendingUndo] = useState<FavoriteEntry | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!db) return;
    setFavorites(await db.favorites.list());
  }, [db]);

  useEffect(() => {
    // Loading data on mount/dependency-change is the standard React data-fetching
    // pattern; the state update happens asynchronously after `db.favorites.list()`
    // resolves, not synchronously within this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = favorites.filter((f) => !query || f.ayahId.includes(query));
    if (sortMode === "surah") {
      list = [...list].sort((a, b) => {
        const [sa] = a.ayahId.split(":").map(Number);
        const [sb] = b.ayahId.split(":").map(Number);
        return (sa ?? 0) - (sb ?? 0);
      });
    } else {
      list = [...list].sort((a, b) => (a.addedAtUtcIso < b.addedAtUtcIso ? 1 : -1));
    }
    return list;
  }, [favorites, query, sortMode]);

  const handleRemove = async (entry: FavoriteEntry): Promise<void> => {
    if (!db) return;
    await db.favorites.remove(entry.ayahId);
    setPendingUndo(entry);
    setFavorites((prev) => prev.filter((f) => f.ayahId !== entry.ayahId));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setPendingUndo(null), 5000);
  };

  const handleUndo = async (): Promise<void> => {
    if (!db || !pendingUndo) return;
    await db.favorites.add(pendingUndo);
    setPendingUndo(null);
    load();
  };

  if (favorites.length === 0) {
    return (
      <Screen>
        <EmptyState title={t("favorites.emptyTitle")} body={t("favorites.emptyBody")} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={{ gap: spacing.sm, flex: 1 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("favorites.searchPlaceholder")}
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
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label={t("favorites.sortByDate")} selected={sortMode === "date"} onPress={() => setSortMode("date")} />
          <Chip label={t("favorites.sortBySurah")} selected={sortMode === "surah"} onPress={() => setSortMode("surah")} />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.ayahId}
          renderItem={({ item }) => (
            <FavoriteRow
              entry={item}
              onPress={() => router.push(`/ayah/${ayahIdToRouteParam(item.ayahId)}`)}
              onRemove={() => handleRemove(item)}
            />
          )}
        />
        {pendingUndo ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.surfaceElevated,
              borderRadius: radii.md,
              padding: spacing.sm,
            }}
          >
            <Text style={{ color: colors.textPrimary }}>{t("home.favoriteRemoved")}</Text>
            <Button label={t("common.undo")} variant="ghost" onPress={handleUndo} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
