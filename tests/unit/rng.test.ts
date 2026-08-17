import { mulberry32, weightedPick } from "@/services/selectionEngine/rng";

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("always returns values in [0, 1)", () => {
    const rand = mulberry32(999);
    for (let i = 0; i < 200; i += 1) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("weightedPick", () => {
  it("always picks the only item when there is one", () => {
    const rand = mulberry32(1);
    expect(weightedPick(["a"], [1], rand)).toBe("a");
  });

  it("never picks an item with zero relative weight when a positive-weight item exists", () => {
    const rand = mulberry32(5);
    for (let i = 0; i < 50; i += 1) {
      expect(weightedPick(["never", "always"], [0, 1], rand)).toBe("always");
    }
  });

  it("falls back to a uniform pick when all weights are zero (never throws)", () => {
    const rand = mulberry32(7);
    const result = weightedPick(["a", "b", "c"], [0, 0, 0], rand);
    expect(["a", "b", "c"]).toContain(result);
  });
});
