import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useColorScheme, AccessibilityInfo } from "react-native";

import type { AppThemeMode, TextSizeScale } from "@/domain/types";
import { fontSizeScales, lightColors, darkColors, spacing, radii, typography, shadows, animation, type ColorTokens } from "./tokens";

export interface ThemeContextValue {
  mode: AppThemeMode;
  resolvedScheme: "light" | "dark";
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  animation: typeof animation;
  textSizeScale: TextSizeScale;
  fontScaleMultiplier: number;
  reduceMotionEnabled: boolean;
  setMode: (mode: AppThemeMode) => void;
  setTextSizeScale: (scale: TextSizeScale) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: AppThemeMode;
  initialTextSizeScale?: TextSizeScale;
  onModeChange?: (mode: AppThemeMode) => void;
  onTextSizeScaleChange?: (scale: TextSizeScale) => void;
}

export function ThemeProvider({
  children,
  initialMode = "system",
  initialTextSizeScale = "medium",
  onModeChange,
  onTextSizeScaleChange,
}: ThemeProviderProps): React.JSX.Element {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<AppThemeMode>(initialMode);
  const [textSizeScale, setTextSizeScaleState] = useState<TextSizeScale>(initialTextSizeScale);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotionEnabled(value);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const resolvedScheme: "light" | "dark" = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedScheme,
      colors: resolvedScheme === "dark" ? darkColors : lightColors,
      spacing,
      radii,
      typography,
      shadows,
      animation,
      textSizeScale,
      fontScaleMultiplier: fontSizeScales[textSizeScale],
      reduceMotionEnabled,
      setMode: (next) => {
        setModeState(next);
        onModeChange?.(next);
      },
      setTextSizeScale: (next) => {
        setTextSizeScaleState(next);
        onTextSizeScaleChange?.(next);
      },
    }),
    [mode, resolvedScheme, textSizeScale, reduceMotionEnabled, onModeChange, onTextSizeScaleChange],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
