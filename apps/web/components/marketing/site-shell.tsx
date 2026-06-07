"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/covenant", label: "Covenant" },
];

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/covenant", label: "Covenant" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#05070B", color: "#F6F5F3", display: "flex", flexDirection: "column" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid rgba(246,245,243,0.10)",
        background: "rgba(5,7,11,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem", display: "flex", height: "60px", alignItems: "center", justifyContent: "space-between" }}>

          {/* Brand */}
          <Link href="/" style={{
            fontFamily: "'JetBrains Mono', 'Cascadia Code', ui-monospace, Menlo, monospace",
            fontSize: "0.6875rem", letterSpacing: "0.25em", textTransform: "uppercase",
            color: "rgba(246,245,243,0.90)", textDecoration: "none", fontWeight: 500,
          }}>
            SOVEREIGN.OS
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }} className="hidden md:flex">
            {NAV_LINKS.map(item => (
              <Link key={item.href} href={item.href} style={{
                fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.45)", textDecoration: "none",
                transition: "color 150ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(246,245,243,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(246,245,243,0.45)")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="https://app.defrag.app/app/login" className="hidden sm:block" style={{
              fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
              fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(246,245,243,0.40)", textDecoration: "none",
            }}>
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" style={{
              fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
              fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase",
              background: "#F6F5F3", color: "#05070B", border: "1px solid #F6F5F3",
              padding: "0.625rem 1.25rem", textDecoration: "none", fontWeight: 500,
              display: "inline-block",
            }}>
              Enter
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(246,245,243,0.50)", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid rgba(246,245,243,0.10)", background: "#05070B", padding: "1.5rem 2rem 2rem" }} className="md:hidden">
            <nav style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {NAV_LINKS.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                  fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "rgba(246,245,243,0.55)", textDecoration: "none",
                }}>
                  {item.label}
                </Link>
              ))}
              <Link href="https://app.defrag.app/app/login" onClick={() => setMenuOpen(false)} style={{
                fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase",
                background: "#F6F5F3", color: "#05070B", padding: "0.875rem 1.5rem",
                textDecoration: "none", fontWeight: 500, display: "block", textAlign: "center", marginTop: "0.5rem",
              }}>
                Enter Sovereign.os
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, paddingTop: "60px" }}>
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(246,245,243,0.10)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,245,243,0.40)", marginBottom: "0.375rem" }}>
              Sovereign.os
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "0.625rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(246,245,243,0.22)" }}>
              Defrag · Covenant · Baseline Design · Library
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {FOOTER_LINKS.map(item => (
              <Link key={item.href} href={item.href} style={{
                fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase",
                color: "rgba(246,245,243,0.35)", textDecoration: "none",
              }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}