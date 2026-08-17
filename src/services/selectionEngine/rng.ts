/**
 * A small, fast, seedable PRNG (mulberry32). Not cryptographically secure —
 * it doesn't need to be, since it only picks which ayah to show next.
 * Being seedable is what makes the selection engine deterministic in tests.
 */
export type RandomFn = () => number; // returns a float in [0, 1)

export function mulberry32(seed: number): RandomFn {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks one element using pre-computed non-negative weights, via a single random draw. */
export function weightedPick<T>(items: readonly T[], weights: readonly number[], random: RandomFn): T {
  if (items.length === 0) {
    throw new Error("weightedPick: items must not be empty");
  }
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) {
    // Degenerate weights (all zero): fall back to uniform choice.
    const index = Math.floor(random() * items.length);
    return items[Math.min(index, items.length - 1)] as T;
  }
  let target = random() * total;
  for (let i = 0; i < items.length; i += 1) {
    target -= Math.max(0, weights[i] ?? 0);
    if (target <= 0) return items[i] as T;
  }
  return items[items.length - 1] as T;
}
