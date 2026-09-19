import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";
import { useDiscoveryProgress } from "@/hooks/useDiscoveryProgress";
import { getShareCount } from "@/storage/shareCounterStore";

const MILESTONE_PERCENTS = [10, 25, 50, 75, 100] as const;
const SHARE_MILESTONES = [1, 10, 50, 100, 500] as const;

export default function ProgressScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const progress = useDiscoveryProgress();
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    getShareCount().then(setShareCount);
  }, []);

  const discovered = progress?.discovered ?? 0;
  const total = progress?.total ?? 0;
  const percent = progress?.percent ?? 0;

  return (
    <Screen onBack={() => router.back()}>
      <View style={{ gap: spacing.lg }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("progress.title")}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
          {t("progress.subtitle")}
        </Text>

        <View style={{ backgroundColor: appConfig.brand.night, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
          <Text
            style={{
              color: appConfig.brand.goldLight,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: typography.sizes.caption * fontScaleMultiplier,
              fontWeight: typography.weights.semibold,
            }}
          >
            {t("progress.cardLabel")}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.xs }}>
            <Text style={{ color: appConfig.brand.warmWhite, fontSize: 44, fontWeight: "800" }}>{discovered}</Text>
            <Text style={{ color: appConfig.brand.ivory, opacity: 0.6, fontSize: typography.sizes.body * fontScaleMultiplier }}>
              {t("progress.outOf", { total })}
            </Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%`, backgroundColor: appConfig.brand.goldLight }]} />
          </View>

          <Text style={{ color: appConfig.brand.goldLight, fontWeight: typography.weights.semibold, fontSize: typography.sizes.body * fontScaleMultiplier }}>
            {t("progress.percentLabel", { percent })}
          </Text>
        </View>

        <View>
          {MILESTONE_PERCENTS.map((p) => {
            const reached = percent >= p;
            const count = Math.round((total * p) / 100);
            return (
              <View
                key={p}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: spacing.sm,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: reached ? colors.textPrimary : colors.textSecondary,
                    fontWeight: reached ? typography.weights.semibold : typography.weights.regular,
                    fontSize: typography.sizes.body * fontScaleMultiplier,
                  }}
                >
                  {t("progress.milestoneLabel", { percent: p })}
                </Text>
                <Text
                  style={{
                    color: reached ? colors.gold : colors.textSecondary,
                    fontWeight: typography.weights.semibold,
                  }}
                >
                  {reached ? "✓" : count}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ backgroundColor: appConfig.brand.deepGreen, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
          <Text
            style={{
              color: appConfig.brand.goldLight,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: typography.sizes.caption * fontScaleMultiplier,
              fontWeight: typography.weights.semibold,
            }}
          >
            {t("progress.shareCardLabel")}
          </Text>

          <Text style={{ color: appConfig.brand.warmWhite, fontSize: 44, fontWeight: "800" }}>{shareCount}</Text>

          <Text style={{ color: appConfig.brand.ivory, opacity: 0.75, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("progress.shareCardCaption")}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {SHARE_MILESTONES.map((m) => {
              const reached = shareCount >= m;
              return (
                <View
                  key={m}
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xxs,
                    borderRadius: 999,
                    backgroundColor: reached ? appConfig.brand.goldLight : "rgba(247,243,232,0.14)",
                  }}
                >
                  <Text
                    style={{
                      color: reached ? appConfig.brand.night : appConfig.brand.ivory,
                      fontSize: typography.sizes.caption * fontScaleMultiplier,
                      fontWeight: reached ? typography.weights.semibold : typography.weights.regular,
                    }}
                  >
                    {reached ? "✓ " : ""}
                    {t("progress.shareMilestoneLabel", { count: m })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.body * fontScaleMultiplier }}>
            {t("progress.shareSectionTitle")}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("progress.shareSectionBody")}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(247,243,232,0.14)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
