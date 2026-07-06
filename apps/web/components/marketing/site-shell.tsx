"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SiteShellProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

const FOOTER_COLS = [
  {
    label: "Platform",
    links: [
      { href: "/product", label: "Product" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/principles", label: "Principles" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteShell({ children }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#08070a] text-[#f4efe9]">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(8,7,10,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 h-[68px] flex items-center justify-between">

          {/* Wordmark */}
          <Link href="/" className="group flex items-center" aria-label="Sovereign.os — Home">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#f4efe9]/60 group-hover:text-[#f4efe9]/90 transition-colors duration-300">
              Sovereign.os
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-[#76716b] hover:text-[#f4efe9] transition-colors duration-200 tracking-[-0.01em]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/app/login"
              className="text-[13px] text-[#a8a29a] hover:text-[#f4efe9] transition-colors duration-200 tracking-[-0.01em]"
            >
              Sign in
            </Link>
            <Link
              href="/app/login"
              className="inline-flex items-center h-9 px-5 text-[12px] tracking-[-0.01em] bg-[#f4efe9] text-[#08070a] hover:bg-white transition-colors duration-200"
              style={{ borderRadius: 8 }}
            >
              Enter
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2 -mr-2 group"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`block h-px w-5 bg-[#76716b] group-hover:bg-[#f4efe9] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-px w-5 bg-[#76716b] group-hover:bg-[#f4efe9] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-[#76716b] group-hover:bg-[#f4efe9] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-white/[0.05] px-6 py-6"
            style={{ background: "rgba(8,7,10,0.96)", backdropFilter: "blur(20px)" }}
          >
            <nav aria-label="Mobile navigation" className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[15px] text-[#76716b] hover:text-[#f4efe9] transition-colors py-3.5 border-b border-white/[0.04] tracking-[-0.01em]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/app/login"
                className="mt-5 inline-flex items-center justify-center h-11 px-6 text-[13px] bg-[#f4efe9] text-[#08070a] tracking-[-0.01em]"
                style={{ borderRadius: 8 }}
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Content — no pt-16 spacer; hero pages use -mt-[68px] */}
      <div className="flex-1 relative z-10">
        {children}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer role="contentinfo" className="border-t border-white/[0.05] py-16 relative z-10 bg-[#08070a]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f4efe9]/50">Sovereign.os</span>
              <p className="text-[13px] text-[#4f4b47] leading-relaxed max-w-[220px]">
                Pattern-aware AI for the moments that matter.
              </p>
              <p className="text-[11px] text-[#4f4b47]/60 leading-relaxed max-w-[220px] mt-1">
                Not a replacement for therapy or professional support.
              </p>
            </div>

            {/* Nav columns */}
            <div className="flex flex-wrap gap-x-16 gap-y-8">
              {FOOTER_COLS.map((col) => (
                <div key={col.label} className="flex flex-col gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1">{col.label}</p>
                  {col.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[13px] text-[#4f4b47] hover:text-[#a8a29a] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-[12px] text-[#4f4b47]">© {new Date().getFullYear()} Sovereign.os</p>
            <Link href="/app/login" className="text-[12px] text-[#4f4b47] hover:text-[#a8a29a] transition-colors duration-200">
              Enter →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
