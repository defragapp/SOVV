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
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          glow: "var(--accent-glow)",
        },
        brand: {
          DEFAULT: "#FFFFFF",
          glow: "rgba(255, 255, 255, 0.2)",
        },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "SF Pro Display", "-apple-system", "sans-serif"],
        serif: ["var(--font-fraunces)", "Times New Roman", "serif"],
        mono: ["var(--font-jetbrains-mono)", "SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards'
      }
    },
  },
  plugins: [],
};

export default config;
