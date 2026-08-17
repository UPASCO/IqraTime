import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Share } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { Screen, AyahCard, Button, NotificationStatusCard, EmptyState } from "@/components";
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

export default function HomeScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const db = useAppDatabase();
  const { preferences } = usePreferencesStore();

  const [currentAyahId, setCurrentAyahId] = useState<string | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const [nextSlot, setNextSlot] = useState<NotificationSlot | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

  const ayahView = useAyahView(currentAyahId, preferences.translationLocale);

  const loadInitialState = useCallback(async () => {
    if (!db) return;
    const history = await db.history.list(1);
    const latest = history[0];
    if (latest) {
      setCurrentAyahId(latest.ayahId);
    } else {
      const corpus = getRuntimeCorpus();
      setCurrentAyahId(corpus[0]?.arabic.id);
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

  useEffect(() => {
    if (!db || !currentAyahId) return;
    db.favorites.isFavorite(currentAyahId).then(setIsFavorite);
  }, [db, currentAyahId]);

  const nextNotificationLine = useMemo(() => {
    if (!nextSlot) return t("home.nextNotificationNone");
    return t("home.nextAyahAt", { time: formatDateTime(nextSlot.fireAtUtcIso, locale) });
  }, [nextSlot, locale, t]);

  const handleAnotherAyah = async (): Promise<void> => {
    if (!db) return;
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
    if (result.status === "selected") {
      setCurrentAyahId(result.ayahId);
      await db.history.add({
        id: generateLocalId(),
        ayahId: result.ayahId,
        locale: preferences.translationLocale,
        receivedAtUtcIso: new Date().toISOString(),
        source: "app_shuffle",
      });
    }
  };

  const handleToggleFavorite = async (): Promise<void> => {
    if (!db || !currentAyahId) return;
    if (isFavorite) {
      await db.favorites.remove(currentAyahId);
    } else {
      await db.favorites.add({ ayahId: currentAyahId, locale: preferences.translationLocale, addedAtUtcIso: new Date().toISOString() });
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async (): Promise<void> => {
    if (!ayahView.found) return;
    const message = formatShareText({
      translationText: ayahView.translationText,
      arabicText: ayahView.arabicText,
      surah: ayahView.surah,
      ayah: ayahView.ayah,
      includeArabic: preferences.showArabicText,
      includeTranslation: preferences.textDisplayMode !== "arabic_only",
      referenceLabel: t("ayah.surahLabel"),
      appName: t("common.appName"),
    });
    await Share.share({ message });
  };

  const handleCopy = async (): Promise<void> => {
    if (!ayahView.found) return;
    const message = formatShareText({
      translationText: ayahView.translationText,
      arabicText: ayahView.arabicText,
      surah: ayahView.surah,
      ayah: ayahView.ayah,
      includeArabic: preferences.showArabicText,
      includeTranslation: preferences.textDisplayMode !== "arabic_only",
      referenceLabel: t("ayah.surahLabel"),
      appName: t("common.appName"),
    });
    await Clipboard.setStringAsync(message);
  };

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
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
        ) : null}

        {ayahView.found ? (
          <AyahCard
            surah={ayahView.surah}
            ayah={ayahView.ayah}
            arabicText={preferences.showArabicText ? ayahView.arabicText : undefined}
            translationText={ayahView.translationText}
            translatorLabel={ayahView.translatorLabel}
            themeLabels={ayahView.themeLabels}
            textOrder={preferences.textOrder}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onCopy={handleCopy}
            onPress={() => router.push(`/ayah/${ayahView.surah}-${ayahView.ayah}`)}
          />
        ) : (
          <EmptyState title={t("home.noAyahYetTitle")} body={t("home.noAyahYetBody")} />
        )}

        <Button label={t("home.anotherAyahCta")} onPress={handleAnotherAyah} variant="secondary" />

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>{nextNotificationLine}</Text>
          <Button label={t("home.editScheduleCta")} variant="ghost" onPress={() => router.push("/(tabs)/settings")} />
        </View>

        <Button label={t("themes.title")} variant="ghost" onPress={() => router.push("/themes")} />
      </View>
    </Screen>
  );
}
