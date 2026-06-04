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
        background: "#09090b", // zinc-950
        foreground: "#fafafa", // zinc-50
        muted: "#27272a", // zinc-800
        border: "rgba(255,255,255,0.1)", // Hairline structural borders
      },
      letterSpacing: {
        tighter: "-0.04em",
        widest: "0.2em", // For those 10px uppercase metadata labels
      },
      fontSize: {
        micro: "10px", // Metadata tagging
      }
    },
  },
  plugins: [],
};

export default config;