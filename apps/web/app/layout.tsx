import "../styles/globals.css";

export const metadata = {
  title: "sovereign.os",
  description: "Clear insight. One better next step."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
