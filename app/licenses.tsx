import React from "react";
import { View, Text, ScrollView } from "react-native";

import { Screen } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";

const PACKAGES: readonly { name: string; license: string }[] = [
  { name: "expo", license: "MIT" },
  { name: "expo-router", license: "MIT" },
  { name: "expo-notifications", license: "MIT" },
  { name: "expo-sqlite", license: "MIT" },
  { name: "react", license: "MIT" },
  { name: "react-native", license: "MIT" },
  { name: "@react-native-async-storage/async-storage", license: "MIT" },
  { name: "@react-native-community/datetimepicker", license: "MIT" },
  { name: "@expo/vector-icons", license: "MIT" },
  { name: "zustand", license: "MIT" },
  { name: "react-native-safe-area-context", license: "MIT" },
  { name: "react-native-screens", license: "MIT" },
];

export default function LicensesScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("settings.licensesLink")}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          See THIRD_PARTY_LICENSES.md in the repository for the complete, versioned list.
        </Text>
        <ScrollView>
          {PACKAGES.map((pkg) => (
            <View key={pkg.name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xxs }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{pkg.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{pkg.license}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}
