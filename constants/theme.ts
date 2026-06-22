export const brandColors = {
  primaryNavy: "#091530",
  secondaryText: "#0f2044",
  goldCta: "#c9a84c",
  softGold: "#f0d98a",
};

export type ThemeName = "light" | "dark";
export type ThemePreference = ThemeName | "system";

export type ThemeTokens = {
  background: string;
  cardBackground: string;
  text: string;
  mutedText: string;
  border: string;
  inputBackground: string;
  buttonBackground: string;
  icon: string;
  shadow: string;
  error: string;
  success: string;
  warning: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

export const themeTokens: Record<ThemeName, ThemeTokens> = {
  light: {
    background: "#ffffff",
    cardBackground: "#ffffff",
    text: brandColors.secondaryText,
    mutedText: "#6b7280",
    border: "#e8e1d2",
    inputBackground: "#f8f6f0",
    buttonBackground: brandColors.goldCta,
    icon: brandColors.secondaryText,
    shadow: "#091530",
    error: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    tint: brandColors.primaryNavy,
    tabIconDefault: "#8a8a9a",
    tabIconSelected: brandColors.primaryNavy,
  },
  dark: {
    background: brandColors.primaryNavy,
    cardBackground: "#0f2044",
    text: "#f8fafc",
    mutedText: "#cbd5e1",
    border: "#23345e",
    inputBackground: "#111f3d",
    buttonBackground: brandColors.goldCta,
    icon: "#f8fafc",
    shadow: "#000000",
    error: "#f87171",
    success: "#4ade80",
    warning: brandColors.softGold,
    tint: brandColors.softGold,
    tabIconDefault: "#94a3b8",
    tabIconSelected: brandColors.softGold,
  },
};

export function colorWithAlpha(hexColor: string, alpha: number) {
  const normalized = hexColor.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
}
