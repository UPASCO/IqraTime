import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

import { Screen, Button } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import { isSupportAvailable } from "@/services/supportPaymentService";

export default function AboutScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("common.appName")}
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("common.tagline")}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("settings.versionLabel")}: {appConfig.version}
        </Text>
        {isSupportAvailable() || __DEV__ ? (
          <Button label={t("support.menuLabel")} variant="secondary" onPress={() => router.push("/support")} />
        ) : null}
      </View>
    </Screen>
  );
}
