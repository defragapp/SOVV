import "./globals.css";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";


const jetBrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-VariableFont.woff2",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://defrag.app"),
  title: {
    default: "Sovereign.os",
    template: "%s - Sovereign.os",
  },
  description: "Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries — then save what you learn before the moment disappears.",
  openGraph: {
    title: "Sovereign.os",
    description: "Your Baseline Design is the source. Sovereign.os is where the work becomes yours.",
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
  themeColor: "#020202",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`antialiased ${jetBrainsMono.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground bg-background text-foreground overscroll-none safe-top safe-bottom selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}
