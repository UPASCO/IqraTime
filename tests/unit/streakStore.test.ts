import AsyncStorage from "@react-native-async-storage/async-storage";

import { recordAppOpen, getStreak, clearStreak } from "@/storage/streakStore";

describe("streakStore", () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it("starts a streak of 1 on the first open", async () => {
    const info = await recordAppOpen(new Date("2026-08-20T09:00:00"));
    expect(info.currentStreak).toBe(1);
    expect(info.bestStreak).toBe(1);
  });

  it("does not double-count a second open on the same local day", async () => {
    await recordAppOpen(new Date("2026-08-20T09:00:00"));
    const info = await recordAppOpen(new Date("2026-08-20T21:00:00"));
    expect(info.currentStreak).toBe(1);
  });

  it("extends the streak on the very next calendar day", async () => {
    await recordAppOpen(new Date("2026-08-20T09:00:00"));
    const info = await recordAppOpen(new Date("2026-08-21T09:00:00"));
    expect(info.currentStreak).toBe(2);
    expect(info.bestStreak).toBe(2);
  });

  it("resets to 1 after a gap of more than one day, while keeping the best streak", async () => {
    await recordAppOpen(new Date("2026-08-20T09:00:00"));
    await recordAppOpen(new Date("2026-08-21T09:00:00"));
    await recordAppOpen(new Date("2026-08-22T09:00:00"));
    const info = await recordAppOpen(new Date("2026-08-25T09:00:00"));
    expect(info.currentStreak).toBe(1);
    expect(info.bestStreak).toBe(3);
  });

  it("getStreak returns null when nothing has been recorded yet", async () => {
    expect(await getStreak()).toBeNull();
  });

  it("clearStreak removes any stored streak", async () => {
    await recordAppOpen(new Date("2026-08-20T09:00:00"));
    await clearStreak();
    expect(await getStreak()).toBeNull();
  });
});
