import React, { createContext, useContext, useMemo } from "react";
import { I18nManager } from "react-native";

import type { SupportedLocale } from "@/config/appConfig";
import { directionForLocale, type TextDirection } from "./rtl";
import { translate, translatePlural } from "./index";
import type { TranslationKey } from "./schema";

export interface I18nContextValue {
  locale: SupportedLocale;
  direction: TextDirection;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  tPlural: (key: TranslationKey, count: number, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  locale: SupportedLocale;
  children: React.ReactNode;
}

/**
 * Provides the active interface locale to the tree. Note: RTL layout
 * mirroring via I18nManager.forceRTL requires a JS bundle reload to take
 * full effect on native (a known React Native limitation) — the app
 * still renders correctly per-render because every screen also reads
 * `direction` directly for text alignment and flex-direction, but a
 * "restart recommended" hint is shown when the direction changes.
 * See docs/ACCESSIBILITY.md.
 */
export function I18nProvider({ locale, children }: I18nProviderProps): React.JSX.Element {
  const direction = directionForLocale(locale);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      direction,
      t: (key, params) => translate(locale, key, params),
      tPlural: (key, count, params) => translatePlural(locale, key, count, params),
    }),
    [locale, direction],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/** Applies RTL layout direction at the native layer. Call once at app startup when the locale changes. */
export function applyNativeLayoutDirection(locale: SupportedLocale): { changed: boolean } {
  const shouldBeRtl = directionForLocale(locale) === "rtl";
  if (I18nManager.isRTL !== shouldBeRtl) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(shouldBeRtl);
    return { changed: true };
  }
  return { changed: false };
}
