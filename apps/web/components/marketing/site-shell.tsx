"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.05]" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(8,7,10,0.88)" }}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-white/[0.06] border border-white/[0.10] flex items-center justify-center transition-colors group-hover:bg-white/[0.10]">
              <div className="w-3 h-3 bg-[#0a0a0b] rounded-full" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#f4efe9]">
              Sovereign.os
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { href: "/product", label: "Product" },
              { href: "/how-it-works", label: "How it works" },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#76716b] hover:text-[#f4efe9] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app/login"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4efe9]/80 hover:text-[#f4efe9] transition-colors duration-200 border border-white/[0.10] px-4 py-2 hover:border-white/[0.20]"
              style={{ borderRadius: "var(--radius-button)" }}
            >
              Sign in
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-6 md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -mr-2 text-[#76716b] hover:text-[#f4efe9] focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden surface-glass border-t border-white/[0.06] p-6 shadow-2xl">
            <nav className="flex flex-col gap-5">
              <Link
                href="/about"
                className="text-lg text-gray-300 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Method
              </Link>
              <Link
                href="/pricing"
                className="text-lg text-gray-300 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/app/login"
                className="text-lg text-white font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/app/login"
                className="btn-primary text-center mt-2"
                onClick={() => setMenuOpen(false)}
              >
                Initialize
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-16 mt-20 relative z-10 bg-[#08070a]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f4efe9]/60">Sovereign.os</span>
              <p className="font-mono text-[9px] text-[#4f4b47] tracking-[0.12em]">See the loop. Name the pattern. Choose the repair.</p>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { href: "/product", label: "Product" },
                { href: "/how-it-works", label: "How it works" },
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/faq", label: "FAQ" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Copyright */}
            <p className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em]">
              © {new Date().getFullYear()} Sovereign.os
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
