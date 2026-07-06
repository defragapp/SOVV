"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: "#08070a", color: "#f4efe9", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <div style={{ maxWidth: 400 }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(244,239,233,0.3)", marginBottom: "1.5rem" }}>
              Something went wrong
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 300, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
              An unexpected error occurred.
            </h1>
            <p style={{ color: "#a8a29a", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              The page encountered an error. Try refreshing, or return to the home page.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ padding: "0.625rem 1.25rem", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#f4efe9", cursor: "pointer", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                Try again
              </button>
              <Link
                href="/"
                style={{ padding: "0.625rem 1.25rem", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#f4efe9", textDecoration: "none", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
