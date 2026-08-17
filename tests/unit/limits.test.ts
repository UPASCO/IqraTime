import { Platform } from "react-native";

import { getMaxPendingNotifications, getSchedulingHorizonDays } from "@/notifications/limits";
import { appConfig } from "@/config/appConfig";

describe("notification platform limits", () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Object.defineProperty(Platform, "OS", { get: () => originalOS });
  });

  it("keeps iOS under the effective pending ceiling with a safety margin", () => {
    Object.defineProperty(Platform, "OS", { get: () => "ios" });
    const max = getMaxPendingNotifications();
    expect(max).toBe(appConfig.notificationLimits.iosEffectivePendingLimit - appConfig.notificationLimits.iosSafetyMargin);
    expect(max).toBeLessThan(appConfig.notificationLimits.iosEffectivePendingLimit);
  });

  it("uses the Android soft limit on Android", () => {
    Object.defineProperty(Platform, "OS", { get: () => "android" });
    expect(getMaxPendingNotifications()).toBe(appConfig.notificationLimits.androidSoftLimit);
  });

  it("gives iOS a shorter scheduling horizon than Android given the tighter pending limit", () => {
    Object.defineProperty(Platform, "OS", { get: () => "ios" });
    const iosHorizon = getSchedulingHorizonDays();
    Object.defineProperty(Platform, "OS", { get: () => "android" });
    const androidHorizon = getSchedulingHorizonDays();
    expect(iosHorizon).toBeLessThanOrEqual(androidHorizon);
  });
});
