import React, { useMemo, useState } from "react";
import { View, Text, Switch } from "react-native";
import { useRouter } from "expo-router";

import { Screen, Button, LanguageChipSelector, DaySelector, FrequencySelector, TimeSelector, Chip, AyahCard } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { getRuntimeCorpus, getTranslation } from "@/data/corpus";
import { ALL_THEME_KEYS, type ThemeKey } from "@/domain/types";
import { requestPermission, getPermissionSnapshot, sendTestNotification, openSystemNotificationSettings } from "@/notifications";
import { formatNotificationBody } from "@/notifications/rescheduleService";
import type { PermissionState } from "@/notifications/permissions";

const TOTAL_STEPS = 6;

export default function OnboardingScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { preferences, update } = usePreferencesStore();
  const db = useAppDatabase();

  const [step, setStep] = useState(1);
  const [permissionState, setPermissionState] = useState<PermissionState>("undetermined");
  const [testStatus, setTestStatus] = useState<"idle" | "sent" | "failed">("idle");

  const previewEntry = useMemo(() => getRuntimeCorpus()[0], []);
  const previewTranslation = previewEntry ? getTranslation(previewEntry.arabic.id, preferences.translationLocale) : undefined;

  const next = (): void => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const finish = async (): Promise<void> => {
    await update({ onboardingCompleted: true });
    router.replace("/(tabs)");
  };

  const requestAndSchedule = async (): Promise<void> => {
    const snapshot = await requestPermission();
    setPermissionState(snapshot.state);
    if (snapshot.state === "granted" && db) {
      await update({ schedule: { ...preferences.schedule, enabled: true } });
    }
  };

  const runTest = async (): Promise<void> => {
    try {
      // Same trap as the Diagnostics test buttons: firing the API without
      // permission silently does nothing, so the button read as broken.
      // Ask here if it was never asked (the user can reach this step via
      // "Not now"), and report failure rather than appearing inert.
      let snapshot = await getPermissionSnapshot();
      if (snapshot.state === "undetermined" && snapshot.canAskAgain) {
        snapshot = await requestPermission();
        setPermissionState(snapshot.state);
      }
      if (snapshot.state !== "granted") {
        setTestStatus("failed");
        return;
      }

      const body = previewEntry
        ? formatNotificationBody({
            arabicText: previewEntry.arabic.text,
            translationText: previewTranslation?.text,
            showArabic: preferences.showArabicText,
            textOrder: preferences.textOrder,
            displayMode: preferences.textDisplayMode,
          })
        : t("common.appName");
      await sendTestNotification(preferences.interfaceLocale, body);
      setTestStatus("sent");
    } catch {
      setTestStatus("failed");
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {step} / {TOTAL_STEPS}
        </Text>

        {step === 1 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.accent, fontSize: typography.sizes.display * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
              {t("onboarding.step1.title")}
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.subtitle * fontScaleMultiplier }}>
              {t("onboarding.step1.subtitle")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
              {t("onboarding.step1.offlineNote")}
            </Text>
            <Button label={t("onboarding.step1.cta")} onPress={next} />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.title(colors.textPrimary, typography.sizes.title * fontScaleMultiplier)}>{t("onboarding.step2.title")}</Text>
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step2.interfaceLanguageLabel")}</Text>
            <LanguageChipSelector value={preferences.interfaceLocale} onChange={(locale) => update({ interfaceLocale: locale })} />
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step2.translationLanguageLabel")}</Text>
            <LanguageChipSelector value={preferences.translationLocale} onChange={(locale) => update({ translationLocale: locale })} />
            <View style={styles.row}>
              <Text style={{ color: colors.textPrimary, flex: 1 }}>{t("onboarding.step2.showArabicLabel")}</Text>
              <Switch value={preferences.showArabicText} onValueChange={(v) => update({ showArabicText: v })} />
            </View>
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step2.contentModeLabel")}</Text>
            <View style={styles.chipsRow}>
              <Chip label={t("settings.contentModeAyahOnly")} selected={preferences.contentMode === "ayah_only"} onPress={() => update({ contentMode: "ayah_only" })} />
              <Chip label={t("settings.contentModeHadithOnly")} selected={preferences.contentMode === "hadith_only"} onPress={() => update({ contentMode: "hadith_only" })} />
              <Chip label={t("settings.contentModeMixed")} selected={preferences.contentMode === "mixed"} onPress={() => update({ contentMode: "mixed" })} />
            </View>
            {previewEntry ? (
              <View style={{ gap: spacing.xs }}>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption }}>{t("onboarding.step2.previewLabel")}</Text>
                <AyahCard
                  surah={previewEntry.arabic.surah}
                  ayah={previewEntry.arabic.ayah}
                  arabicText={preferences.showArabicText ? previewEntry.arabic.text : undefined}
                  translationText={previewTranslation?.text}
                  textOrder={preferences.textOrder}
                />
              </View>
            ) : null}
            <Button label={t("onboarding.step2.cta")} onPress={next} />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.title(colors.textPrimary, typography.sizes.title * fontScaleMultiplier)}>{t("onboarding.step3.title")}</Text>
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step3.startLabel")}</Text>
            <TimeSelector
              label={t("onboarding.step3.startLabel")}
              hour={preferences.schedule.startHour}
              minute={0}
              onChange={(hour) => update({ schedule: { ...preferences.schedule, startHour: hour } })}
            />
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step3.endLabel")}</Text>
            <TimeSelector
              label={t("onboarding.step3.endLabel")}
              hour={preferences.schedule.endHour}
              minute={0}
              onChange={(hour) => update({ schedule: { ...preferences.schedule, endHour: hour } })}
            />
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step3.frequencyLabel")}</Text>
            <FrequencySelector
              value={preferences.schedule.frequencyHours}
              onChange={(hours) => update({ schedule: { ...preferences.schedule, frequencyHours: hours } })}
            />
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step3.activeDaysLabel")}</Text>
            <DaySelector activeDays={preferences.schedule.activeDays} onChange={(days) => update({ schedule: { ...preferences.schedule, activeDays: days } })} />
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step3.themesLabel")}</Text>
            <View style={styles.chipsRow}>
              {ALL_THEME_KEYS.slice(0, 8).map((theme) => (
                <Chip
                  key={theme}
                  label={t(`themes.names.${theme}` as Parameters<typeof t>[0])}
                  selected={preferences.selectedThemes.includes(theme)}
                  onPress={() => toggleTheme(theme)}
                />
              ))}
            </View>
            <Button label={t("onboarding.step3.cta")} onPress={next} />
          </View>
        ) : null}

        {step === 4 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.title(colors.textPrimary, typography.sizes.title * fontScaleMultiplier)}>{t("onboarding.step4.title")}</Text>
            <Text style={{ color: colors.textPrimary }}>{t("onboarding.step4.body")}</Text>
            <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold }}>{t("onboarding.step4.limitsTitle")}</Text>
            <Text style={{ color: colors.textSecondary }}>{t("onboarding.step4.limitsBody")}</Text>
            <Button label={t("onboarding.step4.openSettingsCta")} variant="secondary" onPress={() => openSystemNotificationSettings()} />
            <Button label={t("onboarding.step4.cta")} onPress={next} />
          </View>
        ) : null}

        {step === 5 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.title(colors.textPrimary, typography.sizes.title * fontScaleMultiplier)}>{t("onboarding.step5.title")}</Text>
            <Text style={{ color: colors.textPrimary }}>{t("onboarding.step5.body")}</Text>
            <Button label={t("onboarding.step5.allowCta")} onPress={requestAndSchedule} />
            <Button label={t("onboarding.step5.declineCta")} variant="ghost" onPress={next} />
            {permissionState === "denied" ? <Text style={{ color: colors.textSecondary }}>{t("onboarding.step5.declinedNote")}</Text> : null}
            <Button label={t("onboarding.step5.cta")} variant="secondary" onPress={next} />
          </View>
        ) : null}

        {step === 6 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.title(colors.textPrimary, typography.sizes.title * fontScaleMultiplier)}>{t("onboarding.step6.title")}</Text>
            <Text style={{ color: colors.textPrimary }}>{t("onboarding.step6.body")}</Text>
            <Button label={t("onboarding.step6.sendTestCta")} onPress={runTest} />
            {testStatus === "sent" ? <Text style={{ color: colors.success }}>{t("onboarding.step6.successNote")}</Text> : null}
            {testStatus === "failed" ? (
              <View style={{ gap: spacing.xs }}>
                <Text style={{ color: colors.danger }}>{t("onboarding.step6.failureNote")}</Text>
                <Button label={t("onboarding.step6.diagnosticsCta")} variant="secondary" onPress={() => router.push("/diagnostics")} />
              </View>
            ) : null}
            <Button label={t("onboarding.step6.finishCta")} onPress={finish} />
          </View>
        ) : null}
      </View>
    </Screen>
  );

  function toggleTheme(theme: ThemeKey): void {
    const has = preferences.selectedThemes.includes(theme);
    const next = has ? preferences.selectedThemes.filter((th) => th !== theme) : [...preferences.selectedThemes, theme];
    update({ selectedThemes: next });
  }
}

function titleStyle(color: string, size: number): { color: string; fontSize: number; fontWeight: "700" } {
  return { color, fontSize: size, fontWeight: "700" };
}

const styles = {
  row: { flexDirection: "row" as const, alignItems: "center" as const },
  chipsRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
  title: titleStyle,
};
