import React, { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, Button, SectionHeader, ArabicText, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { useAyahView } from "@/hooks/useAyahView";
import { useHadithView } from "@/hooks/useHadithView";
import { listHifzEntries, listDueHifzEntries, recordHifzReview, removeFromHifz, hifzEntryKind, REVIEW_INTERVALS_DAYS, type HifzEntry } from "@/storage/hifzStore";
import { ayahIdToRouteParam, hadithIdToRouteParam } from "@/utils/routeParams";
import { formatDateTime } from "@/utils/dateUtils";
import { appConfig } from "@/config/appConfig";
import { getDua, duaTitleFor, duaTranslationFor } from "@/data/duas";
import { getName, nameMeaningFor } from "@/data/names";

/**
 * One due review: the reference is always visible, the āyah itself starts
 * hidden so the user recites from memory first, then reveals and
 * self-grades. Self-grading (not automated checking) is deliberate — the
 * app never records or evaluates recitation, it only schedules.
 */
function ReviewCard({ entry, onGraded }: { entry: HifzEntry; onGraded: () => void }): React.JSX.Element {
  const { spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const view = useAyahView(entry.ayahId, preferences.translationLocale);
  const [revealed, setRevealed] = useState(false);

  if (!view.found) return <></>;

  const grade = async (remembered: boolean): Promise<void> => {
    await recordHifzReview(entry.ayahId, remembered);
    setRevealed(false);
    onGraded();
  };

  return (
    <View style={{ backgroundColor: appConfig.brand.night, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
      {/* Fixed brand palette like the feed slides — never ambient theme colors on this dark card. */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text
          style={{
            color: appConfig.brand.goldLight,
            fontWeight: typography.weights.semibold,
            letterSpacing: 1,
            fontSize: typography.sizes.caption * fontScaleMultiplier,
          }}
        >
          {t("ayah.surahLabel")} {view.surah}:{view.ayah}
        </Text>
        {/* Which rung of the interval ladder this ayah is on. Without it the
            two grading buttons had no visible consequence, so the whole
            mechanism was invisible: nothing on screen showed that knowing an
            ayah pushes it further away. */}
        <Text style={{ color: appConfig.brand.ivory, opacity: 0.7, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("hifz.stageLabel", { stage: entry.stage + 1, total: REVIEW_INTERVALS_DAYS.length })}
        </Text>
      </View>

      {revealed ? (
        <View style={{ gap: spacing.md }}>
          {/* style overrides the ambient theme color — on this fixed-dark card
              the default textPrimary would be near-black on near-black in
              light mode (the exact bug once fixed on the moment screen). */}
          {view.arabicText ? <ArabicText text={view.arabicText} style={{ color: appConfig.brand.warmWhite }} /> : null}
          {view.translationText ? (
            <Text style={{ color: appConfig.brand.ivory, opacity: 0.85, fontSize: typography.sizes.body * fontScaleMultiplier }}>
              {view.translationText}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button label={t("hifz.knewItCta")} onPress={() => grade(true)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t("hifz.forgotCta")} variant="secondary" onPress={() => grade(false)} />
            </View>
          </View>
        </View>
      ) : (
        <Button label={t("hifz.revealCta")} variant="secondary" onPress={() => setRevealed(true)} />
      )}
    </View>
  );
}

/**
 * The hadith counterpart to ReviewCard — its own component (not a branch
 * of ExtraReviewCard) because resolving a hadith goes through the
 * useHadithView hook, which can't be called conditionally. The cue is the
 * reference (collection + number), the reveal is the matn with its
 * translation — how ahādīth are traditionally memorized.
 */
function HadithReviewCard({ entry, onGraded }: { entry: HifzEntry; onGraded: () => void }): React.JSX.Element {
  const { spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const { preferences } = usePreferencesStore();
  const view = useHadithView(entry.ayahId, preferences.translationLocale);
  const [revealed, setRevealed] = useState(false);

  if (!view.found) return <></>;

  const grade = async (remembered: boolean): Promise<void> => {
    await recordHifzReview(entry.ayahId, remembered);
    setRevealed(false);
    onGraded();
  };

  return (
    <View style={{ backgroundColor: appConfig.brand.night, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
        <Text
          style={{
            color: appConfig.brand.goldLight,
            fontWeight: typography.weights.semibold,
            letterSpacing: 1,
            fontSize: typography.sizes.caption * fontScaleMultiplier,
            flexShrink: 1,
          }}
        >
          {view.collectionDisplayName} #{view.hadithNumber}
        </Text>
        <Text style={{ color: appConfig.brand.ivory, opacity: 0.7, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("hifz.stageLabel", { stage: entry.stage + 1, total: REVIEW_INTERVALS_DAYS.length })}
        </Text>
      </View>

      {revealed ? (
        <View style={{ gap: spacing.md }}>
          {view.arabicText ? <ArabicText text={view.arabicText} style={{ color: appConfig.brand.warmWhite }} /> : null}
          {view.translationText ? (
            <Text style={{ color: appConfig.brand.ivory, opacity: 0.85, fontSize: typography.sizes.body * fontScaleMultiplier }}>
              {view.translationText}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button label={t("hifz.knewItCta")} onPress={() => grade(true)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t("hifz.forgotCta")} variant="secondary" onPress={() => grade(false)} />
            </View>
          </View>
        </View>
      ) : (
        <Button label={t("hifz.revealCta")} variant="secondary" onPress={() => setRevealed(true)} />
      )}
    </View>
  );
}

/**
 * The dua and name counterparts to ReviewCard: same hide-then-self-grade
 * mechanic, different cue. A dua's cue is its localized title (recall the
 * Arabic from what it's for); a Name's cue is its number and meaning
 * (recall the Name itself) — exactly how the 99 are traditionally learned.
 */
function ExtraReviewCard({ entry, onGraded }: { entry: HifzEntry; onGraded: () => void }): React.JSX.Element {
  const { spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const [revealed, setRevealed] = useState(false);

  const kind = hifzEntryKind(entry);
  const dua = kind === "dua" ? getDua(entry.ayahId) : undefined;
  const name = kind === "name" ? getName(Number(entry.ayahId)) : undefined;
  if (!dua && !name) return <></>;

  const cue = dua ? duaTitleFor(dua, locale) : `${t("names.positionLabel", { number: name!.number })} — ${nameMeaningFor(name!, locale) || name!.transliteration}`;
  const answerArabic = dua ? dua.arabic : name!.arabic;
  const answerSecondary = dua ? (duaTranslationFor(dua, locale) ?? dua.transliteration) : name!.transliteration;

  const grade = async (remembered: boolean): Promise<void> => {
    await recordHifzReview(entry.ayahId, remembered);
    setRevealed(false);
    onGraded();
  };

  return (
    <View style={{ backgroundColor: appConfig.brand.night, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
        <Text
          style={{
            color: appConfig.brand.goldLight,
            fontWeight: typography.weights.semibold,
            letterSpacing: 1,
            fontSize: typography.sizes.caption * fontScaleMultiplier,
            flexShrink: 1,
          }}
        >
          {cue}
        </Text>
        <Text style={{ color: appConfig.brand.ivory, opacity: 0.7, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("hifz.stageLabel", { stage: entry.stage + 1, total: REVIEW_INTERVALS_DAYS.length })}
        </Text>
      </View>

      {revealed ? (
        <View style={{ gap: spacing.md }}>
          <ArabicText text={answerArabic} style={{ color: appConfig.brand.warmWhite }} />
          {answerSecondary ? (
            <Text style={{ color: appConfig.brand.ivory, opacity: 0.85, fontSize: typography.sizes.body * fontScaleMultiplier }}>
              {answerSecondary}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button label={t("hifz.knewItCta")} onPress={() => grade(true)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t("hifz.forgotCta")} variant="secondary" onPress={() => grade(false)} />
            </View>
          </View>
        </View>
      ) : (
        <Button label={t("hifz.revealCta")} variant="secondary" onPress={() => setRevealed(true)} />
      )}
    </View>
  );
}

/** One row in the "your ayat" list below the review area. */
function HifzRow({ entry, onRemove }: { entry: HifzEntry; onRemove: () => void }): React.JSX.Element | null {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const { preferences } = usePreferencesStore();
  const view = useAyahView(entry.ayahId, preferences.translationLocale);

  if (!view.found) return null;

  return (
    <Pressable
      onPress={() => router.push(`/ayah/${ayahIdToRouteParam(entry.ayahId)}`)}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.md,
        padding: spacing.sm,
        gap: spacing.xxs,
        marginBottom: spacing.xs,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {t("ayah.surahLabel")} {view.surah}:{view.ayah}
        </Text>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("hifz.removeCta")}>
          <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
      {view.arabicText ? (
        <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, textAlign: "right" }}>
          {view.arabicText}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.xs }}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, flexShrink: 1 }}>
          {t("hifz.nextReviewLabel")}: {formatDateTime(entry.nextReviewAtUtcIso, locale)}
        </Text>
        {entry.successCount > 0 ? (
          <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}>
            {t("hifz.reviewedCountLabel", { count: entry.successCount })}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** The hadith counterpart to HifzRow — own component for the same hook reason as HadithReviewCard. */
function HadithHifzRow({ entry, onRemove }: { entry: HifzEntry; onRemove: () => void }): React.JSX.Element | null {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const { preferences } = usePreferencesStore();
  const view = useHadithView(entry.ayahId, preferences.translationLocale);

  if (!view.found) return null;

  return (
    <Pressable
      onPress={() => router.push(`/hadith/${hadithIdToRouteParam(entry.ayahId)}`)}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.md,
        padding: spacing.sm,
        gap: spacing.xxs,
        marginBottom: spacing.xs,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
          {view.collectionDisplayName} #{view.hadithNumber}
        </Text>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("hifz.removeCta")}>
          <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
      {view.arabicText ? (
        <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, textAlign: "right" }}>
          {view.arabicText}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.xs }}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, flexShrink: 1 }}>
          {t("hifz.nextReviewLabel")}: {formatDateTime(entry.nextReviewAtUtcIso, locale)}
        </Text>
        {entry.successCount > 0 ? (
          <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}>
            {t("hifz.reviewedCountLabel", { count: entry.successCount })}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** The dua/name counterpart to HifzRow. */
function ExtraHifzRow({ entry, onRemove }: { entry: HifzEntry; onRemove: () => void }): React.JSX.Element | null {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();

  const kind = hifzEntryKind(entry);
  const dua = kind === "dua" ? getDua(entry.ayahId) : undefined;
  const name = kind === "name" ? getName(Number(entry.ayahId)) : undefined;
  if (!dua && !name) return null;

  const label = dua ? duaTitleFor(dua, locale) : `${name!.transliteration} — ${t("names.positionLabel", { number: name!.number })}`;
  const arabicPreview = dua ? dua.arabic : name!.arabic;

  return (
    <Pressable
      onPress={() => router.push(dua ? `/duas/${dua.id}` : `/names?n=${name!.number}`)}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.md,
        padding: spacing.sm,
        gap: spacing.xxs,
        marginBottom: spacing.xs,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
        <Text
          numberOfLines={1}
          style={{ color: colors.gold, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier, flexShrink: 1 }}
        >
          {label}
        </Text>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("hifz.removeCta")}>
          <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier, textAlign: "right" }}>
        {arabicPreview}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.xs }}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, flexShrink: 1 }}>
          {t("hifz.nextReviewLabel")}: {formatDateTime(entry.nextReviewAtUtcIso, locale)}
        </Text>
        {entry.successCount > 0 ? (
          <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.medium }}>
            {t("hifz.reviewedCountLabel", { count: entry.successCount })}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function HifzScreen(): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const [all, setAll] = useState<readonly HifzEntry[]>([]);
  const [due, setDue] = useState<readonly HifzEntry[]>([]);
  const [reviewedThisVisit, setReviewedThisVisit] = useState(0);

  const load = useCallback(async () => {
    setAll(await listHifzEntries());
    setDue(await listDueHifzEntries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleGraded = (): void => {
    setReviewedThisVisit((n) => n + 1);
    load();
  };

  const handleRemove = async (ayahId: string): Promise<void> => {
    await removeFromHifz(ayahId);
    load();
  };

  const currentDue = due[0];

  return (
    <Screen scroll={false} onBack={() => router.back()}>
      <FlatList
        data={all as HifzEntry[]}
        keyExtractor={(e) => e.ayahId}
        renderItem={({ item }) =>
          hifzEntryKind(item) === "ayah" ? (
            <HifzRow entry={item} onRemove={() => handleRemove(item.ayahId)} />
          ) : hifzEntryKind(item) === "hadith" ? (
            <HadithHifzRow entry={item} onRemove={() => handleRemove(item.ayahId)} />
          ) : (
            <ExtraHifzRow entry={item} onRemove={() => handleRemove(item.ayahId)} />
          )
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
            <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
              {t("hifz.title")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("hifz.subtitle")}</Text>

            {/* The three-step explanation only needs to be read once, so it
                shows while there is nothing to review and disappears as soon
                as the user has ayat in rotation. */}
            {all.length === 0 || due.length > 0 ? (
              <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: spacing.xxs }}>
                <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.caption * fontScaleMultiplier }}>
                  {t("hifz.howTitle")}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.sizes.caption * fontScaleMultiplier,
                    lineHeight: typography.lineHeights.caption * fontScaleMultiplier,
                  }}
                >
                  {t("hifz.howBody")}
                </Text>
              </View>
            ) : null}

            {all.length > 0 ? <SectionHeader title={`${t("hifz.dueTodayTitle")} (${due.length})`} /> : null}

            {currentDue ? (
              hifzEntryKind(currentDue) === "ayah" ? (
                <ReviewCard
                  // Key by id so the reveal state resets when the next due entry replaces this one.
                  key={currentDue.ayahId}
                  entry={currentDue}
                  onGraded={handleGraded}
                />
              ) : hifzEntryKind(currentDue) === "hadith" ? (
                <HadithReviewCard key={currentDue.ayahId} entry={currentDue} onGraded={handleGraded} />
              ) : (
                <ExtraReviewCard key={currentDue.ayahId} entry={currentDue} onGraded={handleGraded} />
              )
            ) : all.length > 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier, fontStyle: "italic" }}>
                {reviewedThisVisit > 0 ? `${t("hifz.doneTitle")} — ${t("hifz.doneBody")}` : t("hifz.noneDueBody")}
              </Text>
            ) : null}

            {all.length > 0 ? <SectionHeader title={t("hifz.listTitle")} /> : null}
          </View>
        }
        ListEmptyComponent={<EmptyState title={t("hifz.emptyTitle")} body={t("hifz.emptyBody")} />}
      />
    </Screen>
  );
}
