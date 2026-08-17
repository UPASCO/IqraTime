import type { SupportedLocale } from "@/config/appConfig";

const RTL_LOCALES: ReadonlySet<SupportedLocale> = new Set(["ar"]);

export function isRtlLocale(locale: SupportedLocale): boolean {
  return RTL_LOCALES.has(locale);
}

export type TextDirection = "ltr" | "rtl";

export function directionForLocale(locale: SupportedLocale): TextDirection {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
