// apps/web/app/layout.tsx

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkBaseline() {
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "self",
            query: "baseline_check",
          }),
        });

        const json = await res.json();

        if (json?.type === "needs_baseline") {
          if (pathname !== "/baseline") {
            router.replace("/baseline");
          }
        }
      } catch {
        // fail silently — do not block UI on network errors
      }
    }

    checkBaseline();
  }, [pathname, router]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
