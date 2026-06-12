import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./marketing/**/*.{js,ts,jsx,tsx,mdx}",
    "./spaces/**/*.{js,ts,jsx,tsx,mdx}",
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
      fontFamily: {
        sans: ["Geist", "Inter", "SF Pro Display", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
