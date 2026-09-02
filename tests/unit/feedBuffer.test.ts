import { FEED_BUFFER, settledSlideIndex, slidesNeeded } from "@/services/feedBuffer";

describe("home feed swipe buffer", () => {
  it("pre-fills the whole buffer on a fresh feed of one slide, so the very first swipe has somewhere to go", () => {
    expect(slidesNeeded(0, 1)).toBe(FEED_BUFFER);
  });

  it("tops up by exactly one after each settled swipe once the buffer is full", () => {
    const length = 1 + FEED_BUFFER;
    expect(slidesNeeded(0, length)).toBe(0);
    expect(slidesNeeded(1, length)).toBe(1);
    expect(slidesNeeded(2, length)).toBe(2);
  });

  it("never asks for a negative number of slides", () => {
    expect(slidesNeeded(0, 50)).toBe(0);
    expect(slidesNeeded(3, 100, 2)).toBe(0);
  });

  it("always leaves at least one slide below the current one — the invariant the Android bug violated", () => {
    for (let index = 0; index < 20; index += 1) {
      for (let length = 1; length <= 25; length += 1) {
        const after = length + slidesNeeded(index, length);
        expect(after).toBeGreaterThanOrEqual(index + 1 + FEED_BUFFER);
      }
    }
  });

  it("rounds a near-boundary offset to the page it settled on", () => {
    expect(settledSlideIndex(0, 700, 5)).toBe(0);
    expect(settledSlideIndex(698, 700, 5)).toBe(1);
    expect(settledSlideIndex(702, 700, 5)).toBe(1);
    expect(settledSlideIndex(2100, 700, 5)).toBe(3);
  });

  it("clamps to the list and tolerates an unmeasured height", () => {
    expect(settledSlideIndex(-30, 700, 5)).toBe(0);
    expect(settledSlideIndex(99999, 700, 5)).toBe(4);
    expect(settledSlideIndex(1400, 0, 5)).toBe(0);
    expect(settledSlideIndex(1400, 700, 0)).toBe(0);
  });
});
