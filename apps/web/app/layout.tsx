import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL("https://defrag.app"),
  title: {
    default: "Sovereign.os",
    template: "%s - Sovereign.os",
  },
  description: "A private workspace for baseline-aware pattern recognition, response practice, and saved context.",
  openGraph: {
    title: "Sovereign.os",
    description: "A private workspace for baseline-aware pattern recognition, response practice, and saved context.",
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
    <html lang="en" className="bg-background text-foreground antialiased selection:bg-white selection:text-black">
      <body className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <header className="p-6 border-b border-white/10">
          <span className="font-mono font-bold tracking-widest text-white">SOVEREIGN.OS</span>
        </header>
        {children}
      </body>
    </html>
  );
}
