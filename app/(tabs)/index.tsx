import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Share, FlatList } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { Screen, AyahFeedSlide, NotificationStatusCard, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import { getRuntimeCorpus, getTranslation, getCorpusEntry } from "@/data/corpus";
import { selectAyah } from "@/services/selectionEngine";
import { DEFAULT_ANTI_REPEAT_WINDOW, MAX_NOTIFICATION_AYAH_LENGTH } from "@/domain/constants";
import { getPermissionSnapshot } from "@/notifications";
import type { NotificationSlot } from "@/domain/types";
import { formatShareText } from "@/utils/shareText";
import { formatDateTime } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";

/** One slide in the swipeable feed, resolved to its display data via useAyahView inside the render. */
function FeedItem({
  ayahId,
  height,
  isFavorite,
  showSwipeHint,
  onToggleFavorite,
}: {
  ayahId: string;
  height: number;
  isFavorite: boolean;
  showSwipeHint: boolean;
  onToggleFavorite: (ayahId: string) => void;
}): React.JSX.Element {
  const router = useRouter();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const ayahView = useAyahView(ayahId, preferences.translationLocale);

  if (!ayahView.found) {
    return (
      <View style={{ height, alignItems: "center", justifyContent: "center" }}>
        <EmptyState title={t("home.noAyahYetTitle")} body={t("home.noAyahYetBody")} />
      </View>
    );
  }

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
    });

  return (
    <AyahFeedSlide
      height={height}
      surah={ayahView.surah}
      ayah={ayahView.ayah}
      arabicText={preferences.showArabicText ? ayahView.arabicText : undefined}
      translationText={ayahView.translationText}
      translatorLabel={ayahView.translatorLabel}
      themeLabels={ayahView.themeLabels}
      textOrder={preferences.textOrder}
      isFavorite={isFavorite}
      showSwipeHint={showSwipeHint}
      onToggleFavorite={() => onToggleFavorite(ayahId)}
      onShare={() => Share.share({ message: shareText() })}
      onCopy={() => Clipboard.setStringAsync(shareText())}
      onOpenDetail={() => router.push(`/ayah/${ayahView.surah}-${ayahView.ayah}`)}
    />
  );
}

export default function HomeScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();
  const { preferences } = usePreferencesStore();

  const [feedIds, setFeedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [nextSlot, setNextSlot] = useState<NotificationSlot | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [slideHeight, setSlideHeight] = useState(0);

  const loadingMore = useRef(false);

  const pickAnotherAyah = useCallback(async (): Promise<string | undefined> => {
    if (!db) return undefined;
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
      selectedThemes: preferences.selectedThemes,
      recentAyahIds,
      recentThemes: recentAyahIds.map((id) => getCorpusEntry(id)?.catalog.themes ?? []).flat(),
      favoriteAyahIds: favorites.map((f) => f.ayahId),
      hiddenAyahIds: hidden.map((h) => h.ayahId),
      maxLength: MAX_NOTIFICATION_AYAH_LENGTH,
      mode: preferences.selectionMode,
    });
    if (result.status !== "selected") return undefined;
    await db.history.add({
      id: generateLocalId(),
      ayahId: result.ayahId,
      locale: preferences.translationLocale,
      receivedAtUtcIso: new Date().toISOString(),
      source: "app_shuffle",
    });
    if (favorites.some((f) => f.ayahId === result.ayahId)) {
      setFavoriteIds((prev) => new Set(prev).add(result.ayahId));
    }
    return result.ayahId;
  }, [db, preferences]);

  const loadInitialState = useCallback(async () => {
    if (!db) return;
    const history = await db.history.list(1);
    const latest = history[0];
    const firstId = latest ? latest.ayahId : getRuntimeCorpus()[0]?.arabic.id;
    if (firstId) {
      setFeedIds([firstId]);
      if (await db.favorites.isFavorite(firstId)) {
        setFavoriteIds((prev) => new Set(prev).add(firstId));
      }
    }

    const upcoming = await db.notificationSlots.listUpcoming(new Date().toISOString());
    setNextSlot(upcoming[0]);

    const permission = await getPermissionSnapshot();
    if (permission.state === "denied") {
      setStatusMessage(t("diagnostics.permissionDenied"));
    } else if (!preferences.schedule.enabled) {
      setStatusMessage(undefined);
    } else if (upcoming.length === 0) {
      setStatusMessage(t("errors.schedulingFailed"));
    } else {
      setStatusMessage(undefined);
    }
  }, [db, preferences.schedule.enabled, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard mount-time data load
    loadInitialState();
  }, [loadInitialState]);

  const nextNotificationLine = useMemo(() => {
    if (!nextSlot) return t("home.nextNotificationNone");
    return t("home.nextAyahAt", { time: formatDateTime(nextSlot.fireAtUtcIso, locale) });
  }, [nextSlot, locale, t]);

  const handleToggleFavorite = async (ayahId: string): Promise<void> => {
    if (!db) return;
    const isFav = favoriteIds.has(ayahId);
    if (isFav) {
      await db.favorites.remove(ayahId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(ayahId);
        return next;
      });
    } else {
      await db.favorites.add({ ayahId, locale: preferences.translationLocale, addedAtUtcIso: new Date().toISOString() });
      setFavoriteIds((prev) => new Set(prev).add(ayahId));
    }
  };

  const handleEndReached = async (): Promise<void> => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    const nextId = await pickAnotherAyah();
    if (nextId) {
      setFeedIds((prev) => (prev.includes(nextId) ? prev : [...prev, nextId]));
    }
    loadingMore.current = false;
  };

  return (
    <Screen scroll={false} contentContainerStyle={{ padding: 0, flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: spacing.xs }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
              {t("home.title")}
            </Text>
          </View>
          {statusMessage ? (
            <NotificationStatusCard
              message={statusMessage}
              tone="warning"
              actionLabel={t("diagnostics.title")}
              onAction={() => router.push("/diagnostics")}
            />
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{nextNotificationLine}</Text>
          )}
        </View>

        <View
          style={{ flex: 1 }}
          onLayout={(e) => {
            if (slideHeight === 0) setSlideHeight(e.nativeEvent.layout.height);
          }}
        >
          {slideHeight > 0 && feedIds.length > 0 ? (
            <FlatList
              data={feedIds}
              keyExtractor={(id) => id}
              renderItem={({ item, index }) => (
                <FeedItem
                  ayahId={item}
                  height={slideHeight}
                  isFavorite={favoriteIds.has(item)}
                  showSwipeHint={index === 0 && feedIds.length === 1}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              snapToInterval={slideHeight}
              decelerationRate="fast"
              getItemLayout={(_data, index) => ({ length: slideHeight, offset: slideHeight * index, index })}
              onEndReached={handleEndReached}
              onEndReachedThreshold={1.2}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
