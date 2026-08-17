import { appConfig, type SupportedLocale } from "@/config/appConfig";
import { ar } from "./locales/ar";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { pt } from "./locales/pt";
import { hi } from "./locales/hi";
import { bn } from "./locales/bn";
import { zhCN } from "./locales/zh-CN";
import { it } from "./locales/it";
import { ru } from "./locales/ru";
import type { PluralForm } from "./pluralForm";
import { formatPlural } from "./plural";
import type { TranslationSchema } from "./schema";

const catalogs: Record<SupportedLocale, TranslationSchema> = {
  ar,
  en,
  fr,
  es,
  pt,
  hi,
  bn,
  "zh-CN": zhCN,
  it,
  ru,
};

/**
 * Resolves an arbitrary BCP-47 tag (e.g. from expo-localization) to one of
 * our ten supported locales, following the fallback chain required by the
 * spec: (1) exact match, (2) same base language, (3) English. English is
 * logged as a fallback in development so a missing translation is never
 * silently mistaken for "the app only supports English".
 */
export function resolveSupportedLocale(deviceLocaleTag: string | null | undefined): SupportedLocale {
  if (!deviceLocaleTag) return logFallback(deviceLocaleTag);

  const exact = appConfig.supportedLocales.find(
    (locale) => locale.toLowerCase() === deviceLocaleTag.toLowerCase(),
  );
  if (exact) return exact;

  const baseLanguage = deviceLocaleTag.split(/[-_]/)[0]?.toLowerCase();
  const familyMatch = appConfig.supportedLocales.find(
    (locale) => locale.split("-")[0]?.toLowerCase() === baseLanguage,
  );
  if (familyMatch) return familyMatch;

  return logFallback(deviceLocaleTag);
}

function logFallback(deviceLocaleTag: string | null | undefined): SupportedLocale {
  if (__DEV__) {
    console.warn(
      `[i18n] No catalog for device locale "${String(deviceLocaleTag)}". Falling back to "${appConfig.fallbackLocale}". ` +
        "This should be exceptional — verify this is not masking a missing UI translation.",
    );
  }
  return appConfig.fallbackLocale;
}

export function getCatalog(locale: SupportedLocale): TranslationSchema {
  return catalogs[locale] ?? catalogs[appConfig.fallbackLocale];
}

function getByPath(catalog: TranslationSchema, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && segment in node) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, catalog);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/**
 * Translate a dot-path leaf string, e.g. t(catalog, "settings.sound").
 * Falls back to the same key in English, then to the raw key itself, so a
 * typo or a not-yet-translated string is visible instead of crashing.
 */
export function translate(
  locale: SupportedLocale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primary = getByPath(getCatalog(locale), key);
  if (typeof primary === "string") return interpolate(primary, params);

  const fallback = getByPath(getCatalog(appConfig.fallbackLocale), key);
  if (typeof fallback === "string") {
    if (__DEV__) {
      console.warn(`[i18n] Missing key "${key}" for locale "${locale}"; using English fallback.`);
    }
    return interpolate(fallback, params);
  }

  if (__DEV__) {
    console.warn(`[i18n] Unknown translation key "${key}".`);
  }
  return key;
}

export function translatePlural(
  locale: SupportedLocale,
  key: string,
  count: number,
  params?: Record<string, string | number>,
): string {
  const primary = getByPath(getCatalog(locale), key) as PluralForm | undefined;
  const form = primary && typeof primary === "object" && "other" in primary
    ? primary
    : (getByPath(getCatalog(appConfig.fallbackLocale), key) as PluralForm | undefined);

  if (!form) {
    if (__DEV__) {
      console.warn(`[i18n] Unknown plural key "${key}".`);
    }
    return key;
  }

  const resolved = formatPlural(locale, count, form);
  return interpolate(resolved, { ...params, count });
}

export { catalogs };
export * from "./rtl";
export * from "./schema";
export type { PluralForm } from "./pluralForm";
