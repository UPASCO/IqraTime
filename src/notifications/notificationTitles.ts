import type { SupportedLocale } from "@/config/appConfig";
import type { AyahReference } from "@/domain/types";
import { translate } from "@/i18n";

/**
 * Notification titles. Pure string composition (no expo-notifications
 * import) so the scheduler and its tests can build titles without a native
 * module, and so the wording lives in the i18n catalogs like every other
 * user-facing string.
 *
 * Every title leads with its content-kind label ("Āyah • ...", "Hadith •
 * ...") — the lock-screen mirror of the gold KindBadge pill on the feed
 * slides. The app name is deliberately NOT in the title anymore: iOS and
 * Android already print it above every notification, so repeating it only
 * pushed the actual content out of the one line the reader glances at.
 */

export interface AyahTitleInput extends AyahReference {
  /** Shown before the numeric reference — "Al-Baqarah 2:286" reads far better on a lock screen than "Surah 2:286". */
  readonly surahName: string;
}

/** The notification title for an āyah slot, e.g. "Āyah • Sourate Al-Baqarah 2:286". */
export function ayahNotificationTitle(locale: SupportedLocale, ref: AyahTitleInput): string {
  return translate(locale, "notifications.titleTemplate", {
    kind: translate(locale, "common.badgeAyah"),
    surahName: ref.surahName,
    surah: ref.surah,
    ayah: ref.ayah,
  });
}

/** The notification title for a hadith slot, e.g. "Hadith • Sahih al-Bukhari #6116". */
export function hadithNotificationTitle(locale: SupportedLocale, collectionDisplayName: string, hadithNumber: number): string {
  return translate(locale, "notifications.hadithTitleTemplate", {
    kind: translate(locale, "common.badgeHadith"),
    collection: collectionDisplayName,
    number: hadithNumber,
  });
}

/** The Name-of-the-day title, e.g. "Nom d'Allah • Ar-Raḥmān — Nom 1/99". */
export function nameNotificationTitle(locale: SupportedLocale, transliteration: string, number: number): string {
  return translate(locale, "notifications.nameTitleTemplate", {
    kind: translate(locale, "common.badgeName"),
    transliteration,
    number,
  });
}

/** The Invocation-of-the-day title, e.g. "Invocation • Invocation avant de dormir". */
export function duaNotificationTitle(locale: SupportedLocale, title: string): string {
  return translate(locale, "notifications.duaTitleTemplate", {
    kind: translate(locale, "common.badgeDua"),
    title,
  });
}
