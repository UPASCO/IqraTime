import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen, Button, SectionHeader } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { useRouter } from "expo-router";
import { appConfig } from "@/config/appConfig";
import { isSupportAvailable } from "@/services/supportPaymentService";

export default function AboutScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  /**
   * Opens an external URL, ignoring failures. A dead link here is a
   * cosmetic disappointment, never worth an error dialog interrupting the
   * About screen.
   */
  const open = (url: string): void => {
    Linking.openURL(url).catch(() => {});
  };

  /**
   * A tappable row linking out to the project's own web presence. These
   * exist because a Qur'an/hadith app asks for real trust: a reachable
   * site, a published privacy policy and a monitored support address are
   * the most direct evidence there is a real, accountable project behind
   * it — so they belong in the app, not only in the store listing.
   */
  const linkRow = (icon: React.ComponentProps<typeof Ionicons>["name"], label: string, value: string, onPress: () => void): React.JSX.Element => (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${value}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.gold} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, fontWeight: typography.weights.medium }}>
          {label}
        </Text>
        <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {value}
        </Text>
      </View>
      <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <Screen onBack={() => router.back()}>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("common.appName")}
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("common.tagline")}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("settings.versionLabel")}: {appConfig.version}
        </Text>

        <SectionHeader title={t("settings.sectionSupport")} />
        <View style={{ gap: spacing.xs }}>
          {linkRow("globe-outline", t("settings.websiteLink"), "iqratime.com", () => open(appConfig.websiteUrl))}
          {linkRow("shield-checkmark-outline", t("settings.privacyLink"), "iqratime.com/privacy", () => open(appConfig.privacyPolicyUrl))}
          {linkRow("chatbubble-ellipses-outline", t("settings.contactLink"), "iqratime.com/contact", () => open(appConfig.contactUrl))}
          {linkRow("mail-outline", t("settings.contactEmailLabel"), appConfig.contactEmail, () => open(`mailto:${appConfig.contactEmail}`))}
        </View>

        {isSupportAvailable() || __DEV__ ? (
          <Button label={t("support.menuLabel")} variant="secondary" onPress={() => router.push("/support")} />
        ) : null}
      </View>
    </Screen>
  );
}
