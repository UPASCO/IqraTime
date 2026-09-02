import React from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";

import { Screen, SectionHeader, SettingRow, TimeSelector, FrequencySelector, DaySelector, LanguageChipSelector, Chip } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAppDatabase } from "@/hooks/AppDatabaseProvider";
import { appConfig } from "@/config/appConfig";
import { isSupportAvailable } from "@/services/supportPaymentService";
import { clearStreak } from "@/storage/streakStore";
import { clearHifz } from "@/storage/hifzStore";
import type { TextSizeScale } from "@/domain/types";
import type { TranslationKey } from "@/i18n/schema";

const TEXT_SIZE_SCALES: readonly TextSizeScale[] = ["small", "medium", "large", "extra_large"];

/** Localized chip labels — the raw scale keys used to be shown verbatim ("extra_large") in every language. */
const TEXT_SIZE_LABEL_KEYS: Readonly<Record<TextSizeScale, TranslationKey>> = {
  small: "settings.textSizeSmall",
  medium: "settings.textSizeMedium",
  large: "settings.textSizeLarge",
  extra_large: "settings.textSizeExtraLarge",
};

export default function SettingsScreen(): React.JSX.Element {
  const { spacing } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { preferences, update, reset } = usePreferencesStore();
  const db = useAppDatabase();

  const handleResetAll = (): void => {
    Alert.alert(t("settings.resetConfirmTitle"), t("settings.resetConfirmBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await db?.resetAll();
          await reset();
          await clearStreak();
          await clearHifz();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <SectionHeader title={t("settings.sectionNotifications")} first />
        <SettingRow
          label={t("settings.notificationsEnabled")}
          value={preferences.schedule.enabled}
          onValueChange={(v) => update({ schedule: { ...preferences.schedule, enabled: v } })}
        />
        <SettingRow label={t("settings.scheduleStart")} />
        <TimeSelector
          label={t("settings.scheduleStart")}
          hour={preferences.schedule.startHour}
          minute={0}
          onChange={(hour) => update({ schedule: { ...preferences.schedule, startHour: hour } })}
        />
        <SettingRow label={t("settings.scheduleEnd")} />
        <TimeSelector
          label={t("settings.scheduleEnd")}
          hour={preferences.schedule.endHour}
          minute={0}
          onChange={(hour) => update({ schedule: { ...preferences.schedule, endHour: hour } })}
        />
        <SettingRow label={t("settings.scheduleFrequency")} />
        <FrequencySelector
          value={preferences.schedule.frequencyHours}
          onChange={(hours) => update({ schedule: { ...preferences.schedule, frequencyHours: hours } })}
        />
        <SettingRow label={t("settings.scheduleActiveDays")} />
        <DaySelector
          activeDays={preferences.schedule.activeDays}
          onChange={(days) => update({ schedule: { ...preferences.schedule, activeDays: days } })}
        />
        <SettingRow
          label={t("settings.quietNight")}
          value={preferences.schedule.quietNightEnabled}
          onValueChange={(v) => update({ schedule: { ...preferences.schedule, quietNightEnabled: v } })}
        />
        <SettingRow
          label={t("settings.sound")}
          value={preferences.schedule.soundEnabled}
          onValueChange={(v) => update({ schedule: { ...preferences.schedule, soundEnabled: v } })}
        />
        <SettingRow
          label={t("settings.vibration")}
          value={preferences.schedule.vibrationEnabled}
          onValueChange={(v) => update({ schedule: { ...preferences.schedule, vibrationEnabled: v } })}
        />
        <SectionHeader title={t("settings.sectionContent")} />
        <SettingRow label={t("settings.translationLanguage")} />
        <LanguageChipSelector value={preferences.translationLocale} onChange={(locale) => update({ translationLocale: locale })} />
        <SettingRow
          label={t("settings.showArabic")}
          value={preferences.showArabicText}
          onValueChange={(v) => update({ showArabicText: v })}
        />
        <SettingRow
          label={t("settings.textOrder")}
          valueLabel={preferences.textOrder === "arabic_first" ? t("settings.textOrderArabicFirst") : t("settings.textOrderTranslationFirst")}
          onPress={() => update({ textOrder: preferences.textOrder === "arabic_first" ? "translation_first" : "arabic_first" })}
        />
        <SettingRow label={t("settings.themesLink")} onPress={() => router.push("/themes")} />
        <SettingRow label={t("settings.progressLink")} onPress={() => router.push("/progress")} />
        <SettingRow label={t("settings.contentModeLabel")} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Chip label={t("settings.contentModeAyahOnly")} selected={preferences.contentMode === "ayah_only"} onPress={() => update({ contentMode: "ayah_only" })} />
          <Chip label={t("settings.contentModeHadithOnly")} selected={preferences.contentMode === "hadith_only"} onPress={() => update({ contentMode: "hadith_only" })} />
          <Chip label={t("settings.contentModeMixed")} selected={preferences.contentMode === "mixed"} onPress={() => update({ contentMode: "mixed" })} />
        </View>

        <SectionHeader title={t("settings.sectionLanguage")} />
        <SettingRow label={t("settings.interfaceLanguage")} />
        <LanguageChipSelector value={preferences.interfaceLocale} onChange={(locale) => update({ interfaceLocale: locale })} />

        <SectionHeader title={t("settings.sectionAppearance")} />
        <SettingRow
          label={t("settings.appearanceSystem")}
          value={preferences.appThemeMode === "system"}
          onValueChange={(v) => update({ appThemeMode: v ? "system" : "light" })}
        />
        {preferences.appThemeMode !== "system" ? (
          <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.xs }}>
            <Chip label={t("settings.appearanceLight")} selected={preferences.appThemeMode === "light"} onPress={() => update({ appThemeMode: "light" })} />
            <Chip label={t("settings.appearanceDark")} selected={preferences.appThemeMode === "dark"} onPress={() => update({ appThemeMode: "dark" })} />
          </View>
        ) : null}
        <SettingRow label={t("settings.textSize")} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.xs }}>
          {TEXT_SIZE_SCALES.map((scale) => (
            <Chip key={scale} label={t(TEXT_SIZE_LABEL_KEYS[scale])} selected={preferences.textSizeScale === scale} onPress={() => update({ textSizeScale: scale })} />
          ))}
        </View>

        <SectionHeader title={t("settings.sectionSupport")} />
        <SettingRow label={t("settings.diagnosticsLink")} onPress={() => router.push("/diagnostics")} />
        <SettingRow label={t("settings.sourcesLink")} onPress={() => router.push("/sources")} />
        <SettingRow label={t("settings.privacyLink")} onPress={() => router.push("/privacy")} />
        <SettingRow label={t("settings.aboutLink")} onPress={() => router.push("/about")} />
        <SettingRow label={t("settings.versionLabel")} valueLabel={appConfig.version} />

        {isSupportAvailable() || __DEV__ ? (
          <>
            <SectionHeader title={t("settings.sectionSupportIqraTime")} />
            <SettingRow label={t("settings.supportLink")} onPress={() => router.push("/support")} />
          </>
        ) : null}

        <SectionHeader title={t("settings.sectionData")} />
        <SettingRow label={t("settings.resetLocalData")} onPress={handleResetAll} />
      </View>
    </Screen>
  );
}
