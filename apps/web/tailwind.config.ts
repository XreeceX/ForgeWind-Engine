import type { Config } from "tailwindcss";
import { designTokens } from "./src/design/tokens";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fw: {
          orange: "#F97316",
          "orange-light": "#FFF7ED",
          "orange-mid": "#FED7AA",
          deep: "#C2410C",
          white: "#FFFFFF",
          "off-white": "#FAFAF9",
          "gray-50": "#F5F5F4",
          "gray-100": "#E7E5E4",
          "gray-400": "#A8A29E",
          "gray-700": "#44403C",
          "gray-900": "#1C1917",
        },
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          light: "hsl(var(--surface-light) / <alpha-value>)",
          lighter: "hsl(var(--surface-lighter) / <alpha-value>)",
        },
        panel: {
          DEFAULT: "hsl(var(--panel) / <alpha-value>)",
          elevated: "hsl(var(--panel-elevated) / <alpha-value>)",
        },
        primary: {
          50: "hsl(var(--primary-50) / <alpha-value>)",
          100: "hsl(var(--primary-100) / <alpha-value>)",
          200: "hsl(var(--primary-200) / <alpha-value>)",
          300: "hsl(var(--primary-300) / <alpha-value>)",
          400: "hsl(var(--primary-400) / <alpha-value>)",
          500: "hsl(var(--primary-500) / <alpha-value>)",
          600: "hsl(var(--primary-600) / <alpha-value>)",
          700: "hsl(var(--primary-700) / <alpha-value>)",
          800: "hsl(var(--primary-800) / <alpha-value>)",
          900: "hsl(var(--primary-900) / <alpha-value>)",
          950: "hsl(var(--primary-950) / <alpha-value>)",
        },
        accent: {
          100: "hsl(var(--accent-100) / <alpha-value>)",
          200: "hsl(var(--accent-200) / <alpha-value>)",
          300: "hsl(var(--accent-300) / <alpha-value>)",
          400: "hsl(var(--accent-400) / <alpha-value>)",
          500: "hsl(var(--accent-500) / <alpha-value>)",
          600: "hsl(var(--accent-600) / <alpha-value>)",
          700: "hsl(var(--accent-700) / <alpha-value>)",
        },
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
        info: "hsl(var(--info) / <alpha-value>)",
        border: "hsl(var(--border))",
        "border-light": "hsl(var(--border-light))",
        overlay: "hsl(var(--overlay))",
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: designTokens.typography.fontSize,
      spacing: designTokens.spacing,
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
        "fw-btn": "8px",
        "fw-card": "12px",
        "fw-modal": "16px",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-accent": "var(--shadow-glow-accent)",
        "fw-card-hover": "0 8px 24px rgba(249, 115, 22, 0.12)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        200: "200ms",
      },
      transitionTimingFunction: {
        "fw-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "fade-in": "fadeIn var(--motion-duration-normal) var(--motion-ease-standard)",
        "slide-up":
          "slideUp var(--motion-duration-normal) var(--motion-ease-emphasized)",
        "slide-in-left":
          "slideInLeft var(--motion-duration-fast) var(--motion-ease-standard)",
        "pulse-slow": "pulse 3s var(--motion-ease-standard) infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "score-fill": "scoreFill 1.5s ease-out forwards",
        "fw-spin-slow": "fwSpin 2s linear infinite",
        "fw-spin-slow-reverse": "fwSpin 2s linear infinite reverse",
        "fw-pulse-ready": "fwPulseReady 1.5s ease-in-out infinite",
        "fw-pulse-work": "fwPulseWork 0.8s ease-in-out infinite",
        "fw-shimmer": "fwShimmer 1.6s ease-in-out infinite",
        "fw-toast-in": "fwToastIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fw-toast-bar": "fwToastBar 4s linear forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        scoreFill: {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--score-offset)" },
        },
        fwSpin: {
          to: { transform: "rotate(360deg)" },
        },
        fwPulseReady: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.92)" },
        },
        fwPulseWork: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        fwShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fwToastIn: {
          "0%": { opacity: "0", transform: "translateX(16px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        fwToastBar: {
          "0%": { transform: "scaleX(1)" },
          "100%": { transform: "scaleX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
