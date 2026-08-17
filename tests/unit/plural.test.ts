import { formatPlural } from "@/i18n/plural";
import { pluralForm } from "@/i18n/pluralForm";

describe("formatPlural", () => {
  it("selects the English 'one' vs 'other' category correctly", () => {
    const form = pluralForm({ one: "{count} item", other: "{count} items" });
    expect(formatPlural("en", 1, form)).toBe("1 item");
    expect(formatPlural("en", 5, form)).toBe("5 items");
    expect(formatPlural("en", 0, form)).toBe("0 items");
  });

  it("selects the correct Russian category across one/few/many", () => {
    const form = pluralForm({ one: "{count} запись", few: "{count} записи", many: "{count} записей", other: "{count} записи" });
    expect(formatPlural("ru", 1, form)).toBe("1 запись");
    expect(formatPlural("ru", 21, form)).toBe("21 запись"); // 21 -> one
    expect(formatPlural("ru", 2, form)).toBe("2 записи"); // 2-4 -> few
    expect(formatPlural("ru", 5, form)).toBe("5 записей"); // 5-20 -> many
    expect(formatPlural("ru", 11, form)).toBe("11 записей"); // 11-14 -> many
  });

  it("selects the correct Arabic category across zero/one/two/few/many/other", () => {
    const form = pluralForm({
      zero: "zero",
      one: "one",
      two: "two",
      few: "few",
      many: "many",
      other: "other",
    });
    expect(formatPlural("ar", 0, form)).toBe("zero");
    expect(formatPlural("ar", 1, form)).toBe("one");
    expect(formatPlural("ar", 2, form)).toBe("two");
    expect(formatPlural("ar", 3, form)).toBe("few");
    expect(formatPlural("ar", 11, form)).toBe("many");
  });

  it("falls back to 'other' for a locale category not supplied", () => {
    const form = pluralForm({ other: "many things" });
    expect(formatPlural("zh-CN", 1, form)).toBe("many things");
    expect(formatPlural("zh-CN", 100, form)).toBe("many things");
  });

  it("formats the count with locale-aware digit grouping", () => {
    const form = pluralForm({ other: "{count}" });
    expect(formatPlural("en", 1234, form)).toBe("1,234");
  });
});
