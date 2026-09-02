import type { SupportedLocale } from "@/config/appConfig";
import type { AyahReference } from "@/domain/types";
import { translate } from "@/i18n";

/**
 * Notification titles. Pure string composition (no expo-notifications
 * import) so the scheduler and its tests can build titles without a native
 * module, and so the wording lives in the i18n catalogs like every other
 * user-facing string.
 */

export interface AyahTitleInput extends AyahReference {
  /** Shown before the numeric reference — "Al-Baqarah 2:286" reads far better on a lock screen than "Surah 2:286". */
  readonly surahName: string;
}

/** The notification title for an āyah slot, in the slot's own language. */
export function ayahNotificationTitle(locale: SupportedLocale, ref: AyahTitleInput): string {
  return translate(locale, "notifications.titleTemplate", { surahName: ref.surahName, surah: ref.surah, ayah: ref.ayah });
}

/** The notification title for a hadith slot, e.g. "IqraTime • Sahih al-Bukhari #6116". */
export function hadithNotificationTitle(locale: SupportedLocale, collectionDisplayName: string, hadithNumber: number): string {
  return translate(locale, "notifications.hadithTitleTemplate", { collection: collectionDisplayName, number: hadithNumber });
}
