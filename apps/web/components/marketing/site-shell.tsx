"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UTMCapture } from "@/components/marketing/UTMCapture";

interface SiteShellProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/changelog", label: "Changelog" },
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
      { href: "/changelog", label: "Changelog" },
      { href: "/pattern-library", label: "Pattern library" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/principles", label: "Principles" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/contact", label: "Contact" },
      { href: "/launch", label: "Launch" },
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
      <Suspense fallback={null}>
        <UTMCapture />
      </Suspense>

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
            className="md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-2 w-9 h-9"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-5 bg-[#76716b] origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-px w-5 bg-[#76716b] origin-center"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-5 bg-[#76716b] origin-center"
            />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-white/[0.05] overflow-hidden"
              style={{ background: "rgba(8,7,10,0.97)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
            >
              <nav aria-label="Mobile navigation" className="flex flex-col px-6 py-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="block text-[15px] text-[#76716b] hover:text-[#f4efe9] transition-colors py-3.5 border-b border-white/[0.04] tracking-[-0.01em]"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: NAV_LINKS.length * 0.04 + 0.05, duration: 0.3 }}
                  className="mt-5"
                >
                  <Link
                    href="/app/login"
                    className="inline-flex items-center justify-center w-full h-11 px-6 text-[13px] bg-[#f4efe9] text-[#08070a] tracking-[-0.01em] hover:bg-white transition-colors duration-200"
                    style={{ borderRadius: 8 }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Get started
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
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
