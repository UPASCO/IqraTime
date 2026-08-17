/** RFC 4122-ish v4 UUID using Math.random. Not cryptographic — fine for local-only identifiers (history rows, notification slot ids). */
export function generateLocalId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
