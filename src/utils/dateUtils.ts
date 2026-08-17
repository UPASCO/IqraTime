/** Locale-aware short date+time formatting for history/diagnostics displays. */
export function formatDateTime(isoString: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatTime(hour: number, minute: number, locale: string): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  try {
    return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
  } catch {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
}

export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
