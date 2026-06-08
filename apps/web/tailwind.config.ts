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
        background: "#000000",
        surface: {
          DEFAULT: "#0A0A0A",
          hover: "#111111",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.15)",
        },
        foreground: {
          DEFAULT: "#EDEDED",
          muted: "#A1A1AA",
        },
        brand: {
          DEFAULT: "#FFFFFF",
          glow: "rgba(255, 255, 255, 0.2)",
        },
      },
      borderRadius: {
        iOS: "12px",
        btn: "8px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(255, 255, 255, 0.1)",
        surface: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "conic-gradient(from 180deg at 50% 50%, #000000 0deg, #1A1A1A 180deg, #000000 360deg)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Cascadia Code", "Source Code Pro", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;