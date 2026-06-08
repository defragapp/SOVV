import type { Metadata } from "next";
import "./globals.css";

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
    images: ["/social-card.svg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-card.svg"],
  },
  icons: {
    icon: "/brand-mark.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" style={{ background: "#000000", color: "#EDEDED" }}>
      <body className="min-h-screen overflow-x-hidden" style={{ background: "#000000", color: "#EDEDED" }}>
        {children}
      </body>
    </html>
  );
}