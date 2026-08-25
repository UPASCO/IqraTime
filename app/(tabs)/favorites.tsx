import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, Share } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { Screen, EmptyState, Button, Chip } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import { useHadithView } from "@/hooks/useHadithView";
import type { FavoriteEntry, HadithId } from "@/domain/types";
import { ayahIdToRouteParam, hadithIdToRouteParam } from "@/utils/routeParams";
import { formatDateTime } from "@/utils/dateUtils";
import { formatShareText, formatHadithShareText } from "@/utils/shareText";
import { listHadithFavorites, removeHadithFavorite } from "@/storage/hadithFavoritesStore";

type SortMode = "date" | "surah";
type ContentType = "ayah" | "hadith";

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

/** The hadith counterpart to FavoriteRow above — hadith favorites have no timestamp (see hadithFavoritesStore.ts), just an id. */
function HadithFavoriteRow({
  hadithId,
  onPress,
  onRemove,
}: {
  hadithId: HadithId;
  onPress: () => void;
  onRemove: () => void;
}): React.JSX.Element | null {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const view = useHadithView(hadithId, preferences.translationLocale);

  if (!view.found) return null;

  const preview = view.translationText ?? view.arabicText ?? "";

  const share = (): void => {
    const message = formatHadithShareText({
      translationText: view.translationText,
      arabicText: view.arabicText,
      collectionDisplayName: view.collectionDisplayName,
      hadithNumber: view.hadithNumber,
      includeArabic: preferences.showArabicText,
      includeTranslation: preferences.textDisplayMode !== "arabic_only",
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
        {view.collectionDisplayName} #{view.hadithNumber}
      </Text>
      <Text numberOfLines={3} style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
        {preview}
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

  const [contentType, setContentType] = useState<ContentType>("ayah");
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [hadithFavorites, setHadithFavorites] = useState<readonly HadithId[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [pendingUndo, setPendingUndo] = useState<FavoriteEntry | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (db) setFavorites(await db.favorites.list());
    setHadithFavorites(await listHadithFavorites());
  }, [db]);

  // Reload every time this tab regains focus, not just once on first mount:
  // Expo Router's Tabs keep every tab screen mounted in the background, so
  // a mount-only effect would never see a favorite added from Home after
  // this tab was first visited — it looked exactly like "the heart doesn't
  // save," when the write was actually succeeding the whole time.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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

  const filteredHadith = useMemo(() => hadithFavorites.filter((id) => !query || id.includes(query)), [hadithFavorites, query]);

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

  const handleRemoveHadith = async (id: HadithId): Promise<void> => {
    await removeHadithFavorite(id);
    setHadithFavorites((prev) => prev.filter((existing) => existing !== id));
  };

  const isEmpty = contentType === "ayah" ? filtered.length === 0 : filteredHadith.length === 0;

  return (
    <Screen scroll={false}>
      <View style={{ gap: spacing.sm, flex: 1 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label={t("quran.title")} selected={contentType === "ayah"} onPress={() => setContentType("ayah")} />
          <Chip label={t("hadith.menuTitle")} selected={contentType === "hadith"} onPress={() => setContentType("hadith")} />
        </View>

        {isEmpty ? (
          <EmptyState title={t("favorites.emptyTitle")} body={t("favorites.emptyBody")} />
        ) : (
          <>
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
            {contentType === "ayah" ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Chip label={t("favorites.sortByDate")} selected={sortMode === "date"} onPress={() => setSortMode("date")} />
                <Chip label={t("favorites.sortBySurah")} selected={sortMode === "surah"} onPress={() => setSortMode("surah")} />
              </View>
            ) : null}
            {contentType === "ayah" ? (
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
            ) : (
              <FlatList
                data={filteredHadith}
                keyExtractor={(id) => id}
                renderItem={({ item }) => (
                  <HadithFavoriteRow
                    hadithId={item}
                    onPress={() => router.push(`/hadith/${hadithIdToRouteParam(item)}`)}
                    onRemove={() => handleRemoveHadith(item)}
                  />
                )}
              />
            )}
          </>
        )}

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
