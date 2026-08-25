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
import { getRuntimeCorpus, getTranslation, getCorpusEntry, getAntiRepeatWindow, getTafsir } from "@/data/corpus";
import { getRuntimeHadithCorpus, hasAnyHadithContent } from "@/data/corpus/hadith";
import { selectAyah } from "@/services/selectionEngine";
import { MAX_NOTIFICATION_AYAH_LENGTH } from "@/domain/constants";
import { getPermissionSnapshot } from "@/notifications";
import { isSupportAvailable } from "@/services/supportPaymentService";
import type { ContentMode, NotificationSlot } from "@/domain/types";
import { formatShareText, formatHadithShareText, buildGetTheAppLine } from "@/utils/shareText";
import { formatDateTime } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import { recordAppOpen, type StreakInfo } from "@/storage/streakStore";
import { incrementShareCount } from "@/storage/shareCounterStore";
import { isHadithFavorite, addHadithFavorite, removeHadithFavorite } from "@/storage/hadithFavoritesStore";
import { hadithIdToRouteParam } from "@/utils/routeParams";
import { nextFeedKind } from "@/services/feedContentMode";
import { getDailyAyahId } from "@/services/dailyAyah";

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
  const hasTafsir = !!getTafsir(ayahId, preferences.translationLocale);

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
      getTheAppLine: buildGetTheAppLine(t),
    });

  return (
    <AyahFeedSlide
      height={height}
      surah={ayahView.surah}
      ayah={ayahView.ayah}
      arabicText={preferences.showArabicText ? ayahView.arabicText : undefined}
      translationText={ayahView.translationText}
      themeLabels={ayahView.themeLabels}
      textOrder={preferences.textOrder}
      isFavorite={isFavorite}
      showSwipeHint={showSwipeHint}
      onToggleFavorite={() => onToggleFavorite(ayahId)}
      onShare={() => Share.share({ message: shareText() })}
      shareText={shareText()}
      onShareAttempted={() => incrementShareCount()}
      onCopy={() => Clipboard.setStringAsync(shareText())}
      onOpenDetail={() => router.push(`/ayah/${ayahView.surah}-${ayahView.ayah}`)}
      // Only offered when a tafsir actually exists for this āyah in the
      // reader's language — 3 of the 12 locales have no edition at all
      // (docs/CORPUS.md "Tafsir"), and an always-present button that leads
      // to "unavailable" is worse than no button.
      onOpenTafsir={
        hasTafsir ? () => router.push(`/ayah/${ayahView.surah}-${ayahView.ayah}?tafsir=1`) : undefined
      }
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
      getTheAppLine: buildGetTheAppLine(t),
    });

  return (
    <HadithFeedSlide
      height={height}
      collectionDisplayName={hadithView.collectionDisplayName}
      hadithNumber={hadithView.hadithNumber}
      arabicText={preferences.showArabicText ? hadithView.arabicText : undefined}
      translationText={hadithView.translationText}
      textOrder={preferences.textOrder}
      isFavorite={isFavorite}
      showSwipeHint={showSwipeHint}
      onToggleFavorite={() => onToggleFavorite(hadithId)}
      onShare={() => Share.share({ message: shareText() })}
      shareText={shareText()}
      onShareAttempted={() => incrementShareCount()}
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

/**
 * Any corpus entry not in `avoidIds` — the last-resort pick that keeps the
 * feed scrolling once the selection engine has no fresh candidates left.
 * Avoiding the whole set already shown this session (not just the previous
 * slide) is what stops a long scroll from cycling over a handful of āyāt;
 * once genuinely everything has been seen it falls back to the full corpus
 * rather than dead-ending.
 */
function pickFallbackAyahId(avoidIds: ReadonlySet<string>): string | undefined {
  const corpus = getRuntimeCorpus();
  if (corpus.length === 0) return undefined;
  const pool = corpus.filter((e) => !avoidIds.has(e.arabic.id));
  const from = pool.length > 0 ? pool : corpus;
  return from[Math.floor(Math.random() * from.length)]?.arabic.id;
}

/**
 * Hadith has no selection engine yet (no theme weighting or persisted
 * history), so its anti-repeat is this session-scoped `avoidIds` set
 * alone — same "never re-show until the pool is exhausted" behaviour as
 * pickFallbackAyahId above, just without the cross-session memory āyāt get
 * from the history table.
 */
function pickHadithId(avoidIds: ReadonlySet<string>): string | undefined {
  const corpus = getRuntimeHadithCorpus();
  if (corpus.length === 0) return undefined;
  const pool = corpus.filter((e) => !avoidIds.has(e.arabic.id));
  const from = pool.length > 0 ? pool : corpus;
  return from[Math.floor(Math.random() * from.length)]?.arabic.id;
}

const NO_IDS: ReadonlySet<string> = new Set();

/** One shortcut chip in the home screen's menu row. */
interface HomeMenuItem {
  readonly icon: React.ComponentProps<typeof Ionicons>["name"];
  readonly label: string;
  readonly route: "/quran" | "/hadith" | "/hifz" | "/progress" | "/library" | "/support";
  /** Gives the chip the gold-bordered treatment reserved for primary destinations. */
  readonly emphasized: boolean;
}

/**
 * A synchronous first guess for the feed's opening slide, used only as the
 * useState() initial value so the very first render already has content to
 * show instead of a blank flash while loadInitialState()'s async DB reads
 * (history, favorites) are still in flight. loadInitialState() still runs
 * right after mount and replaces this with the real "resume where you left
 * off" pick (most recent history entry) once that's available — this is
 * purely about never rendering nothing in between.
 */
function pickInitialFeedEntry(effectiveContentMode: ContentMode): FeedEntry | undefined {
  if (nextFeedKind(effectiveContentMode, undefined) === "hadith") {
    const id = pickHadithId(NO_IDS);
    return id ? { key: "slide-0", kind: "hadith", id } : undefined;
  }
  const id = getRuntimeCorpus()[0]?.arabic.id;
  return id ? { key: "slide-0", kind: "ayah", id } : undefined;
}


export default function HomeScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale, direction } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();
  const { preferences } = usePreferencesStore();

  // Hadith availability depends on the translation locale, not just the
  // preference: hadith_only/mixed silently degrade to ayah-only for a
  // locale with no hadith edition (es/pt/hi/it/zh-CN) rather than showing
  // broken/empty hadith cards — with an explicit notice so it never reads
  // as the preference being ignored for no reason.
  const hadithAvailable = hasAnyHadithContent(preferences.translationLocale);
  const effectiveContentMode: ContentMode = preferences.contentMode === "ayah_only" || hadithAvailable ? preferences.contentMode : "ayah_only";
  const hadithUnavailableNotice = preferences.contentMode !== "ayah_only" && !hadithAvailable;

  const [feedItems, setFeedItems] = useState<FeedEntry[]>(() => {
    const initial = pickInitialFeedEntry(effectiveContentMode);
    return initial ? [initial] : [];
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [hadithFavoriteIds, setHadithFavoriteIds] = useState<Set<string>>(new Set());
  const [nextSlot, setNextSlot] = useState<NotificationSlot | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [slideHeight, setSlideHeight] = useState(0);
  const [streak, setStreak] = useState<StreakInfo | undefined>(undefined);

  const loadingMore = useRef(false);
  const slideCounter = useRef(1);
  // Every id already shown in this feed session. The history table alone
  // isn't enough to keep a long scroll from circling back: its writes are
  // async and a single scroll can outrun them, and the anti-repeat window
  // is bounded. This set is the authoritative "don't show it again"
  // record for the session, on top of history's cross-session memory.
  const shownAyahIds = useRef<Set<string>>(new Set());
  const shownHadithIds = useRef<Set<string>>(new Set());

  const pickAnotherAyah = useCallback(async (): Promise<string | undefined> => {
    if (!db) return undefined;
    const [recentAyahIds, favorites, hidden] = await Promise.all([
      db.history.recentAyahIds(getAntiRepeatWindow()),
      db.favorites.list(),
      db.hiddenAyahs.list(),
    ]);
    // Union of what the engine already knows (persisted history) and what
    // this session has put on screen — de-duplicated, since a slide shown
    // moments ago is usually in both.
    const excluded = Array.from(new Set([...recentAyahIds, ...shownAyahIds.current]));
    const result = selectAyah({
      corpus: getRuntimeCorpus(),
      getTranslation,
      translationLocale: preferences.translationLocale,
      showArabic: preferences.showArabicText,
      requireTranslation: preferences.textDisplayMode !== "arabic_only",
      localHour: new Date().getHours(),
      selectedThemes: preferences.selectedThemes,
      recentAyahIds: excluded,
      recentThemes: recentAyahIds.map((id) => getCorpusEntry(id)?.catalog.themes ?? []).flat(),
      favoriteAyahIds: favorites.map((f) => f.ayahId),
      hiddenAyahIds: hidden.map((h) => h.ayahId),
      maxLength: MAX_NOTIFICATION_AYAH_LENGTH,
      mode: preferences.selectionMode,
    });
    // The feed must never dead-end: once every ayah has been shown, the
    // selection engine legitimately runs out of *fresh* candidates, so we
    // fall back to any corpus entry not yet seen this session and keep
    // scrolling rather than silently stopping.
    const ayahId = result.status === "selected" ? result.ayahId : pickFallbackAyahId(shownAyahIds.current);
    if (!ayahId) return undefined;
    shownAyahIds.current.add(ayahId);

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
      const firstHadithId = pickHadithId(shownHadithIds.current);
      if (firstHadithId) {
        shownHadithIds.current.add(firstHadithId);
        setFeedItems([{ key: "slide-0", kind: "hadith", id: firstHadithId }]);
        if (await isHadithFavorite(firstHadithId)) {
          setHadithFavoriteIds((prev) => new Set(prev).add(firstHadithId));
        }
      }
    } else {
      // Opening slide goes through the selection engine like every other
      // slide, rather than replaying the newest history row: resuming on
      // the last-seen āyah meant every launch opened on the one the user
      // had just read, which reads as the app repeating itself.
      const firstId = await pickAnotherAyah();
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
  }, [db, preferences.schedule.enabled, effectiveContentMode, t, pickAnotherAyah]);

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  const nextNotificationLine = useMemo(() => {
    if (!nextSlot) return t("home.nextNotificationNone");
    return t("home.nextAyahAt", { time: formatDateTime(nextSlot.fireAtUtcIso, locale) });
  }, [nextSlot, locale, t]);

  // Deterministic and state-free (see dailyAyah.ts) — recomputing on each
  // render is cheap and needs no effect/refresh logic; the value only ever
  // changes at local midnight.
  const dailyAyahId = getDailyAyahId();
  const dailyRef = dailyAyahId ? getCorpusEntry(dailyAyahId) : undefined;

  /**
   * The home shortcut row. Qur'an and Hadith lead as the two primary
   * destinations; "Support IqraTime" is appended only when every donation
   * gate passes (see supportPaymentService), mirroring the website's own
   * nav — with no ads and no paid tier, this row is the only place in the
   * app a donation is discoverable without digging through Settings.
   */
  const menuItems = useMemo(() => {
    const items: HomeMenuItem[] = [
      { icon: "book-outline", label: t("quran.title"), route: "/quran", emphasized: true },
      { icon: "layers-outline", label: t("hadith.menuTitle"), route: "/hadith", emphasized: true },
      { icon: "school-outline", label: t("hifz.title"), route: "/hifz", emphasized: false },
      { icon: "ribbon-outline", label: t("progress.title"), route: "/progress", emphasized: false },
      { icon: "search-outline", label: t("home.libraryCta"), route: "/library", emphasized: false },
    ];
    if (isSupportAvailable()) {
      items.push({ icon: "heart-outline", label: t("support.menuLabel"), route: "/support", emphasized: false });
    }
    return items;
  }, [t]);

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
        const nextId = pickHadithId(shownHadithIds.current);
        if (nextId) {
          shownHadithIds.current.add(nextId);
          if (await isHadithFavorite(nextId)) setHadithFavoriteIds((prev) => new Set(prev).add(nextId));
          setFeedItems((prev) => [...prev, { key: `slide-${slideCounter.current++}`, kind: "hadith", id: nextId }]);
        }
      } else {
        const nextId = await pickAnotherAyah();
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
            {streak && streak.currentStreak > 1 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="flame" size={16} color={colors.gold} />
                <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
                  {t("home.streakLabel", { count: streak.currentStreak })}
                </Text>
              </View>
            ) : null}
          </View>

          {dailyRef ? (
            <Pressable
              onPress={() => router.push(`/ayah/${dailyRef.arabic.surah}-${dailyRef.arabic.ayah}`)}
              accessibilityRole="button"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.goldDecorative,
                borderRadius: 12,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              <Ionicons name="sunny-outline" size={18} color={colors.gold} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    color: colors.gold,
                    fontSize: typography.sizes.caption * fontScaleMultiplier,
                    fontWeight: typography.weights.semibold,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("daily.bannerLabel")}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}>
                  {t("ayah.surahLabel")} {dailyRef.arabic.surahNameTransliterated} · {dailyRef.arabic.surah}:{dailyRef.arabic.ayah}
                </Text>
              </View>
              <Ionicons name={direction === "rtl" ? "chevron-back" : "chevron-forward"} size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {menuItems.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: item.emphasized ? colors.surfaceElevated : colors.surface,
                  borderWidth: 1,
                  borderColor: item.emphasized ? colors.gold : colors.border,
                  borderRadius: 999,
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                }}
              >
                <Ionicons name={item.icon} size={16} color={item.emphasized ? colors.gold : colors.textSecondary} />
                <Text
                  style={{
                    color: item.emphasized ? colors.textPrimary : colors.textSecondary,
                    fontSize: typography.sizes.caption * fontScaleMultiplier,
                    fontWeight: item.emphasized ? typography.weights.semibold : typography.weights.medium,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => router.push("/moment")}
            accessibilityRole="button"
            accessibilityLabel={t("home.momentCta")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.surfaceElevated,
              borderRadius: 12,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexShrink: 1 }}>
              <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
              <Text
                style={{ color: colors.textPrimary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}
                numberOfLines={1}
              >
                {t("home.momentCta")}
              </Text>
            </View>
            <Ionicons name={direction === "rtl" ? "chevron-back" : "chevron-forward"} size={16} color={colors.textSecondary} />
          </Pressable>

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
