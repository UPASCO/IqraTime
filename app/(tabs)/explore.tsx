import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { getCorpusEntry } from "@/data/corpus";
import { getDailyAyahId } from "@/services/dailyAyah";
import { getDailyName, nameMeaningFor } from "@/data/names";

/** One destination card in the Explore grid. */
interface ExploreDestination {
  readonly icon: React.ComponentProps<typeof Ionicons>["name"];
  readonly label: string;
  readonly route: "/quran" | "/hadith" | "/duas" | "/names" | "/hifz" | "/progress" | "/library";
  /** Gold-bordered treatment for the primary content destinations. */
  readonly emphasized: boolean;
}

/** Rows of two: equal-width tiles stay aligned whatever the label length or text-size setting. */
const GRID_COLUMNS = 2;

/**
 * The Explore tab: every destination in the app, in one dedicated,
 * breathable screen. This grid used to live at the top of the home screen,
 * where it pushed the feed — the app's core surface — below the fold;
 * navigation and consumption are two different jobs, so each now has its
 * own tab (see the note in app/(tabs)/index.tsx).
 */
export default function ExploreScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale, direction } = useI18n();
  const router = useRouter();

  // Deterministic and state-free (see dailyAyah.ts / data/names): cheap to
  // recompute each render, changes only at local midnight.
  const dailyAyahId = getDailyAyahId();
  const dailyRef = dailyAyahId ? getCorpusEntry(dailyAyahId) : undefined;
  const dailyName = getDailyName();
  const dailyNameMeaning = nameMeaningFor(dailyName, locale);

  const destinations = useMemo(
    (): ExploreDestination[] => [
      { icon: "book-outline", label: t("quran.title"), route: "/quran", emphasized: true },
      { icon: "layers-outline", label: t("hadith.menuTitle"), route: "/hadith", emphasized: true },
      { icon: "flower-outline", label: t("duas.title"), route: "/duas", emphasized: true },
      { icon: "diamond-outline", label: t("names.title"), route: "/names", emphasized: true },
      { icon: "school-outline", label: t("hifz.title"), route: "/hifz", emphasized: false },
      { icon: "ribbon-outline", label: t("progress.title"), route: "/progress", emphasized: false },
      { icon: "search-outline", label: t("home.libraryCta"), route: "/library", emphasized: false },
    ],
    [t],
  );

  const rows = useMemo(() => {
    const grouped: ExploreDestination[][] = [];
    for (let i = 0; i < destinations.length; i += GRID_COLUMNS) {
      grouped.push(destinations.slice(i, i + GRID_COLUMNS));
    }
    return grouped;
  }, [destinations]);

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <View style={{ gap: 2 }}>
          <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
            {t("explore.title")}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
            {t("explore.subtitle")}
          </Text>
        </View>

        {/* The two communal dailies — same āyah and same Name for every
            user worldwide on the same date. They moved here from the home
            header (2.1.0), where they crowded the feed. */}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {dailyRef ? (
            <Pressable
              onPress={() => router.push(`/ayah/${dailyRef.arabic.surah}-${dailyRef.arabic.ayah}`)}
              accessibilityRole="button"
              style={{
                flex: 1,
                gap: 2,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.goldDecorative,
                borderRadius: radii.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
                <Ionicons name="sunny-outline" size={14} color={colors.gold} />
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    color: colors.gold,
                    fontSize: typography.sizes.caption * fontScaleMultiplier,
                    fontWeight: typography.weights.semibold,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {t("daily.bannerLabel")}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={{ color: colors.textPrimary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}
              >
                {dailyRef.arabic.surahNameTransliterated} · {dailyRef.arabic.surah}:{dailyRef.arabic.ayah}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => router.push(`/names?n=${dailyName.number}`)}
            accessibilityRole="button"
            style={{
              flex: 1,
              gap: 2,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.goldDecorative,
              borderRadius: radii.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.sm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
              <Ionicons name="diamond-outline" size={14} color={colors.gold} />
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  color: colors.gold,
                  fontSize: typography.sizes.caption * fontScaleMultiplier,
                  fontWeight: typography.weights.semibold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {t("daily.nameBannerLabel")}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{ color: colors.textPrimary, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}
            >
              {dailyNameMeaning ? `${dailyName.transliteration} · ${dailyNameMeaning}` : dailyName.transliteration}
            </Text>
          </Pressable>
        </View>

        {/* The mood picker leads: it's the one entry that answers a feeling
            rather than naming a section, so it reads as an invitation, not
            a menu item. */}
        <Pressable
          onPress={() => router.push("/moment")}
          accessibilityRole="button"
          accessibilityLabel={t("home.momentCta")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.goldDecorative,
            borderRadius: radii.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexShrink: 1 }}>
            <Ionicons name="sparkles-outline" size={20} color={colors.gold} />
            <Text
              style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, fontWeight: typography.weights.medium }}
              numberOfLines={2}
            >
              {t("home.momentCta")}
            </Text>
          </View>
          <Ionicons name={direction === "rtl" ? "chevron-back" : "chevron-forward"} size={16} color={colors.textSecondary} />
        </Pressable>

        <View style={{ gap: spacing.sm }}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: "row", gap: spacing.sm }}>
              {row.map((item) => (
                <Pressable
                  key={item.route}
                  onPress={() => router.push(item.route)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    gap: spacing.xs,
                    backgroundColor: item.emphasized ? colors.surfaceElevated : colors.surface,
                    borderWidth: 1,
                    borderColor: item.emphasized ? colors.goldDecorative : colors.border,
                    borderRadius: radii.lg,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.emphasized ? colors.surface : colors.surfaceElevated,
                      borderWidth: 1,
                      borderColor: item.emphasized ? colors.goldDecorative : colors.border,
                    }}
                  >
                    <Ionicons name={item.icon} size={22} color={item.emphasized ? colors.gold : colors.textSecondary} />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: item.emphasized ? colors.textPrimary : colors.textSecondary,
                      fontSize: typography.sizes.caption * fontScaleMultiplier,
                      fontWeight: item.emphasized ? typography.weights.semibold : typography.weights.medium,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
              {row.length < GRID_COLUMNS ? <View style={{ flex: GRID_COLUMNS - row.length }} /> : null}
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
