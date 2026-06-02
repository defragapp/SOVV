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
      <body className="min-h-screen bg-[linear-gradient(180deg,#05070B_0%,#080C12_40%,#05070B_100%)] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}