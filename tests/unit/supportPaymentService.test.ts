import { Linking } from "react-native";
import fs from "node:fs";
import path from "node:path";

import * as supportPaymentService from "@/services/supportPaymentService";
import {
  getSupportUnavailableReason,
  isSupportAvailable,
  getSupportPaymentUrl,
  openSupportPaymentPage,
} from "@/services/supportPaymentService";
import type { SupportConfig } from "@/config/supportConfig";

function fullyValidConfig(overrides: Partial<SupportConfig> = {}): SupportConfig {
  return {
    enabled: true,
    paymentUrl: "https://buy.stripe.com/test_abc123",
    providerName: "Stripe",
    legalReviewed: true,
    religiousReviewed: true,
    iosApproved: true,
    androidApproved: true,
    ...overrides,
  };
}

describe("getSupportUnavailableReason / isSupportAvailable", () => {
  it("is unavailable when the feature flag is off", () => {
    expect(getSupportUnavailableReason({ config: fullyValidConfig({ enabled: false }) })).toBe("disabled");
  });

  it("is unavailable when the payment URL is empty", () => {
    expect(getSupportUnavailableReason({ config: fullyValidConfig({ paymentUrl: "" }) })).toBe("missing_url");
  });

  it("is unavailable when the payment URL is HTTP, not HTTPS", () => {
    expect(getSupportUnavailableReason({ config: fullyValidConfig({ paymentUrl: "http://buy.stripe.com/x" }) })).toBe(
      "invalid_url",
    );
  });

  it("is unavailable when the payment URL points at a malicious/unlisted host", () => {
    expect(
      getSupportUnavailableReason({ config: fullyValidConfig({ paymentUrl: "https://evil.example.com/phish" }) }),
    ).toBe("invalid_url");
  });

  it("is unavailable when legal review is missing", () => {
    expect(getSupportUnavailableReason({ config: fullyValidConfig({ legalReviewed: false }) })).toBe(
      "legal_not_reviewed",
    );
  });

  it("is unavailable when religious review is missing", () => {
    expect(getSupportUnavailableReason({ config: fullyValidConfig({ religiousReviewed: false }) })).toBe(
      "religious_not_reviewed",
    );
  });

  it("checks the iOS approval flag specifically on iOS", () => {
    expect(
      getSupportUnavailableReason({ config: fullyValidConfig({ iosApproved: false }), platformOS: "ios" }),
    ).toBe("platform_not_approved");
    expect(
      getSupportUnavailableReason({ config: fullyValidConfig({ iosApproved: false }), platformOS: "android" }),
    ).toBeNull();
  });

  it("checks the Android approval flag specifically on Android", () => {
    expect(
      getSupportUnavailableReason({ config: fullyValidConfig({ androidApproved: false }), platformOS: "android" }),
    ).toBe("platform_not_approved");
    expect(
      getSupportUnavailableReason({ config: fullyValidConfig({ androidApproved: false }), platformOS: "ios" }),
    ).toBeNull();
  });

  it("is fully available when every gate passes", () => {
    expect(isSupportAvailable({ config: fullyValidConfig(), platformOS: "ios" })).toBe(true);
    expect(isSupportAvailable({ config: fullyValidConfig(), platformOS: "android" })).toBe(true);
  });
});

describe("getSupportPaymentUrl", () => {
  it("never returns a URL when unavailable", () => {
    expect(getSupportPaymentUrl({ config: fullyValidConfig({ enabled: false }) })).toBeNull();
  });

  it("returns the URL only when fully available", () => {
    expect(getSupportPaymentUrl({ config: fullyValidConfig(), platformOS: "ios" })).toBe(
      "https://buy.stripe.com/test_abc123",
    );
  });
});

describe("openSupportPaymentPage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not attempt to open anything when unavailable", async () => {
    const openSpy = jest.spyOn(Linking, "openURL");
    const result = await openSupportPaymentPage({ config: fullyValidConfig({ enabled: false }) });
    expect(result).toEqual({ success: false, error: "unavailable" });
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("reports no_browser when the OS cannot open the URL", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(false);
    const result = await openSupportPaymentPage({ config: fullyValidConfig(), platformOS: "ios" });
    expect(result).toEqual({ success: false, error: "no_browser" });
  });

  it("reports open_failed when Linking.openURL throws (system error)", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("boom"));
    const result = await openSupportPaymentPage({ config: fullyValidConfig(), platformOS: "ios" });
    expect(result).toEqual({ success: false, error: "open_failed" });
  });

  it("succeeds when the browser accepts the URL", async () => {
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    const openSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined as never);
    const result = await openSupportPaymentPage({ config: fullyValidConfig(), platformOS: "android" });
    expect(result).toEqual({ success: true });
    expect(openSpy).toHaveBeenCalledWith("https://buy.stripe.com/test_abc123");
  });

  it("never treats returning to the app as payment confirmation (no such API exists on the service)", () => {
    expect(supportPaymentService).not.toHaveProperty("confirmPayment");
    expect(supportPaymentService).not.toHaveProperty("verifyPayment");
    expect(supportPaymentService).not.toHaveProperty("markPaymentComplete");
  });
});

describe("architecture: no in-app WebView is used for payments", () => {
  it("supportPaymentService.ts does not import react-native-webview or any WebView component", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../../src/services/supportPaymentService.ts"), "utf8");
    expect(source).not.toMatch(/react-native-webview/i);
    expect(source).not.toMatch(/<WebView/);
  });
});
