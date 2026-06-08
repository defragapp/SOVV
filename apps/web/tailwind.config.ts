import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        surface: {
          DEFAULT: "var(--bg-secondary)",
          hover: "var(--bg-elevated)",
        },
        border: {
          DEFAULT: "var(--border-light)",
          hover: "var(--border-medium)",
          focus: "var(--border-focus)",
        },
        foreground: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-secondary)",
          disabled: "var(--text-disabled)",
        },
        brand: {
          DEFAULT: "#FFFFFF",
          glow: "rgba(255, 255, 255, 0.2)",
        },
      },
      borderRadius: {
        iOS: "16px",
        btn: "999px",
        surface: "16px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(255, 255, 255, 0.1)",
        surface: "0 8px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        "surface-hover": "0 12px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)",
        "card-gradient": "linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.4) 100%)",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
