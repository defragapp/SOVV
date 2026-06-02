import type { Metadata } from "next";
import '../styles/globals.css';

export const metadata: Metadata = {
  title: "DEFRAG — The clarity layer for real life",
  description:
    "Personal and relational clarity for understanding yourself, reading the moment, and navigating relationships with less confusion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#05070B] text-white">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_24%),radial-gradient(circle_at_80%_10%,_rgba(168,85,247,0.14),_transparent_20%),linear-gradient(180deg,#05070B_0%,#0A1220_40%,#05070B_100%)] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}