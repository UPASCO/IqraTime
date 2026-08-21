import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Share, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

import { Screen, AyahFeedSlide, HadithFeedSlide, NotificationStatusCard, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import { useHadithView } from "@/hooks/useHadithView";
import { getRuntimeCorpus, getTranslation, getCorpusEntry } from "@/data/corpus";
import { getRuntimeHadithCorpus, hasAnyHadithContent } from "@/data/corpus/hadith";
import { selectAyah } from "@/services/selectionEngine";
import { DEFAULT_ANTI_REPEAT_WINDOW, MAX_NOTIFICATION_AYAH_LENGTH } from "@/domain/constants";
import { getPermissionSnapshot } from "@/notifications";
import type { ContentMode, NotificationSlot } from "@/domain/types";
import { formatShareText, formatHadithShareText } from "@/utils/shareText";
import { formatDateTime } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import { recordAppOpen, type StreakInfo } from "@/storage/streakStore";
import { isHadithFavorite, addHadithFavorite, removeHadithFavorite } from "@/storage/hadithFavoritesStore";
import { hadithIdToRouteParam } from "@/utils/routeParams";
import { nextFeedKind } from "@/services/feedContentMode";

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

/** The hadith counterpart to FeedItem above. */
function HadithFeedItem({
  hadithId,
  height,
  isFavorite,
  showSwipeHint,
  onToggleFavorite,
}: {
  hadithId: string;
  height: number;
  isFavorite: boolean;
  showSwipeHint: boolean;
  onToggleFavorite: (hadithId: string) => void;
}): React.JSX.Element {
  const router = useRouter();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const hadithView = useHadithView(hadithId, preferences.translationLocale);

  if (!hadithView.found) {
    return (
      <View style={{ height, alignItems: "center", justifyContent: "center" }}>
        <EmptyState title={t("home.noAyahYetTitle")} body={t("home.noAyahYetBody")} />
      </View>
    );
  }

  const shareText = (): string =>
    formatHadithShareText({
      translationText: hadithView.translationText,
      arabicText: hadithView.arabicText,
      collectionDisplayName: hadithView.collectionDisplayName,
      hadithNumber: hadithView.hadithNumber,
      includeArabic: preferences.showArabicText,
      includeTranslation: preferences.textDisplayMode !== "arabic_only",
      appName: t("common.appName"),
    });

  return (
    <HadithFeedSlide
      height={height}
      collectionDisplayName={hadithView.collectionDisplayName}
      hadithNumber={hadithView.hadithNumber}
      arabicText={preferences.showArabicText ? hadithView.arabicText : undefined}
      translationText={hadithView.translationText}
      translatorLabel={hadithView.translatorLabel}
      textOrder={preferences.textOrder}
      isFavorite={isFavorite}
      showSwipeHint={showSwipeHint}
      onToggleFavorite={() => onToggleFavorite(hadithId)}
      onShare={() => Share.share({ message: shareText() })}
      onCopy={() => Clipboard.setStringAsync(shareText())}
      onOpenDetail={() => router.push(`/hadith/${hadithIdToRouteParam(hadithId)}`)}
    />
  );
}

/**
 * One slide in the feed. The same ayah/hadith can legitimately appear more
 * than once as the user keeps scrolling (both corpora are finite), so the
 * list key is a per-slide counter rather than the content id.
 */
interface FeedEntry {
  readonly key: string;
  readonly kind: "ayah" | "hadith";
  readonly id: string;
}

/** Any corpus entry other than `avoidAyahId` — the last-resort pick that keeps the feed scrolling once the selection engine has no fresh candidates left. */
function pickFallbackAyahId(avoidAyahId?: string): string | undefined {
  const corpus = getRuntimeCorpus();
  if (corpus.length === 0) return undefined;
  const pool = corpus.filter((e) => e.arabic.id !== avoidAyahId);
  const from = pool.length > 0 ? pool : corpus;
  return from[Math.floor(Math.random() * from.length)]?.arabic.id;
}

/**
 * Hadith has no selection engine yet (no anti-repeat/theme weighting) —
 * a plain random pick, avoiding an immediate repeat, same simplification
 * tier as pickFallbackAyahId above.
 */
function pickHadithId(avoidHadithId?: string): string | undefined {
  const corpus = getRuntimeHadithCorpus();
  if (corpus.length === 0) return undefined;
  const pool = corpus.filter((e) => e.arabic.id !== avoidHadithId);
  const from = pool.length > 0 ? pool : corpus;
  return from[Math.floor(Math.random() * from.length)]?.arabic.id;
}


export default function HomeScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();
  const { preferences } = usePreferencesStore();

  const [feedItems, setFeedItems] = useState<FeedEntry[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [hadithFavoriteIds, setHadithFavoriteIds] = useState<Set<string>>(new Set());
  const [nextSlot, setNextSlot] = useState<NotificationSlot | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [slideHeight, setSlideHeight] = useState(0);
  const [streak, setStreak] = useState<StreakInfo | undefined>(undefined);

  const loadingMore = useRef(false);
  const slideCounter = useRef(1);

  // Hadith availability depends on the translation locale, not just the
  // preference: hadith_only/mixed silently degrade to ayah-only for a
  // locale with no hadith edition (es/pt/hi/it/zh-CN) rather than showing
  // broken/empty hadith cards — with an explicit notice so it never reads
  // as the preference being ignored for no reason.
  const hadithAvailable = hasAnyHadithContent(preferences.translationLocale);
  const effectiveContentMode: ContentMode = preferences.contentMode === "ayah_only" || hadithAvailable ? preferences.contentMode : "ayah_only";
  const hadithUnavailableNotice = preferences.contentMode !== "ayah_only" && !hadithAvailable;

  const pickAnotherAyah = useCallback(async (avoidAyahId?: string): Promise<string | undefined> => {
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
    // The feed must never dead-end: once every ayah has been shown, the
    // selection engine legitimately runs out of *fresh* candidates, so we
    // fall back to any corpus entry (avoiding an immediate repeat) and keep
    // scrolling rather than silently stopping.
    const ayahId = result.status === "selected" ? result.ayahId : pickFallbackAyahId(avoidAyahId);
    if (!ayahId) return undefined;

    await db.history.add({
      id: generateLocalId(),
      ayahId,
      locale: preferences.translationLocale,
      receivedAtUtcIso: new Date().toISOString(),
      source: "app_shuffle",
    });
    if (favorites.some((f) => f.ayahId === ayahId)) {
      setFavoriteIds((prev) => new Set(prev).add(ayahId));
    }
    return ayahId;
  }, [db, preferences]);

  const loadInitialState = useCallback(async () => {
    if (!db) return;
    const firstKind = nextFeedKind(effectiveContentMode, undefined);
    if (firstKind === "hadith") {
      const firstHadithId = pickHadithId();
      if (firstHadithId) {
        setFeedItems([{ key: "slide-0", kind: "hadith", id: firstHadithId }]);
        if (await isHadithFavorite(firstHadithId)) {
          setHadithFavoriteIds((prev) => new Set(prev).add(firstHadithId));
        }
      }
    } else {
      const history = await db.history.list(1);
      const latest = history[0];
      const firstId = latest ? latest.ayahId : getRuntimeCorpus()[0]?.arabic.id;
      if (firstId) {
        setFeedItems([{ key: "slide-0", kind: "ayah", id: firstId }]);
        if (await db.favorites.isFavorite(firstId)) {
          setFavoriteIds((prev) => new Set(prev).add(firstId));
        }
      }
    }

    const upcoming = await db.notificationSlots.listUpcoming(new Date().toISOString());
    setNextSlot(upcoming[0]);

    recordAppOpen().then(setStreak);

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
  }, [db, preferences.schedule.enabled, effectiveContentMode, t]);

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

  const handleToggleHadithFavorite = async (hadithId: string): Promise<void> => {
    const isFav = hadithFavoriteIds.has(hadithId);
    if (isFav) {
      await removeHadithFavorite(hadithId);
      setHadithFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(hadithId);
        return next;
      });
    } else {
      await addHadithFavorite(hadithId);
      setHadithFavoriteIds((prev) => new Set(prev).add(hadithId));
    }
  };

  const handleEndReached = async (): Promise<void> => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    try {
      const lastEntry = feedItems[feedItems.length - 1];
      const kind = nextFeedKind(effectiveContentMode, lastEntry?.kind);
      if (kind === "hadith") {
        const nextId = pickHadithId(lastEntry?.kind === "hadith" ? lastEntry.id : undefined);
        if (nextId) {
          if (await isHadithFavorite(nextId)) setHadithFavoriteIds((prev) => new Set(prev).add(nextId));
          setFeedItems((prev) => [...prev, { key: `slide-${slideCounter.current++}`, kind: "hadith", id: nextId }]);
        }
      } else {
        const nextId = await pickAnotherAyah(lastEntry?.kind === "ayah" ? lastEntry.id : undefined);
        if (nextId) {
          // Always append, even when this ayah already appeared earlier in the
          // session: the feed is endless by design, so a finite corpus simply
          // starts coming round again instead of the scroll dead-ending.
          setFeedItems((prev) => [...prev, { key: `slide-${slideCounter.current++}`, kind: "ayah", id: nextId }]);
        }
      }
    } finally {
      loadingMore.current = false;
    }
  };

  return (
    <Screen scroll={false} contentContainerStyle={{ padding: 0, flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: spacing.xs }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
              {t("home.title")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              {streak && streak.currentStreak > 1 ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="flame" size={16} color={colors.gold} />
                  <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
                    {t("home.streakLabel", { count: streak.currentStreak })}
                  </Text>
                </View>
              ) : null}
              <Pressable
                onPress={() => router.push("/progress")}
                accessibilityRole="button"
                accessibilityLabel={t("progress.title")}
                hitSlop={8}
              >
                <Ionicons name="ribbon-outline" size={22} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/library")}
                accessibilityRole="button"
                accessibilityLabel={t("home.libraryCta")}
                hitSlop={8}
              >
                <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>
          {statusMessage ? (
            <NotificationStatusCard
              message={statusMessage}
              tone="warning"
              actionLabel={t("diagnostics.title")}
              onAction={() => router.push("/diagnostics")}
            />
          ) : hadithUnavailableNotice ? (
            <Text style={{ color: colors.warning, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
              {t("hadith.unavailableInLanguageNotice")}
            </Text>
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
          {slideHeight > 0 && feedItems.length > 0 ? (
            <FlatList
              data={feedItems}
              keyExtractor={(entry) => entry.key}
              renderItem={({ item, index }) =>
                item.kind === "hadith" ? (
                  <HadithFeedItem
                    hadithId={item.id}
                    height={slideHeight}
                    isFavorite={hadithFavoriteIds.has(item.id)}
                    showSwipeHint={index === 0 && feedItems.length === 1}
                    onToggleFavorite={handleToggleHadithFavorite}
                  />
                ) : (
                  <FeedItem
                    ayahId={item.id}
                    height={slideHeight}
                    isFavorite={favoriteIds.has(item.id)}
                    showSwipeHint={index === 0 && feedItems.length === 1}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              }
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
