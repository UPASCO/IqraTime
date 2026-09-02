import { parseNotificationResponse } from "@/notifications/handlers";

function makeResponse(actionIdentifier: string, data: unknown): Parameters<typeof parseNotificationResponse>[0] {
  return {
    actionIdentifier,
    notification: { request: { content: { data }, identifier: "n1" }, date: Date.now() },
  } as unknown as Parameters<typeof parseNotificationResponse>[0];
}

const DEFAULT_ACTION = "expo.modules.notifications.actions.DEFAULT";

describe("parseNotificationResponse", () => {
  it("parses a plain tap (default action) with valid ayah data", () => {
    const result = parseNotificationResponse(makeResponse(DEFAULT_ACTION, { kind: "ayah", contentId: "94:5", locale: "en", slotId: "s1" }));
    expect(result.kind).toBe("tap");
    expect(result.data).toEqual({ kind: "ayah", contentId: "94:5", locale: "en", slotId: "s1" });
  });

  it("parses hadith data", () => {
    const result = parseNotificationResponse(makeResponse(DEFAULT_ACTION, { kind: "hadith", contentId: "bukhari:6116", locale: "fr", slotId: "s9" }));
    expect(result.data).toEqual({ kind: "hadith", contentId: "bukhari:6116", locale: "fr", slotId: "s9" });
  });

  it("still routes notifications scheduled by a build that only sent { ayahId } (queued across an update)", () => {
    const result = parseNotificationResponse(makeResponse(DEFAULT_ACTION, { ayahId: "94:5", locale: "en", slotId: "s1" }));
    expect(result.data).toEqual({ kind: "ayah", contentId: "94:5", locale: "en", slotId: "s1" });
  });

  it("parses the 'favorite' action", () => {
    const result = parseNotificationResponse(makeResponse("favorite", { kind: "ayah", contentId: "2:152", locale: "fr", slotId: "s2" }));
    expect(result.kind).toBe("favorite");
    expect(result.data?.contentId).toBe("2:152");
  });

  it("parses the 'another' action", () => {
    const result = parseNotificationResponse(makeResponse("another", { kind: "ayah", contentId: "3:139", locale: "ar", slotId: "s3" }));
    expect(result.kind).toBe("another");
  });

  it("rejects an unknown kind rather than guessing", () => {
    const result = parseNotificationResponse(makeResponse(DEFAULT_ACTION, { kind: "poem", contentId: "x", locale: "en", slotId: "s1" }));
    expect(result.data).toBeNull();
  });

  it("returns null data instead of throwing when the payload is malformed", () => {
    const result = parseNotificationResponse(makeResponse(DEFAULT_ACTION, { unexpected: true }));
    expect(result.kind).toBe("tap");
    expect(result.data).toBeNull();
  });

  it("returns null data when there is no data at all", () => {
    const result = parseNotificationResponse(makeResponse(DEFAULT_ACTION, undefined));
    expect(result.data).toBeNull();
  });
});
