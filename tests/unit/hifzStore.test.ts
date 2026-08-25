import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  addToHifz,
  clearHifz,
  isInHifz,
  listDueHifzEntries,
  listHifzEntries,
  recordHifzReview,
  removeFromHifz,
  REVIEW_INTERVALS_DAYS,
} from "@/storage/hifzStore";

const DAY_MS = 86_400_000;
const t0 = new Date("2026-08-25T10:00:00.000Z");
const daysLater = (days: number) => new Date(t0.getTime() + days * DAY_MS);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("hifzStore", () => {
  it("adds idempotently and reports membership", async () => {
    await addToHifz("2:255", t0);
    await addToHifz("2:255", t0);
    expect(await listHifzEntries()).toHaveLength(1);
    expect(await isInHifz("2:255")).toBe(true);
    expect(await isInHifz("1:1")).toBe(false);
  });

  it("a new entry is due immediately", async () => {
    await addToHifz("2:255", t0);
    expect(await listDueHifzEntries(t0)).toHaveLength(1);
  });

  it("climbs the interval ladder on success: 1, 3, 7, 14, 30, 60 days", async () => {
    await addToHifz("2:255", t0);
    let reviewAt = t0;
    for (const expectedDays of REVIEW_INTERVALS_DAYS) {
      const updated = await recordHifzReview("2:255", true, reviewAt);
      expect(updated).toBeDefined();
      const dueAt = new Date(updated!.nextReviewAtUtcIso);
      expect(dueAt.getTime() - reviewAt.getTime()).toBe(expectedDays * DAY_MS);
      // Not due one hour before, due one hour after.
      expect(await listDueHifzEntries(new Date(dueAt.getTime() - 3_600_000))).toHaveLength(0);
      expect(await listDueHifzEntries(new Date(dueAt.getTime() + 3_600_000))).toHaveLength(1);
      reviewAt = dueAt;
    }
  });

  it("stays on the 60-day maintenance cycle at the top instead of graduating out", async () => {
    await addToHifz("2:255", t0);
    let reviewAt = t0;
    for (let i = 0; i < REVIEW_INTERVALS_DAYS.length + 3; i += 1) {
      const updated = await recordHifzReview("2:255", true, reviewAt);
      reviewAt = new Date(updated!.nextReviewAtUtcIso);
    }
    const [entry] = await listHifzEntries();
    expect(entry?.stage).toBe(REVIEW_INTERVALS_DAYS.length - 1);
    expect(entry?.successCount).toBe(REVIEW_INTERVALS_DAYS.length + 3);
  });

  it("a failed review resets to stage 0, due again in 1 day", async () => {
    await addToHifz("2:255", t0);
    await recordHifzReview("2:255", true, t0);
    await recordHifzReview("2:255", true, daysLater(1));
    const failed = await recordHifzReview("2:255", false, daysLater(4));
    expect(failed?.stage).toBe(0);
    expect(new Date(failed!.nextReviewAtUtcIso).getTime() - daysLater(4).getTime()).toBe(1 * DAY_MS);
    // The success count is lifetime and never decremented by a failure.
    expect(failed?.successCount).toBe(2);
  });

  it("sorts due entries soonest-due first and removes cleanly", async () => {
    await addToHifz("2:255", t0);
    await addToHifz("1:1", daysLater(0.5));
    await recordHifzReview("2:255", true, t0); // due t0+1d
    // 1:1 still due immediately (added, never reviewed).
    const due = await listDueHifzEntries(daysLater(2));
    expect(due.map((e) => e.ayahId)).toEqual(["1:1", "2:255"]);

    await removeFromHifz("1:1");
    expect(await isInHifz("1:1")).toBe(false);
    expect(await listHifzEntries()).toHaveLength(1);

    await clearHifz();
    expect(await listHifzEntries()).toHaveLength(0);
  });

  it("recordHifzReview on an unknown id is a safe no-op", async () => {
    expect(await recordHifzReview("99:99", true, t0)).toBeUndefined();
  });
});
