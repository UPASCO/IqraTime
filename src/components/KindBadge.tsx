import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import type { FeedKind } from "@/services/feedContentMode";

const LABEL_KEY = {
  ayah: "common.badgeAyah",
  hadith: "common.badgeHadith",
  name: "common.badgeName",
  dua: "common.badgeDua",
} as const;

/**
 * THE content-kind pill — one identical gold badge on every feed slide
 * (and mirrored as the "{kind} • ..." prefix of every notification title,
 * see src/notifications/notificationTitles.ts), so a reader always knows
 * at a glance whether they are looking at an āyah, a hadith, a Name of
 * Allah or an invocation. Same style everywhere; only the word changes.
 */
export function KindBadge({ kind }: { kind: FeedKind }): React.JSX.Element {
  const { spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  return (
    <View style={[styles.pill, { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs }]}>
      <Text
        style={{
          color: appConfig.brand.night,
          fontSize: typography.sizes.caption * fontScaleMultiplier,
          fontWeight: typography.weights.bold,
          letterSpacing: 1,
        }}
      >
        {t(LABEL_KEY[kind]).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { backgroundColor: "rgba(228,193,112,0.92)", borderRadius: 999 },
});
