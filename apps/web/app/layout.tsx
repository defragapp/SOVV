import type { Metadata } from "next";
import '../styles/globals.css';



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background text-foreground antialiased selection:bg-white selection:text-black">
      <body className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}