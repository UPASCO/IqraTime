import AsyncStorage from "@react-native-async-storage/async-storage";

import { addHadithFavorite, removeHadithFavorite, isHadithFavorite, listHadithFavorites, clearHadithFavorites } from "@/storage/hadithFavoritesStore";

describe("hadithFavoritesStore", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("is empty by default", async () => {
    expect(await listHadithFavorites()).toEqual([]);
    expect(await isHadithFavorite("bukhari:1")).toBe(false);
  });

  it("adds and reports a favorite", async () => {
    await addHadithFavorite("bukhari:1");
    expect(await isHadithFavorite("bukhari:1")).toBe(true);
    expect(await listHadithFavorites()).toEqual(["bukhari:1"]);
  });

  it("does not duplicate an already-favorited id", async () => {
    await addHadithFavorite("bukhari:1");
    await addHadithFavorite("bukhari:1");
    expect(await listHadithFavorites()).toEqual(["bukhari:1"]);
  });

  it("removes a favorite", async () => {
    await addHadithFavorite("bukhari:1");
    await addHadithFavorite("muslim:5");
    await removeHadithFavorite("bukhari:1");
    expect(await listHadithFavorites()).toEqual(["muslim:5"]);
  });

  it("clearHadithFavorites empties the list", async () => {
    await addHadithFavorite("bukhari:1");
    await clearHadithFavorites();
    expect(await listHadithFavorites()).toEqual([]);
  });
});
