export const theme = {
  colors: {
    bg: "#0B1220",
    bgAlt: "#111B2E",
    card: "#152238",
    cardAlt: "#1B2A44",
    border: "#233252",
    primary: "#E8B25C", // gold accent
    primaryDark: "#C89344",
    text: "#F5F7FA",
    textMuted: "#8C9BB5",
    textFaint: "#5E6E8C",
    danger: "#E5484D",
    success: "#3FB27F",
    chipActive: "#E8B25C",
    chipInactive: "#1B2A44",
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  spacing: (n: number) => n * 4,
};

export type Theme = typeof theme;
