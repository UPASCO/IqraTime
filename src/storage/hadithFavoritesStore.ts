import AsyncStorage from "@react-native-async-storage/async-storage";

import type { HadithId } from "@/domain/types";

const KEY = "ayahnow.hadithFavorites";

/**
 * Hadith favorites live in AsyncStorage, not the SQLite favorites table
 * used for ayat: the SQLite schema and every reader of it (history,
 * favorites, notification scheduling) is built around AyahId's strict
 * "surah:ayah" format and is central to the notification pipeline this
 * app depends on. Keeping hadith favorites in a separate, simple store
 * avoids touching that schema while this feature is still new.
 */
export async function listHadithFavorites(): Promise<readonly HadithId[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HadithId[]) : [];
  } catch {
    return [];
  }
}

export async function isHadithFavorite(id: HadithId): Promise<boolean> {
  const list = await listHadithFavorites();
  return list.includes(id);
}

export async function addHadithFavorite(id: HadithId): Promise<void> {
  const list = await listHadithFavorites();
  if (list.includes(id)) return;
  await AsyncStorage.setItem(KEY, JSON.stringify([...list, id]));
}

export async function removeHadithFavorite(id: HadithId): Promise<void> {
  const list = await listHadithFavorites();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter((existing) => existing !== id)));
}

export async function clearHadithFavorites(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
