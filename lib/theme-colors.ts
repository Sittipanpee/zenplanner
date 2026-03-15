/**
 * ZenPlanner Theme Colors
 * Color schemes for planner export
 */

export interface ThemeColors {
  name: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  sage: string;
  sageLight: string;
  earth: string;
  sky: string;
  blossom: string;
  gold: string;
  indigo: string;
  stone: string;
  accent: string;
}

export const THEMES: Record<string, ThemeColors> = {
  "zen-sage": {
    name: "Zen Sage",
    bg: "#FAFAF7",
    surface: "#FFFFFF",
    border: "#E8E4DB",
    text: "#2C2C2C",
    textSecondary: "#6B6560",
    textMuted: "#A8A098",
    sage: "#7C9A82",
    sageLight: "#A8C5AE",
    earth: "#B38B6D",
    sky: "#89A4C7",
    blossom: "#D4837F",
    gold: "#C9A96E",
    indigo: "#6B7AA1",
    stone: "#8B8680",
    accent: "#7C9A82",
  },
  "zen-earth": {
    name: "Zen Earth",
    bg: "#F5F3EE",
    surface: "#FFFFFF",
    border: "#D4CFC3",
    text: "#3C2415",
    textSecondary: "#6B5344",
    textMuted: "#A89888",
    sage: "#8B7355",
    sageLight: "#B8A090",
    earth: "#B38B6D",
    sky: "#A8C4D4",
    blossom: "#C4A090",
    gold: "#C9A96E",
    indigo: "#7A8B9A",
    stone: "#8B7355",
    accent: "#B38B6D",
  },
  "zen-sky": {
    name: "Zen Sky",
    bg: "#F0F4F8",
    surface: "#FFFFFF",
    border: "#D4DFE8",
    text: "#2C3E50",
    textSecondary: "#5D6D7E",
    textMuted: "#A0B0C0",
    sage: "#7C9A82",
    sageLight: "#A8C5AE",
    earth: "#8B7355",
    sky: "#89A4C7",
    blossom: "#C490A0",
    gold: "#B8C4D4",
    indigo: "#6B7AA1",
    stone: "#708090",
    accent: "#89A4C7",
  },
  "zen-blossom": {
    name: "Zen Blossom",
    bg: "#FDF5F5",
    surface: "#FFFFFF",
    border: "#F0E8E8",
    text: "#4A3030",
    textSecondary: "#6B5050",
    textMuted: "#A89898",
    sage: "#A88080",
    sageLight: "#D4A8A8",
    earth: "#B38B6D",
    sky: "#90A4C0",
    blossom: "#D4837F",
    gold: "#C9A080",
    indigo: "#8B7080",
    stone: "#907070",
    accent: "#D4837F",
  },
  "zen-gold": {
    name: "Zen Gold",
    bg: "#FDFAF5",
    surface: "#FFFFFF",
    border: "#F0E8D8",
    text: "#4A4028",
    textSecondary: "#6B6048",
    textMuted: "#A89878",
    sage: "#9A8A60",
    sageLight: "#C8C090",
    earth: "#B38B6D",
    sky: "#A0B8D0",
    blossom: "#C8A090",
    gold: "#C9A96E",
    indigo: "#807860",
    stone: "#988868",
    accent: "#C9A96E",
  },
};

/**
 * Get theme colors by theme name
 */
export function getThemeColors(themeName: string): ThemeColors {
  return THEMES[themeName] || THEMES["zen-sage"];
}

/**
 * Get all available theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(THEMES);
}
