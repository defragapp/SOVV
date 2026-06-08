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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── iOS-style Navbar ─────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: "64px", background: "rgba(2, 2, 2, 0.6)", backdropFilter: "blur(24px) saturate(150%)", WebkitBackdropFilter: "blur(24px) saturate(150%)", borderBottom: "1px solid var(--border-light)"
      }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 2rem", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <Link href="/" style={{ fontFamily: "JetBrains Mono, Cascadia Code, ui-monospace, Menlo, monospace", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#EDEDED", textDecoration: "none", fontWeight: 500 }}>
            SOVEREIGN.OS
          </Link>

          {/* Desktop nav — centered */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="hidden md:flex">
            {NAV_LINKS.map(item => (
              <Link key={item.href} href={item.href} style={{ fontSize: "0.875rem", color: "#A1A1AA", textDecoration: "none", transition: "color 150ms" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#EDEDED")}
                onMouseLeave={e => (e.currentTarget.style.color = "#A1A1AA")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="https://app.defrag.app/app/login" className="hidden sm:block" style={{ fontSize: "0.875rem", color: "#71717A", textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" style={{
              background: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF",
              borderRadius: "8px", padding: "0.5rem 1.125rem",
              fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", display: "inline-block",
            }}>
              Enter
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#A1A1AA", fontSize: "0.875rem", padding: "0.25rem" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 2rem 2rem" }} className="md:hidden">
            <nav style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {NAV_LINKS.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ fontSize: "1rem", color: "#A1A1AA", textDecoration: "none" }}>
                  {item.label}
                </Link>
              ))}
              <Link href="https://app.defrag.app/app/login" onClick={() => setMenuOpen(false)} style={{
                background: "#FFFFFF", color: "#000000", borderRadius: "8px",
                padding: "0.875rem 1.5rem", fontSize: "0.9375rem", fontWeight: 500,
                textDecoration: "none", display: "block", textAlign: "center", marginTop: "0.5rem",
              }}>
                Enter Sovereign.os
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, paddingTop: "64px" }}>
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "72rem", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
          <div>
            <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#52525B", marginBottom: "0.375rem" }}>Sovereign.os</p>
            <p style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.5625rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#3F3F46" }}>Defrag · Covenant · Baseline Design · Library</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {FOOTER_LINKS.map(item => (
              <Link key={item.href} href={item.href} style={{ fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace", fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#52525B", textDecoration: "none" }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}