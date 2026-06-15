import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { Fraunces } from "next/font/google";

import "./globals.css";

const jetBrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-VariableFont.woff2",
  variable: "--font-jetbrains-mono",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://defrag.app"),
  title: {
    default: "Sovereign.os",
    template: "%s - Sovereign.os",
  },
  description:
    "Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries — then save what you learn before the moment disappears.",
  openGraph: {
    title: "Sovereign.os",
    description:
      "Your Baseline Design is the source. Sovereign.os is where the work becomes yours.",
    images: ["/social-card.png", "/social-card.svg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-card.png", "/social-card.svg"],
  },
  icons: {
    icon: ["/favicon.ico", "/favicon.png", "/brand-mark.svg"],
    apple: ["/apple-touch-icon.png", "/brand-mark.svg"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08070a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`antialiased ${jetBrainsMono.variable} ${GeistSans.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen overflow-x-hidden bg-[#08070a] text-[#f4efe9] overscroll-none selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}