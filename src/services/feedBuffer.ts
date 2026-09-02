/**
 * The arithmetic behind the home feed's swipe buffer — kept pure and
 * separate from the screen so it can be unit-tested, and so the Android
 * "swipe bounces back onto the same slide" bug it fixed can be guarded by
 * tests rather than rediscovered on a device.
 *
 * Background: the feed used to grow by exactly one slide per FlatList
 * onEndReached call, starting from a single full-screen item. On Android
 * that callback is unreliable when the content is no taller than the
 * viewport (it can fire once, late, or not at all), so intermittently
 * there was no next slide to swipe to. The fix keeps FEED_BUFFER slides
 * ready below the one on screen, refilled after every settled swipe.
 */

/**
 * How many slides are kept ready below the one on screen. Three is enough
 * that even a fast run of swipes never catches up with the (async,
 * DB-backed) selection of the next one, while keeping the mounted card
 * count small.
 */
export const FEED_BUFFER = 3;

/** How many slides must be appended so that `buffer` slides exist below `currentIndex` in a feed of `length` slides. */
export function slidesNeeded(currentIndex: number, length: number, buffer: number = FEED_BUFFER): number {
  return Math.max(0, currentIndex + 1 + buffer - length);
}

/**
 * The slide index a paging list has settled on for a content offset,
 * clamped to the list. Rounding (not flooring) is deliberate: the settle
 * callbacks fire with the offset a pixel or two either side of the exact
 * page boundary on Android.
 */
export function settledSlideIndex(offsetY: number, slideHeight: number, length: number): number {
  if (slideHeight <= 0 || length <= 0) return 0;
  return Math.min(Math.max(0, Math.round(offsetY / slideHeight)), length - 1);
}
