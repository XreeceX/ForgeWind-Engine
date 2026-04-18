import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1c20",
        mist: "#5c6370",
        canvas: "#f8f9ff",
        line: "#e8eaf2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-wash":
          "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(99, 102, 241, 0.12), transparent), linear-gradient(180deg, #f8f9ff 0%, #ffffff 55%)",
        "cta-strip": "linear-gradient(90deg, #ec4899 0%, #6366f1 55%, #3b82f6 100%)",
      },
      boxShadow: {
        card: "0 1px 0 rgba(17, 24, 39, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
