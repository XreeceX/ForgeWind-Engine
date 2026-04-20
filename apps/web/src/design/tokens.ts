type TokenScale = Record<string, string>;
type TokenColorScale = Record<string, string | TokenScale>;

interface DesignTokenSchema {
  colors: TokenColorScale;
  typography: {
    fontFamily: {
      sans: string[];
      mono: string[];
    };
    fontSize: Record<string, [string, { lineHeight: string; letterSpacing: string }]>;
    fontWeight: Record<string, string>;
  };
  spacing: TokenScale;
  radius: TokenScale;
  shadows: TokenScale;
  motion: {
    duration: TokenScale;
    easing: TokenScale;
  };
}

export const designTokens: DesignTokenSchema = {
  colors: {
    background: "228 30% 7%",
    foreground: "220 35% 96%",
    mutedForeground: "220 18% 68%",
    surface: {
      DEFAULT: "230 24% 11%",
      light: "231 23% 15%",
      lighter: "231 22% 19%",
    },
    panel: {
      DEFAULT: "231 22% 13%",
      elevated: "233 28% 16%",
    },
    primary: {
      50: "228 100% 97%",
      100: "231 96% 92%",
      200: "230 94% 86%",
      300: "233 90% 78%",
      400: "237 86% 70%",
      500: "240 82% 66%",
      600: "243 75% 59%",
      700: "244 66% 52%",
      800: "244 58% 42%",
      900: "246 53% 31%",
      950: "247 55% 18%",
    },
    accent: {
      100: "164 70% 90%",
      200: "161 68% 80%",
      300: "160 65% 68%",
      400: "160 70% 54%",
      500: "160 84% 41%",
      600: "160 84% 34%",
      700: "161 78% 27%",
    },
    success: "160 84% 41%",
    warning: "38 92% 50%",
    danger: "358 79% 61%",
    info: "199 89% 58%",
    border: "220 20% 100% / 0.1",
    borderLight: "220 20% 100% / 0.16",
    ring: "240 82% 66%",
    overlay: "228 35% 4% / 0.7",
  },
  typography: {
    fontFamily: {
      sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      mono: [
        "var(--font-jetbrains-mono)",
        "JetBrains Mono",
        "ui-monospace",
        "monospace",
      ],
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
      sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
      base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0" }],
      lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
      xl: ["1.25rem", { lineHeight: "1.875rem", letterSpacing: "-0.01em" }],
      "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
    },
    fontWeight: {
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  spacing: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
  },
  radius: {
    none: "0px",
    sm: "0px",
    md: "0px",
    lg: "0px",
    xl: "0px",
    "2xl": "0px",
    full: "0px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgb(15 23 42 / 0.35)",
    sm: "0 4px 16px -8px rgb(15 23 42 / 0.45)",
    md: "0 16px 36px -16px rgb(15 23 42 / 0.55)",
    lg: "0 24px 54px -24px rgb(15 23 42 / 0.65)",
    glowPrimary: "0 0 0 1px rgb(99 102 241 / 0.18), 0 12px 32px -14px rgb(99 102 241 / 0.5)",
    glowAccent: "0 0 0 1px rgb(16 185 129 / 0.18), 0 12px 32px -14px rgb(16 185 129 / 0.45)",
  },
  motion: {
    duration: {
      fast: "150ms",
      normal: "220ms",
      slow: "320ms",
    },
    easing: {
      standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
      decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },
};

export type DesignTokens = typeof designTokens;
