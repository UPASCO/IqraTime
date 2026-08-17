import React from "react";
import { View, Text } from "react-native";

import { Screen, SectionHeader } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { arabicSourceInfo, translationSources } from "@/data/corpus";
import { LOCALE_NATIVE_NAMES } from "@/i18n/localeNames";

export default function SourcesScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();

  const activeSource = translationSources.find((s) => s.locale === preferences.translationLocale);

  const row = (label: string, value: string): React.JSX.Element => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xxs, gap: spacing.sm }}>
      <Text style={{ color: colors.textSecondary, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, flex: 2, textAlign: "right" }}>{value}</Text>
    </View>
  );

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("sources.title")}
        </Text>

        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderRadius: 12,
            borderColor: colors.warning,
            borderWidth: 1,
            padding: spacing.sm,
            gap: spacing.xxs,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold }}>{t("sources.demoWarningTitle")}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("sources.demoWarningBody")}
          </Text>
        </View>

        <SectionHeader title={t("sources.arabicSourceLabel")} />
        {row(t("sources.arabicSourceLabel"), arabicSourceInfo.recommendedSource)}
        {row(t("sources.numberingLabel"), arabicSourceInfo.numberingConvention)}
        {row(t("sources.validationLabel"), arabicSourceInfo.validationStatus)}
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic" }}>
          {arabicSourceInfo.currentDataProvenance}
        </Text>

        <SectionHeader title={t("sources.activeLanguageLabel")} />
        {row(t("sources.activeLanguageLabel"), LOCALE_NATIVE_NAMES[preferences.translationLocale])}
        {activeSource ? (
          <>
            {row(t("sources.translatorLabel"), activeSource.translatorName)}
            {row(t("sources.versionLabel"), activeSource.version)}
            {row(t("sources.licenseLabel"), activeSource.license)}
            {row(t("sources.noticeLabel"), activeSource.requiredNotice)}
            {row(t("sources.validationLabel"), activeSource.validationStatus)}
          </>
        ) : (
          <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>{t("errors.translationMissing")}</Text>
        )}

        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontStyle: "italic", marginTop: spacing.md }}>
          {t("sources.disclaimer")}
        </Text>
      </View>
    </Screen>
  );
}
