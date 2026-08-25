import React, { useMemo, useState } from "react";
import { View, Text, TextInput, SectionList, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Screen, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { usePreferencesStore } from "@/hooks/usePreferencesStore";
import { getRuntimeCorpus, getTranslation, type CorpusEntry } from "@/data/corpus";
import { ayahIdToRouteParam } from "@/utils/routeParams";

const MAX_PREVIEW_CHARS = 90;

function matches(entry: CorpusEntry, query: string, translationText: string | undefined): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (entry.arabic.id.includes(q)) return true;
  if (entry.arabic.surahNameTransliterated.toLowerCase().includes(q)) return true;
  if (entry.arabic.surahNameArabic.includes(query.trim())) return true;
  if (translationText?.toLowerCase().includes(q)) return true;
  return false;
}

function LibraryRow({ entry, onPress }: { entry: CorpusEntry; translationText: string | undefined; onPress: () => void }): React.JSX.Element {
  const { colors, spacing, radii, typography, fontScaleMultiplier } = useTheme();
  const { preferences } = usePreferencesStore();
  const translation = getTranslation(entry.arabic.id, preferences.translationLocale);
  const fullText = translation?.text ?? entry.arabic.text;
  const preview = fullText.length > MAX_PREVIEW_CHARS ? `${fullText.slice(0, MAX_PREVIEW_CHARS).trim()}…` : fullText;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderColor: colors.border,
        borderWidth: 1,
        padding: spacing.sm,
        gap: spacing.xxs,
        marginBottom: spacing.xs,
      }}
    >
      <Text style={{ color: colors.gold, fontSize: typography.sizes.caption * fontScaleMultiplier, fontWeight: typography.weights.semibold }}>
        {entry.arabic.surahNameTransliterated} · {entry.arabic.surah}:{entry.arabic.ayah}
      </Text>
      <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{preview}</Text>
    </Pressable>
  );
}

export default function LibraryScreen(): React.JSX.Element {
  const { colors, spacing, radii } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { preferences } = usePreferencesStore();

  const [query, setQuery] = useState("");

  const corpus = useMemo(() => getRuntimeCorpus(), []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return corpus.filter((entry) => matches(entry, query, getTranslation(entry.arabic.id, preferences.translationLocale)?.text));
  }, [corpus, query, preferences.translationLocale]);

  const sections = useMemo(() => {
    const groups = new Map<number, CorpusEntry[]>();
    for (const entry of filtered) {
      const group = groups.get(entry.arabic.surah) ?? [];
      group.push(entry);
      groups.set(entry.arabic.surah, group);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([surah, data]) => ({
        title: `${data[0]?.arabic.surahNameTransliterated ?? ""} (${surah})`,
        data: data.sort((a, b) => a.arabic.ayah - b.arabic.ayah),
      }));
  }, [filtered]);

  return (
    <Screen scroll={false} onBack={() => router.back()}>
      <View style={{ gap: spacing.sm, flex: 1 }}>
        <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "700" }}>{t("library.title")}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("library.searchPlaceholder")}
          placeholderTextColor={colors.textSecondary}
          autoFocus
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radii.sm,
            padding: spacing.sm,
            color: colors.textPrimary,
            minHeight: 44,
          }}
          accessibilityLabel={t("library.searchPlaceholder")}
        />
        {query.trim() ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{t("library.resultCount", { count: filtered.length })}</Text>
        ) : null}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.arabic.id}
          renderSectionHeader={({ section }) => (
            <Text style={{ color: colors.textSecondary, marginVertical: spacing.xs, fontWeight: "600" }}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <LibraryRow
              entry={item}
              translationText={getTranslation(item.arabic.id, preferences.translationLocale)?.text}
              onPress={() => router.push(`/ayah/${ayahIdToRouteParam(item.arabic.id)}`)}
            />
          )}
          ListEmptyComponent={query.trim() ? <EmptyState title={t("library.emptyTitle")} body={t("library.emptyBody")} /> : null}
        />
      </View>
    </Screen>
  );
}
