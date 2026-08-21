import { nextFeedKind } from "@/services/feedContentMode";

describe("nextFeedKind", () => {
  it("always returns ayah for ayah_only, regardless of the previous kind", () => {
    expect(nextFeedKind("ayah_only", undefined)).toBe("ayah");
    expect(nextFeedKind("ayah_only", "ayah")).toBe("ayah");
    expect(nextFeedKind("ayah_only", "hadith")).toBe("ayah");
  });

  it("always returns hadith for hadith_only, regardless of the previous kind", () => {
    expect(nextFeedKind("hadith_only", undefined)).toBe("hadith");
    expect(nextFeedKind("hadith_only", "ayah")).toBe("hadith");
    expect(nextFeedKind("hadith_only", "hadith")).toBe("hadith");
  });

  it("mixed mode starts with ayah when there is no previous entry", () => {
    expect(nextFeedKind("mixed", undefined)).toBe("ayah");
  });

  it("mixed mode alternates strictly, one hadith per one ayah", () => {
    let kind = nextFeedKind("mixed", undefined);
    const sequence = [kind];
    for (let i = 0; i < 5; i += 1) {
      kind = nextFeedKind("mixed", kind);
      sequence.push(kind);
    }
    expect(sequence).toEqual(["ayah", "hadith", "ayah", "hadith", "ayah", "hadith"]);
  });
});
