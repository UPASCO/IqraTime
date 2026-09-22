import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Share, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

import { Screen, AyahFeedSlide, HadithFeedSlide, NameFeedSlide, DuaFeedSlide, NotificationStatusCard, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { useAyahView } from "@/hooks/useAyahView";
import { useHadithView } from "@/hooks/useHadithView";
import { getRuntimeCorpus, getTranslation, getCorpusEntry, getAntiRepeatWindow } from "@/data/corpus";
import { getRuntimeHadithCorpus, hasAnyHadithContent, getHadithTransliteration } from "@/data/corpus/hadith";
import { selectAyah } from "@/services/selectionEngine";
import { MAX_NOTIFICATION_AYAH_LENGTH } from "@/domain/constants";
import { getPermissionSnapshot } from "@/notifications";
import { reschedule } from "@/notifications/rescheduleService";
import type { ContentKinds, NotificationSlot } from "@/domain/types";
import { formatShareText, formatHadithShareText, buildGetTheAppLine } from "@/utils/shareText";
import { formatDateTime, detectTimeZone } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import { recordAppOpen, type StreakInfo } from "@/storage/streakStore";
import { incrementShareCount } from "@/storage/shareCounterStore";
import { isHadithFavorite, addHadithFavorite, removeHadithFavorite } from "@/storage/hadithFavoritesStore";
import { hadithIdToRouteParam } from "@/utils/routeParams";
import { nextFeedKind, effectiveContentKinds, type FeedKind } from "@/services/feedContentMode";
import { getName, nameMeaningFor, getAllNames } from "@/data/names";
import { duasTranslatedFor, getDua, duaTitleFor, duaTranslationFor, duaSourceLabel } from "@/data/duas";
import { isNameFavorite, toggleNameFavorite, isDuaFavorite, toggleDuaFavorite } from "@/storage/extrasFavoritesStore";
import { isInHifz, addToHifz, removeFromHifz, type HifzKind } from "@/storage/hifzStore";
import { settledSlideIndex, slidesNeeded } from "@/services/feedBuffer";

/**
 * Memorization state for one feed slide, backed by hifzStore — the same
 * optimistic-toggle pattern for all four content kinds, so the rail's
 * 🎓 button behaves identically everywhere.
 */
function useHifzToggle(id: string, kind: HifzKind): { memorized: boolean; toggleMemorized: () => void } {
  const [memorized, setMemorized] = useState(false);
  useEffect(() => {
    let cancelled = false;
    isInHifz(id).then((value) => {
      if (!cancelled) setMemorized(value);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  const toggleMemorized = useCallback((): void => {
    setMemorized((current) => {
      const next = !current;
      if (next) addToHifz(id, new Date(), kind);
      else removeFromHifz(id);
      return next;
    });
  }, [id, kind]);
  return { memorized, toggleMemorized };
}

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
  const ayahView = useAyahView(ayahId, preferences.translationLocale, preferences.showTransliteration);
  const { memorized, toggleMemorized } = useHifzToggle(ayahId, "ayah");

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
      transliteration={preferences.showTransliteration ? ayahView.transliterationText : undefined}
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
      isMemorized={memorized}
      onToggleMemorize={toggleMemorized}
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
  const { memorized, toggleMemorized } = useHifzToggle(hadithId, "hadith");

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
      transliteration={preferences.showTransliteration ? getHadithTransliteration(hadithId) : undefined}
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
      isMemorized={memorized}
      onToggleMemorize={toggleMemorized}
    />
  );
}

/** A Name of Allah as a feed slide. */
function NameFeedItem({ nameNumber, height, showSwipeHint }: { nameNumber: number; height: number; showSwipeHint: boolean }): React.JSX.Element {
  const router = useRouter();
  const { t, locale } = useI18n();
  const name = getName(nameNumber);
  const [favorite, setFavorite] = useState(false);
  const { memorized, toggleMemorized } = useHifzToggle(String(nameNumber), "name");
  useEffect(() => {
    isNameFavorite(nameNumber).then(setFavorite);
  }, [nameNumber]);

  if (!name) {
    return (
      <View style={{ height, alignItems: "center", justifyContent: "center" }}>
        <EmptyState title={t("home.noAyahYetTitle")} body={t("home.noAyahYetBody")} />
      </View>
    );
  }

  const meaning = nameMeaningFor(name, locale);
  const shareText = [
    name.arabic,
    meaning ? `${name.transliteration} — ${meaning}` : name.transliteration,
    `${t("names.positionLabel", { number: name.number })} (${t("common.appName")})`,
    buildGetTheAppLine(t),
  ].join("\n\n");

  return (
    <NameFeedSlide
      height={height}
      number={name.number}
      arabic={name.arabic}
      transliteration={name.transliteration}
      meaning={meaning}
      isFavorite={favorite}
      onToggleFavorite={() => {
        toggleNameFavorite(name.number).then(setFavorite);
      }}
      isMemorized={memorized}
      onToggleMemorize={toggleMemorized}
      showSwipeHint={showSwipeHint}
      onShare={() => {
        incrementShareCount();
        Share.share({ message: shareText });
      }}
      onCopy={() => Clipboard.setStringAsync(shareText)}
      onOpenDetail={() => router.push(`/names?n=${name.number}`)}
    />
  );
}

/** An invocation as a feed slide. */
function DuaFeedItem({ duaId, height, showSwipeHint }: { duaId: string; height: number; showSwipeHint: boolean }): React.JSX.Element {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { preferences } = usePreferencesStore();
  const dua = getDua(duaId);
  const [favorite, setFavorite] = useState(false);
  const { memorized, toggleMemorized } = useHifzToggle(duaId, "dua");
  useEffect(() => {
    isDuaFavorite(duaId).then(setFavorite);
  }, [duaId]);

  if (!dua) {
    return (
      <View style={{ height, alignItems: "center", justifyContent: "center" }}>
        <EmptyState title={t("home.noAyahYetTitle")} body={t("home.noAyahYetBody")} />
      </View>
    );
  }

  const title = duaTitleFor(dua, locale);
  const translation = duaTranslationFor(dua, locale);
  const sourceLabel = duaSourceLabel(dua);
  const shareText = [
    dua.arabic,
    translation,
    sourceLabel ? `${title} — ${sourceLabel}` : title,
    `(${t("common.appName")})`,
    buildGetTheAppLine(t),
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <DuaFeedSlide
      height={height}
      title={title}
      arabicText={dua.arabic}
      transliteration={preferences.showTransliteration ? dua.transliteration : undefined}
      translationText={translation}
      source={sourceLabel}
      isFavorite={favorite}
      onToggleFavorite={() => {
        toggleDuaFavorite(dua.id).then(setFavorite);
      }}
      isMemorized={memorized}
      onToggleMemorize={toggleMemorized}
      showSwipeHint={showSwipeHint}
      onShare={() => {
        incrementShareCount();
        Share.share({ message: shareText });
      }}
      onCopy={() => Clipboard.setStringAsync(shareText)}
      onOpenDetail={() => router.push(`/duas/${dua.id}`)}
    />
  );
}

/**
 * One slide in the feed. The same content can legitimately appear more
 * than once as the user keeps scrolling (every pool is finite), so the
 * list key is a per-slide counter rather than the content id.
 */
interface FeedEntry {
  readonly key: string;
  readonly kind: FeedKind;
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

/** Same session-scoped anti-repeat as pickHadithId, over the 99 Names. */
function pickNameNumber(avoidNumbers: ReadonlySet<number>): number | undefined {
  const names = getAllNames();
  if (names.length === 0) return undefined;
  const pool = names.filter((n) => !avoidNumbers.has(n.number));
  const from = pool.length > 0 ? pool : names;
  return from[Math.floor(Math.random() * from.length)]?.number;
}

/**
 * Same session-scoped anti-repeat over the invocations. The pool is
 * locale-pure (duasTranslatedFor): a French reader's feed only ever
 * serves duas that exist in French — the full library, with its explicit
 * English-fallback notice, stays one tap away on the Invocations screen.
 */
function pickDuaId(avoidIds: ReadonlySet<string>, locale: string): string | undefined {
  const duas = duasTranslatedFor(locale);
  if (duas.length === 0) return undefined;
  const pool = duas.filter((d) => !avoidIds.has(d.id));
  const from = pool.length > 0 ? pool : duas;
  return from[Math.floor(Math.random() * from.length)]?.id;
}

const NO_IDS: ReadonlySet<string> = new Set();

/**
 * A synchronous first guess for the feed's opening slide, used only as the
 * useState() initial value so the very first render already has content to
 * show instead of a blank flash while loadInitialState()'s async DB reads
 * (history, favorites) are still in flight. loadInitialState() still runs
 * right after mount and replaces this with a real selection-engine pick
 * once that's available — this is purely about never rendering nothing in
 * between.
 */
function pickInitialFeedEntry(kinds: ContentKinds, translationLocale: string): FeedEntry | undefined {
  const kind = nextFeedKind(kinds, undefined);
  if (kind === "hadith") {
    const id = pickHadithId(NO_IDS);
    return id ? { key: "slide-0", kind: "hadith", id } : undefined;
  }
  if (kind === "name") {
    const number = pickNameNumber(new Set());
    return number !== undefined ? { key: "slide-0", kind: "name", id: String(number) } : undefined;
  }
  if (kind === "dua") {
    const id = pickDuaId(NO_IDS, translationLocale);
    return id ? { key: "slide-0", kind: "dua", id } : undefined;
  }
  const id = getRuntimeCorpus()[0]?.arabic.id;
  return id ? { key: "slide-0", kind: "ayah", id } : undefined;
}


export default function HomeScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();
  const { preferences } = usePreferencesStore();

  // Hadith availability depends on the translation locale, not just the
  // preference: hadith silently drops out of the rotation for a locale
  // with no hadith edition (see effectiveContentKinds) rather than showing
  // broken/empty hadith cards — with an explicit notice so it never reads
  // as the preference being ignored for no reason.
  const hadithAvailable = hasAnyHadithContent(preferences.translationLocale);
  // Memoized on the stored preference object: appendSlide/loadInitialState
  // hang off this value, and a fresh object identity every render would
  // re-trigger their effects in a loop.
  const contentKinds: ContentKinds = useMemo(
    () => effectiveContentKinds(preferences.contentKinds, preferences.translationLocale),
    [preferences.contentKinds, preferences.translationLocale],
  );
  const hadithUnavailableNotice = preferences.contentKinds.hadith && !hadithAvailable;

  const [feedItems, setFeedItems] = useState<FeedEntry[]>(() => {
    const initial = pickInitialFeedEntry(contentKinds, preferences.translationLocale);
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
  // Synchronous mirror of `feedItems`. topUpFeed() below appends several
  // slides in one async loop; reading the React state there would see the
  // stale closure value and compute the wrong "next kind" / length, so the
  // ref is the source of truth and setFeedItems() just publishes it.
  const feedItemsRef = useRef<FeedEntry[]>(feedItems);
  // Index of the slide currently on screen, updated from the FlatList's
  // scroll-settle callbacks. Drives how far ahead the buffer must reach.
  const currentIndexRef = useRef(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  // Every id already shown in this feed session. The history table alone
  // isn't enough to keep a long scroll from circling back: its writes are
  // async and a single scroll can outrun them, and the anti-repeat window
  // is bounded. This set is the authoritative "don't show it again"
  // record for the session, on top of history's cross-session memory.
  const shownAyahIds = useRef<Set<string>>(new Set());
  const shownHadithIds = useRef<Set<string>>(new Set());
  const shownNameNumbers = useRef<Set<number>>(new Set());
  const shownDuaIds = useRef<Set<string>>(new Set());

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

  /**
   * Picks and appends exactly one slide after the current last one. Returns
   * false when neither corpus can supply anything (empty corpus) so the
   * caller can stop looping instead of spinning.
   */
  const appendSlide = useCallback(async (): Promise<boolean> => {
    const lastEntry = feedItemsRef.current[feedItemsRef.current.length - 1];
    const kind = nextFeedKind(contentKinds, lastEntry?.kind);
    let entry: FeedEntry | undefined;
    if (kind === "hadith") {
      const nextId = pickHadithId(shownHadithIds.current);
      if (nextId) {
        shownHadithIds.current.add(nextId);
        if (await isHadithFavorite(nextId)) setHadithFavoriteIds((prev) => new Set(prev).add(nextId));
        entry = { key: `slide-${slideCounter.current++}`, kind: "hadith", id: nextId };
      }
    } else if (kind === "name") {
      const nextNumber = pickNameNumber(shownNameNumbers.current);
      if (nextNumber !== undefined) {
        shownNameNumbers.current.add(nextNumber);
        entry = { key: `slide-${slideCounter.current++}`, kind: "name", id: String(nextNumber) };
      }
    } else if (kind === "dua") {
      const nextId = pickDuaId(shownDuaIds.current, preferences.translationLocale);
      if (nextId) {
        shownDuaIds.current.add(nextId);
        entry = { key: `slide-${slideCounter.current++}`, kind: "dua", id: nextId };
      }
    } else {
      const nextId = await pickAnotherAyah();
      // Always append, even when this ayah already appeared earlier in the
      // session: the feed is endless by design, so a finite corpus simply
      // starts coming round again instead of the scroll dead-ending.
      if (nextId) entry = { key: `slide-${slideCounter.current++}`, kind: "ayah", id: nextId };
    }
    if (!entry) return false;
    feedItemsRef.current = [...feedItemsRef.current, entry];
    setFeedItems(feedItemsRef.current);
    return true;
  }, [contentKinds, pickAnotherAyah, preferences.translationLocale]);

  /**
   * Keeps FEED_BUFFER (src/services/feedBuffer.ts) slides ready *below* the
   * one on screen.
   *
   * The feed used to grow by exactly one slide per FlatList onEndReached
   * call, starting from a single full-screen item. On Android that callback
   * is unreliable when the content is no taller than the viewport (it can
   * fire once, late, or not at all), so intermittently there was simply no
   * next slide to swipe to and the gesture bounced back onto the same āyah.
   * Pre-filling a small buffer — on mount and after every settled swipe —
   * means a next page always exists before the user reaches for it, and
   * onEndReached becomes a redundant safety net rather than the mechanism.
   */
  const topUpFeed = useCallback(async (): Promise<void> => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    try {
      let remaining = slidesNeeded(currentIndexRef.current, feedItemsRef.current.length);
      while (remaining > 0) {
        if (!(await appendSlide())) break;
        remaining -= 1;
      }
    } finally {
      loadingMore.current = false;
    }
  }, [appendSlide]);

  const loadInitialState = useCallback(async () => {
    if (!db) return;
    const firstKind = nextFeedKind(contentKinds, undefined);
    if (firstKind === "hadith") {
      const firstHadithId = pickHadithId(shownHadithIds.current);
      if (firstHadithId) {
        shownHadithIds.current.add(firstHadithId);
        feedItemsRef.current = [{ key: "slide-0", kind: "hadith", id: firstHadithId }];
        currentIndexRef.current = 0;
        setFeedItems(feedItemsRef.current);
        if (await isHadithFavorite(firstHadithId)) {
          setHadithFavoriteIds((prev) => new Set(prev).add(firstHadithId));
        }
      }
    } else if (firstKind === "name" || firstKind === "dua") {
      // The rotation starts at the first enabled kind; āyāt lead whenever
      // they're on, so this branch only runs when the user turned them off.
      const entry = pickInitialFeedEntry(contentKinds, preferences.translationLocale);
      if (entry) {
        feedItemsRef.current = [entry];
        currentIndexRef.current = 0;
        setFeedItems(feedItemsRef.current);
        if (entry.kind === "name") shownNameNumbers.current.add(Number(entry.id));
        else shownDuaIds.current.add(entry.id);
      }
    } else {
      // Opening slide goes through the selection engine like every other
      // slide, rather than replaying the newest history row: resuming on
      // the last-seen āyah meant every launch opened on the one the user
      // had just read, which reads as the app repeating itself.
      const firstId = await pickAnotherAyah();
      if (firstId) {
        feedItemsRef.current = [{ key: "slide-0", kind: "ayah", id: firstId }];
        currentIndexRef.current = 0;
        setFeedItems(feedItemsRef.current);
        if (await db.favorites.isFavorite(firstId)) {
          setFavoriteIds((prev) => new Set(prev).add(firstId));
        }
      }
    }
    // Pre-fill the swipe buffer right away so the very first swipe already
    // has somewhere to go (see topUpFeed for why this can't wait for
    // onEndReached). Not awaited: the notification bookkeeping below must
    // not be delayed by DB reads for slides the user hasn't asked for yet.
    topUpFeed();

    recordAppOpen().then(setStreak);

    const permission = await getPermissionSnapshot();
    if (permission.state === "denied") {
      setNextSlot((await db.notificationSlots.listUpcoming(new Date().toISOString()))[0]);
      setStatusMessage(t("diagnostics.permissionDenied"));
    } else if (!preferences.schedule.enabled) {
      setNextSlot((await db.notificationSlots.listUpcoming(new Date().toISOString()))[0]);
      setStatusMessage(undefined);
    } else {
      // AutoRescheduler (app/_layout.tsx) already reschedules on every app
      // foreground, independently of this screen mounting. Awaiting the
      // same reschedule() here — safe to call again, it's idempotent —
      // guarantees "upcoming" below reflects this session's actual outcome
      // rather than possibly racing AutoRescheduler's own call and catching
      // the queue mid-refill.
      //
      // A scheduling failure is deliberately never surfaced here: it's a
      // developer-facing signal (Diagnostics already reads the same
      // reschedule() outcome via loadLastRescheduleInfo()), not something an
      // everyday user can act on or should be alarmed by on the home
      // screen. Silently falling back to nextNotificationLine's plain
      // "no notification scheduled yet" reads as normal, not broken.
      await reschedule({
        db,
        preferences,
        now: new Date(),
        timeZone: detectTimeZone(),
        generateId: generateLocalId,
      });
      const upcoming = await db.notificationSlots.listUpcoming(new Date().toISOString());
      setNextSlot(upcoming[0]);
      setStatusMessage(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately scoped to schedule.enabled: AutoRescheduler (app/_layout.tsx) already reruns reschedule() reactively on every other preferences change, so this effect only needs to fire on mount and when scheduling is toggled, not on every unrelated preference edit.
  }, [db, preferences.schedule.enabled, contentKinds, t, pickAnotherAyah, topUpFeed]);

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  const nextNotificationLine = useMemo(() => {
    if (!nextSlot) return t("home.nextNotificationNone");
    return t("home.nextAyahAt", { time: formatDateTime(nextSlot.fireAtUtcIso, locale) });
  }, [nextSlot, locale, t]);

  /**
   * The quick-access rail: one slim row of circular shortcuts (Muslim
   * Pro-style) so the four content worlds are one tap away without giving
   * the header more than ~70px. Everything else lives in the Explore tab.
   */
  const quickLinks = useMemo(
    () =>
      [
        { icon: "book-outline", label: t("quran.title"), route: "/quran" },
        { icon: "layers-outline", label: t("hadith.menuTitle"), route: "/hadith" },
        { icon: "flower-outline", label: t("duas.title"), route: "/duas" },
        { icon: "diamond-outline", label: t("names.title"), route: "/names" },
        { icon: "school-outline", label: t("hifz.title"), route: "/hifz" },
      ] as const,
    [t],
  );

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

  /**
   * Called whenever the FlatList settles on a page (both after a flick and
   * after a slow drag released without momentum — Android fires only one of
   * the two depending on the gesture, so both are wired to this). Records
   * which slide is on screen and refills the buffer beneath it.
   */
  const handleScrollSettled = (offsetY: number): void => {
    if (slideHeight <= 0) return;
    const index = settledSlideIndex(offsetY, slideHeight, feedItemsRef.current.length);
    currentIndexRef.current = index;
    if (index > 0 && !hasSwiped) setHasSwiped(true);
    topUpFeed();
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

          {/* Quick-access rail: five circular shortcuts on one slim row —
              direct entry into each content world without giving the
              header real estate back to a menu. The "of the day" cards
              live at the top of the Explore tab, and the daily content
              itself flows through the feed below. */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {quickLinks.map((link) => (
              <Pressable
                key={link.route}
                onPress={() => router.push(link.route)}
                accessibilityRole="button"
                accessibilityLabel={link.label}
                style={({ pressed }) => ({ alignItems: "center", gap: 3, width: 62, opacity: pressed ? 0.6 : 1 })}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: colors.goldDecorative,
                  }}
                >
                  <Ionicons name={link.icon} size={21} color={colors.gold} />
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.sizes.caption * 0.92 * fontScaleMultiplier,
                    fontWeight: typography.weights.medium,
                  }}
                >
                  {link.label}
                </Text>
              </Pressable>
            ))}
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
                    showSwipeHint={index === 0 && !hasSwiped}
                    onToggleFavorite={handleToggleHadithFavorite}
                  />
                ) : item.kind === "name" ? (
                  <NameFeedItem nameNumber={Number(item.id)} height={slideHeight} showSwipeHint={index === 0 && !hasSwiped} />
                ) : item.kind === "dua" ? (
                  <DuaFeedItem duaId={item.id} height={slideHeight} showSwipeHint={index === 0 && !hasSwiped} />
                ) : (
                  <FeedItem
                    ayahId={item.id}
                    height={slideHeight}
                    isFavorite={favoriteIds.has(item.id)}
                    showSwipeHint={index === 0 && !hasSwiped}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              }
              pagingEnabled
              showsVerticalScrollIndicator={false}
              // One full slide per snap, aligned to the top of the viewport,
              // and never more than one page per flick: without
              // disableIntervalMomentum a strong Android fling can overshoot
              // two pages, and a gentle one can settle back on the page it
              // started from. overScrollMode="never" removes the Android
              // stretch/glow at the ends, which otherwise made a swipe past
              // the last buffered slide look like the list had jammed.
              snapToInterval={slideHeight}
              snapToAlignment="start"
              disableIntervalMomentum
              decelerationRate="fast"
              overScrollMode="never"
              // Every slide is a full-height card; keeping the neighbours
              // mounted (rather than clipped/recycled) is what makes the
              // next page paint instantly on swipe instead of after a
              // blank frame. Three slides mounted at a time is cheap.
              removeClippedSubviews={false}
              initialNumToRender={3}
              windowSize={5}
              getItemLayout={(_data, index) => ({ length: slideHeight, offset: slideHeight * index, index })}
              onMomentumScrollEnd={(e) => handleScrollSettled(e.nativeEvent.contentOffset.y)}
              onScrollEndDrag={(e) => handleScrollSettled(e.nativeEvent.contentOffset.y)}
              // Safety net only — the buffer above is the real mechanism.
              onEndReached={() => topUpFeed()}
              onEndReachedThreshold={1.5}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
