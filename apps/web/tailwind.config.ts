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
        // ── Foundation ──────────────────────────────────────────────────
        background: "#05070B",
        foreground: "#F6F5F3",
        border: "rgba(255,255,255,0.10)",

        // ── Accent system ───────────────────────────────────────────────
        // Warm ivory — human warmth, Baseline Design
        ivory: "#F0EDE6",
        // Muted amber — active pattern, attention
        amber: {
          DEFAULT: "#C8922A",
          muted: "#8A6420",
          subtle: "rgba(200,146,42,0.12)",
        },
        // Oxblood — strain, repair, Covenant
        oxblood: {
          DEFAULT: "#7A2020",
          muted: "#5A1818",
          subtle: "rgba(122,32,32,0.12)",
        },
        // Steel — calm, grounding, Library
        steel: {
          DEFAULT: "#4A5568",
          light: "#718096",
          subtle: "rgba(74,85,104,0.15)",
        },
        // Brass — premium markers, Pro
        brass: {
          DEFAULT: "#B8960C",
          subtle: "rgba(184,150,12,0.10)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Cascadia Code"',
          '"Source Code Pro"',
          "ui-monospace",
          "Menlo",
          "monospace",
        ],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        widest: "0.2em",
        ultra: "0.35em",
      },
      fontSize: {
        micro: ["0.5625rem", { lineHeight: "1rem", letterSpacing: "0.2em" }],
        nano: ["0.5rem", { lineHeight: "0.875rem", letterSpacing: "0.25em" }],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease forwards",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
    },
  },
  plugins: [],
};

export default config;