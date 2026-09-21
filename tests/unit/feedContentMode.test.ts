import { enabledKinds, legacyContentModeToKinds, nextFeedKind } from "@/services/feedContentMode";
import type { ContentKinds } from "@/domain/types";

function kinds(overrides: Partial<ContentKinds> = {}): ContentKinds {
  return { ayah: false, hadith: false, name: false, dua: false, ...overrides };
}

describe("nextFeedKind", () => {
  it("always returns ayah when only ayat are enabled, regardless of the previous kind", () => {
    const only = kinds({ ayah: true });
    expect(nextFeedKind(only, undefined)).toBe("ayah");
    expect(nextFeedKind(only, "ayah")).toBe("ayah");
    expect(nextFeedKind(only, "hadith")).toBe("ayah");
  });

  it("always returns hadith when only hadith are enabled", () => {
    const only = kinds({ hadith: true });
    expect(nextFeedKind(only, undefined)).toBe("hadith");
    expect(nextFeedKind(only, "ayah")).toBe("hadith");
    expect(nextFeedKind(only, "hadith")).toBe("hadith");
  });

  it("starts with ayah when there is no previous entry and ayat are enabled", () => {
    expect(nextFeedKind(kinds({ ayah: true, hadith: true }), undefined)).toBe("ayah");
    expect(nextFeedKind(kinds({ ayah: true, hadith: true, name: true, dua: true }), undefined)).toBe("ayah");
  });

  it("alternates strictly with two kinds enabled, one hadith per one ayah", () => {
    const two = kinds({ ayah: true, hadith: true });
    let kind = nextFeedKind(two, undefined);
    const sequence = [kind];
    for (let i = 0; i < 5; i += 1) {
      kind = nextFeedKind(two, kind);
      sequence.push(kind);
    }
    expect(sequence).toEqual(["ayah", "hadith", "ayah", "hadith", "ayah", "hadith"]);
  });

  it("cycles through all four kinds in the fixed rotation order", () => {
    const all = kinds({ ayah: true, hadith: true, name: true, dua: true });
    let kind = nextFeedKind(all, undefined);
    const sequence = [kind];
    for (let i = 0; i < 7; i += 1) {
      kind = nextFeedKind(all, kind);
      sequence.push(kind);
    }
    expect(sequence).toEqual(["ayah", "hadith", "name", "dua", "ayah", "hadith", "name", "dua"]);
  });

  it("skips disabled kinds and keeps the rotation order among the rest", () => {
    const three = kinds({ ayah: true, name: true, dua: true });
    expect(nextFeedKind(three, "ayah")).toBe("name");
    expect(nextFeedKind(three, "name")).toBe("dua");
    expect(nextFeedKind(three, "dua")).toBe("ayah");
  });

  it("re-anchors to the first enabled kind when the previous kind was disabled since", () => {
    expect(nextFeedKind(kinds({ name: true, dua: true }), "ayah")).toBe("name");
  });

  it("falls back to ayah when nothing is enabled (defensive)", () => {
    expect(nextFeedKind(kinds(), undefined)).toBe("ayah");
  });
});

describe("enabledKinds", () => {
  it("lists the enabled kinds in rotation order", () => {
    expect(enabledKinds(kinds({ dua: true, ayah: true }))).toEqual(["ayah", "dua"]);
  });
});

describe("legacyContentModeToKinds", () => {
  it("keeps hadith_only meaning hadith only", () => {
    expect(legacyContentModeToKinds("hadith_only")).toEqual({ ayah: false, hadith: true, name: false, dua: false });
  });

  it("maps the old default and mixed onto the full rotation", () => {
    expect(legacyContentModeToKinds("ayah_only")).toEqual({ ayah: true, hadith: true, name: true, dua: true });
    expect(legacyContentModeToKinds("mixed")).toEqual({ ayah: true, hadith: true, name: true, dua: true });
  });
});
