import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { appConfig } from "@/config/appConfig";

export interface FeedActionRailProps {
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isMemorized?: boolean;
  onToggleMemorize?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  /** Opens the full-text detail screen ("zoom"). */
  onExpand?: () => void;
}

/**
 * THE action rail — one component for every feed slide, so the same five
 * actions live in the same order everywhere: favorite, memorize, share,
 * copy, expand. Any action a slide doesn't pass is simply absent; nothing
 * is ever reordered. The copy-confirmation checkmark lives here so each
 * slide stops reimplementing it.
 */
export function FeedActionRail(props: FeedActionRailProps): React.JSX.Element {
  const { spacing } = useTheme();
  const { t } = useI18n();
  const [justCopied, setJustCopied] = React.useState(false);

  const handleCopy = (): void => {
    props.onCopy?.();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  const button = (
    key: string,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    label: string,
    onPress: () => void,
    options?: { active?: boolean; size?: number },
  ): React.JSX.Element => (
    <Pressable
      key={key}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] }]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={options?.active !== undefined ? { selected: options.active } : undefined}
    >
      <Ionicons name={icon} size={options?.size ?? 22} color={options?.active ? appConfig.brand.goldLight : appConfig.brand.warmWhite} />
    </Pressable>
  );

  return (
    <View style={[styles.rail, { gap: spacing.md }]}>
      {props.onToggleFavorite
        ? button(
            "favorite",
            props.isFavorite ? "heart" : "heart-outline",
            props.isFavorite ? t("home.favoriteRemove") : t("home.favoriteAdd"),
            props.onToggleFavorite,
            { active: props.isFavorite, size: 24 },
          )
        : null}
      {props.onToggleMemorize
        ? button(
            "memorize",
            props.isMemorized ? "school" : "school-outline",
            props.isMemorized ? t("hifz.removeCta") : t("hifz.title"),
            props.onToggleMemorize,
            { active: props.isMemorized },
          )
        : null}
      {props.onShare ? button("share", "share-outline", t("home.shareCta"), props.onShare) : null}
      {props.onCopy
        ? button(
            "copy",
            justCopied ? "checkmark" : "copy-outline",
            justCopied ? t("home.copiedConfirmation") : t("home.copyCta"),
            handleCopy,
            { active: justCopied, size: 20 },
          )
        : null}
      {props.onExpand ? button("expand", "expand-outline", t("home.readMoreCta"), props.onExpand) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { position: "absolute", right: 16, bottom: 88, alignItems: "center" },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
});
