import { isRtlLocale, directionForLocale } from "@/i18n/rtl";
import { appConfig } from "@/config/appConfig";

describe("RTL direction resolution", () => {
  it("flags Arabic as RTL", () => {
    expect(isRtlLocale("ar")).toBe(true);
    expect(directionForLocale("ar")).toBe("rtl");
  });

  it("flags every other supported locale as LTR", () => {
    for (const locale of appConfig.supportedLocales) {
      if (locale === "ar") continue;
      expect(isRtlLocale(locale)).toBe(false);
      expect(directionForLocale(locale)).toBe("ltr");
    }
  });
});
