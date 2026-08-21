import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Platform, Alert } from "react-native";

import { Screen, SectionHeader, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import {
  getPermissionSnapshot,
  requestPermission,
  sendTestNotification,
  isExactAlarmStatusDetectable,
  getOsScheduledSummary,
  sendDelayedTestNotification,
  type PermissionSnapshot,
  type OsScheduledSummary,
} from "@/notifications";
import { reschedule, forceFullReschedule } from "@/notifications/rescheduleService";
import { loadLastRescheduleInfo, type LastRescheduleInfo } from "@/storage/diagnosticsStore";
import { formatDateTime, detectTimeZone, formatTime } from "@/utils/dateUtils";
import { generateLocalId } from "@/utils/id";
import type { LocalLogEntry, NotificationSlot } from "@/domain/types";

export default function DiagnosticsScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const { preferences } = usePreferencesStore();
  const db = useAppDatabase();

  const [permission, setPermission] = useState<PermissionSnapshot | null>(null);
  const [slots, setSlots] = useState<NotificationSlot[]>([]);
  const [lastRun, setLastRun] = useState<LastRescheduleInfo | null>(null);
  const [errors, setErrors] = useState<LocalLogEntry[]>([]);
  const [osSummary, setOsSummary] = useState<OsScheduledSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setPermission(await getPermissionSnapshot());
    if (db) {
      setSlots(await db.notificationSlots.listUpcoming(new Date().toISOString()));
      setErrors(await db.logs.recent(10));
    }
    setLastRun(await loadLastRescheduleInfo());
    setOsSummary(await getOsScheduledSummary());
  }, [db]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard mount-time data load
    refresh();
  }, [refresh]);

  const handleReschedule = async (): Promise<void> => {
    if (!db) return;
    setBusy(true);
    await reschedule({ db, preferences, now: new Date(), timeZone: detectTimeZone(), generateId: generateLocalId });
    await refresh();
    setBusy(false);
  };

  const handleForceFullReschedule = (): void => {
    if (!db) return;
    Alert.alert(t("diagnostics.forceFullRescheduleConfirmTitle"), t("diagnostics.forceFullRescheduleConfirmBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          await forceFullReschedule({ db, preferences, now: new Date(), timeZone: detectTimeZone(), generateId: generateLocalId });
          await refresh();
          setBusy(false);
        },
      },
    ]);
  };

  const handleRequestPermission = async (): Promise<void> => {
    setPermission(await requestPermission());
  };

  const handleTest = async (): Promise<void> => {
    await sendTestNotification(preferences.interfaceLocale, t("common.appName"));
  };

  const handleDelayedTest = async (): Promise<void> => {
    await sendDelayedTestNotification(preferences.interfaceLocale, t("diagnostics.delayedTestBody"));
    await refresh();
  };

  const resultLabel = (status: LastRescheduleInfo["status"]): string => {
    if (status === "success") return t("diagnostics.resultSuccess");
    if (status === "partial") return t("diagnostics.resultPartial");
    if (status === "failed") return t("diagnostics.resultFailed");
    return t("settings.notificationsEnabled");
  };

  const row = (label: string, value: string): React.JSX.Element => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xxs }}>
      <Text style={{ color: colors.textSecondary, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.medium }}>{value}</Text>
    </View>
  );

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("diagnostics.title")}
        </Text>

        <SectionHeader title={t("diagnostics.permissionStatus")} />
        {row(
          t("diagnostics.permissionStatus"),
          permission ? t(`diagnostics.permission${capitalize(permission.state)}` as Parameters<typeof t>[0]) : "…",
        )}
        {row(t("diagnostics.previewsVisible"), permission?.alertStyleEnabled ? t("common.yes") : t("diagnostics.previewsUnknown"))}
        {permission?.state !== "granted" ? (
          <Button label={t("onboarding.step5.allowCta")} onPress={handleRequestPermission} variant="secondary" />
        ) : null}

        <SectionHeader title={t("diagnostics.nextNotification")} />
        {row(t("diagnostics.nextNotification"), slots[0] ? formatDateTime(slots[0].fireAtUtcIso, locale) : t("home.nextNotificationNone"))}
        {row(t("diagnostics.scheduledCount"), String(slots.length))}
        {row(t("diagnostics.activeWindow"), `${formatTime(preferences.schedule.startHour, 0, locale)} – ${formatTime(preferences.schedule.endHour, 0, locale)}`)}
        {row(t("diagnostics.frequency"), t("common.frequencyEveryHour", { count: preferences.schedule.frequencyHours }))}
        {row(t("diagnostics.timeZone"), detectTimeZone())}

        <SectionHeader title={t("diagnostics.osTruthTitle")} />
        {row(t("diagnostics.osScheduledCount"), osSummary ? String(osSummary.count) : "…")}
        {row(
          t("diagnostics.osNextNotification"),
          osSummary?.nextFireDateIso ? formatDateTime(osSummary.nextFireDateIso, locale) : t("home.nextNotificationNone"),
        )}
        {osSummary && osSummary.count !== slots.length ? (
          <Text style={{ color: colors.danger, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("diagnostics.osMismatchWarning")}
          </Text>
        ) : null}

        <SectionHeader title={t("diagnostics.lastScheduledAt")} />
        {row(t("diagnostics.lastScheduledAt"), lastRun ? formatDateTime(lastRun.atUtcIso, locale) : "—")}
        {row(t("diagnostics.lastScheduleResult"), lastRun ? resultLabel(lastRun.status) : "—")}

        <SectionHeader title={t("diagnostics.recentErrors")} />
        {errors.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>{t("diagnostics.noErrors")}</Text>
        ) : (
          errors.map((e) => (
            <Text key={e.id} style={{ color: colors.danger, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
              {formatDateTime(e.createdAtUtcIso, locale)} · {e.scope}: {e.message}
            </Text>
          ))
        )}

        <SectionHeader title={t("diagnostics.platformRecommendationsTitle")} />
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {Platform.OS === "ios"
            ? "iOS limits how many notifications an app can keep pending at once. Opening IqraTime occasionally keeps the queue full — see docs/NOTIFICATIONS.md."
            : "On some Android manufacturers (e.g. aggressive battery optimization), disable battery optimization for IqraTime and check that exact alarms are allowed in system settings if delivery feels late."}
        </Text>
        {Platform.OS === "android" && !isExactAlarmStatusDetectable() ? (
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
            Exact-alarm permission status cannot be read programmatically on this platform version; check Settings → Apps → IqraTime → Alarms & reminders if notifications feel imprecise.
          </Text>
        ) : null}

        <Button label={t("diagnostics.sendTestCta")} onPress={handleTest} variant="secondary" />
        <Button label={t("diagnostics.sendDelayedTestCta")} onPress={handleDelayedTest} variant="secondary" />
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("diagnostics.delayedTestHint")}
        </Text>
        <Button label={t("diagnostics.rescheduleCta")} onPress={handleReschedule} disabled={busy} />
        <Button label={t("diagnostics.forceFullRescheduleCta")} onPress={handleForceFullReschedule} variant="danger" disabled={busy} />
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("diagnostics.forceFullRescheduleHint")}
        </Text>
      </View>
    </Screen>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
