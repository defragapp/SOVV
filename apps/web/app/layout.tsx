import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://defrag.app"),
  title: {
    default: "Sovereign.os",
    template: "%s - Sovereign.os",
  },
  description: "Your Baseline Design is the source. Sovereign.os is where the work becomes yours. Defrag and Covenant are spaces for relational intelligence and reflection.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased" style={{ background: "#05070B", color: "#F6F5F3" }}>
      <body className="min-h-screen overflow-x-hidden" style={{ background: "#05070B", color: "#F6F5F3" }}>
        {children}
      </body>
    </html>
  );
}
