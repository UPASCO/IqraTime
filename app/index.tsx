import React from "react";
import { Redirect } from "expo-router";

import { usePreferencesStore } from "@/hooks/usePreferencesStore";

export default function Index(): React.JSX.Element {
  const { preferences } = usePreferencesStore();
  return <Redirect href={preferences.onboardingCompleted ? "/(tabs)" : "/onboarding"} />;
}
