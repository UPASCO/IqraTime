import React from "react";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { SupportedLocale } from "@/config/appConfig";

export function TestProviders({ children, locale = "en" }: { children: React.ReactNode; locale?: SupportedLocale }): React.JSX.Element {
  return (
    <ThemeProvider>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </ThemeProvider>
  );
}
