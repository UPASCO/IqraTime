import { parseNotificationResponse } from "@/notifications/handlers";

function makeResponse(actionIdentifier: string, data: unknown): Parameters<typeof parseNotificationResponse>[0] {
  return {
    actionIdentifier,
    notification: { request: { content: { data }, identifier: "n1" }, date: Date.now() },
  } as unknown as Parameters<typeof parseNotificationResponse>[0];
}

describe("parseNotificationResponse", () => {
  it("parses a plain tap (default action) with valid data", () => {
    const result = parseNotificationResponse(makeResponse("expo.modules.notifications.actions.DEFAULT", { ayahId: "94:5", locale: "en", slotId: "s1" }));
    expect(result.kind).toBe("tap");
    expect(result.data).toEqual({ ayahId: "94:5", locale: "en", slotId: "s1" });
  });

  it("parses the 'favorite' action", () => {
    const result = parseNotificationResponse(makeResponse("favorite", { ayahId: "2:152", locale: "fr", slotId: "s2" }));
    expect(result.kind).toBe("favorite");
    expect(result.data?.ayahId).toBe("2:152");
  });

  it("parses the 'another' action", () => {
    const result = parseNotificationResponse(makeResponse("another", { ayahId: "3:139", locale: "ar", slotId: "s3" }));
    expect(result.kind).toBe("another");
  });

  it("returns null data instead of throwing when the payload is malformed", () => {
    const result = parseNotificationResponse(makeResponse("expo.modules.notifications.actions.DEFAULT", { unexpected: true }));
    expect(result.kind).toBe("tap");
    expect(result.data).toBeNull();
  });

  it("returns null data when there is no data at all", () => {
    const result = parseNotificationResponse(makeResponse("expo.modules.notifications.actions.DEFAULT", undefined));
    expect(result.data).toBeNull();
  });
});
