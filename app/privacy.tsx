import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";

export default function PrivacyScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Screen onBack={() => router.back()}>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("privacy.title")}
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("privacy.body")}</Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("privacy.noAccountBody")}</Text>

        {/* The same policy, published at a stable public URL: this screen and
            the hosted page state identical terms, and linking them here lets
            a reader verify that for themselves rather than take the in-app
            copy on faith. */}
        <Pressable
          onPress={() => Linking.openURL(appConfig.privacyPolicyUrl).catch(() => {})}
          accessibilityRole="link"
          accessibilityLabel={t("settings.privacyLink")}
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
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.gold} />
          <Text numberOfLines={1} style={{ flex: 1, color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            iqratime.com/privacy
          </Text>
          <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Screen>
  );
}
