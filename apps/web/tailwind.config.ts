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
        // ── Monochrome foundation ────────────────────────────────────────
        ink: "#05070B",          // deepest black
        smoke: "#0D0F14",        // near-black with blue undertone
        graphite: "#1A1D24",     // dark panel
        silver: "#8A8F9A",       // mid-grey
        ash: "#C4C7CE",          // light grey
        bone: "#F0EEE9",         // warm off-white
        foreground: "#F6F5F3",   // primary text

        // ── Structural ──────────────────────────────────────────────────
        border: "rgba(246,245,243,0.10)",
        "border-strong": "rgba(246,245,243,0.20)",
        "border-subtle": "rgba(246,245,243,0.06)",

        // ── Legacy aliases ───────────────────────────────────────────────
        background: "#05070B",
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
        "fragment-resolve": "fragmentResolve 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "scan": "scan 3s linear infinite",
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
        fragmentResolve: {
          "0%": { opacity: "0", letterSpacing: "0.4em", filter: "blur(4px)" },
          "60%": { opacity: "0.7", letterSpacing: "0.05em", filter: "blur(1px)" },
          "100%": { opacity: "1", letterSpacing: "-0.02em", filter: "blur(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
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