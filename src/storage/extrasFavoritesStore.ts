import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Favorites for the 99 Names (by canonical number) and the invocations
 * (by dua id). Same storage tier and rationale as hadith favorites
 * (hadithFavoritesStore.ts): small AsyncStorage-backed JSON lists that
 * never touch the SQLite schema the notification pipeline depends on.
 */

const NAMES_KEY = "iqratime.nameFavorites";
const DUAS_KEY = "iqratime.duaFavorites";

async function readList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export async function listNameFavorites(): Promise<readonly number[]> {
  return readList<number>(NAMES_KEY);
}

export async function isNameFavorite(number: number): Promise<boolean> {
  return (await listNameFavorites()).includes(number);
}

export async function toggleNameFavorite(number: number): Promise<boolean> {
  const list = await readList<number>(NAMES_KEY);
  const has = list.includes(number);
  const next = has ? list.filter((n) => n !== number) : [...list, number];
  await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(next));
  return !has;
}

export async function removeNameFavorite(number: number): Promise<void> {
  const list = await readList<number>(NAMES_KEY);
  await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(list.filter((n) => n !== number)));
}

export async function listDuaFavorites(): Promise<readonly string[]> {
  return readList<string>(DUAS_KEY);
}

export async function isDuaFavorite(id: string): Promise<boolean> {
  return (await listDuaFavorites()).includes(id);
}

export async function toggleDuaFavorite(id: string): Promise<boolean> {
  const list = await readList<string>(DUAS_KEY);
  const has = list.includes(id);
  const next = has ? list.filter((existing) => existing !== id) : [...list, id];
  await AsyncStorage.setItem(DUAS_KEY, JSON.stringify(next));
  return !has;
}

export async function removeDuaFavorite(id: string): Promise<void> {
  const list = await readList<string>(DUAS_KEY);
  await AsyncStorage.setItem(DUAS_KEY, JSON.stringify(list.filter((existing) => existing !== id)));
}

export async function clearExtrasFavorites(): Promise<void> {
  await AsyncStorage.multiRemove([NAMES_KEY, DUAS_KEY]);
}
