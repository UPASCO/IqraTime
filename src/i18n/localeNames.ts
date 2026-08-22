import type { SupportedLocale } from "@/config/appConfig";

/** Each language's own name for itself (autonym), used in language pickers so every option is legible regardless of the current interface language. */
export const LOCALE_NATIVE_NAMES: Readonly<Record<SupportedLocale, string>> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  es: "Español",
  pt: "Português",
  hi: "हिन्दी",
  bn: "বাংলা",
  "zh-CN": "简体中文",
  it: "Italiano",
  ru: "Русский",
  nl: "Nederlands",
  de: "Deutsch",
};
