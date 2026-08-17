import type { PluralForm } from "./pluralForm";

/**
 * Resolves a plural form for `count` in `locale` using the ICU/CLDR plural
 * category returned by Intl.PluralRules, falling back to `other` when the
 * locale-specific category was not supplied. Replaces the `{count}` token
 * with the formatted number (locale-aware digit grouping).
 */
export function formatPlural(locale: string, count: number, form: PluralForm): string {
  let category: Intl.LDMLPluralRule;
  try {
    category = new Intl.PluralRules(locale).select(count);
  } catch {
    category = count === 1 ? "one" : "other";
  }
  const template = form[category] ?? form.other;
  const formattedCount = formatNumber(locale, count);
  return template.replace("{count}", formattedCount);
}

function formatNumber(locale: string, count: number): string {
  try {
    return new Intl.NumberFormat(locale).format(count);
  } catch {
    return String(count);
  }
}
