/**
 * Centralized design tokens: colors, spacing, radii, typography, shadows.
 * Direction artistique: vert profond / ivoire / accents dorés discrets.
 * All contrast pairs below meet WCAG AA (4.5:1 for body text) at their
 * intended usage (text-on-background / text-on-surface).
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const fontSizeScales: Record<"small" | "medium" | "large" | "extra_large", number> = {
  small: 0.9,
  medium: 1,
  large: 1.15,
  extra_large: 1.35,
};

export const typography = {
  fontFamilyLatin: undefined as string | undefined, // system default; see docs/ACCESSIBILITY.md
  // No Arabic-specific typeface ships in this build (no licensed, offline-
  // redistributable font was fetched in this session — see
  // docs/KNOWN_LIMITATIONS.md). `undefined` uses the OS's own Arabic-
  // capable system font, which is legible but not a traditional Uthmani
  // naskh style. Swap in a real font (e.g. Noto Naskh Arabic, SIL OFL) via
  // expo-font before production and set this to its registered name.
  fontFamilyArabic: undefined as string | undefined,
  sizes: {
    display: 28,
    title: 22,
    subtitle: 18,
    body: 16,
    caption: 13,
    arabicBody: 22,
  },
  lineHeights: {
    display: 36,
    title: 30,
    subtitle: 26,
    body: 24,
    caption: 18,
    arabicBody: 40,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textOnAccent: string;
  accent: string;
  accentMuted: string;
  /** Accessible (AA, ~4.6:1 on `background`) gold for text/icons that must remain legible. */
  gold: string;
  /** Raw brand gold — decorative use only (borders, small non-text accents): fails AA as text on light backgrounds. */
  goldDecorative: string;
  success: string;
  danger: string;
  warning: string;
  overlay: string;
}

/**
 * Palette per the product brief: deep green / secondary green / ivory /
 * warm white / discreet gold / dark text. Verified against WCAG AA
 * (4.5:1 body text, 3:1 large text/UI) — see the contrast notes inline.
 * `goldDecorative` (#C8A45D, the brief's literal gold) measures only
 * ~2.1:1 on ivory, so it is never used for text; `gold` is a darkened,
 * AA-passing (~4.6:1) variant used wherever gold appears as text or an
 * icon that must stay legible, per "le doré doit rester un accent".
 */
export const lightColors: ColorTokens = {
  background: "#F7F3E8", // ivoire clair
  surface: "#FFFCF5", // blanc chaud
  surfaceElevated: "#F1EADA",
  border: "#E2D9C3",
  textPrimary: "#17201C", // ~15:1 on background
  textSecondary: "#455349", // ~7.3:1 on background
  textOnAccent: "#F7F3E8",
  accent: "#12372A", // vert profond — ~11.8:1 on background
  accentMuted: "#2F6B55", // vert secondaire — ~5.65:1 on background
  gold: "#826B3C", // darkened for AA text/icon use — ~4.6:1 on background
  goldDecorative: "#C8A45D", // brief's literal gold — accents/borders only, not text
  success: "#2F6B55",
  danger: "#9A2F2F", // ~6.7:1 on background
  warning: "#826B3C",
  overlay: "rgba(18, 55, 42, 0.55)",
};

export const darkColors: ColorTokens = {
  background: "#0E1E17",
  surface: "#152D22",
  surfaceElevated: "#1B382A",
  border: "#2C4A3B",
  textPrimary: "#F3EFE2",
  textSecondary: "#B9C6BC",
  textOnAccent: "#0E1E17",
  accent: "#79C9A1",
  accentMuted: "#4F8F72",
  gold: "#D9B75B", // raw gold passes AA on this dark background (~6:1+), safe as text here
  goldDecorative: "#D9B75B",
  success: "#7FCF9C",
  danger: "#E28080",
  warning: "#E0C376",
  overlay: "rgba(0, 0, 0, 0.65)",
};

export const shadows = {
  card: {
    shadowColor: "#0B1712",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const animation = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;
