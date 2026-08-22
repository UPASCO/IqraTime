import AsyncStorage from "@react-native-async-storage/async-storage";

import { incrementShareCount, getShareCount } from "@/storage/shareCounterStore";

describe("shareCounterStore", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("starts at 0 when nothing has been shared yet", async () => {
    expect(await getShareCount()).toBe(0);
  });

  it("increments by 1 per call and returns the new total", async () => {
    expect(await incrementShareCount()).toBe(1);
    expect(await incrementShareCount()).toBe(2);
    expect(await incrementShareCount()).toBe(3);
    expect(await getShareCount()).toBe(3);
  });
});
