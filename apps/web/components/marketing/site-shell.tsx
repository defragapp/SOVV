"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/product/defrag", label: "Defrag" },
  { href: "/product/covenant", label: "Covenant" },
  { href: "/product/alignment", label: "Alignment" },
  { href: "/pricing", label: "Pricing" },
];

const FOOTER_COLS = [
  {
    label: "Platform",
    links: [
      { href: "/product", label: "Product" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#08070a] text-[#f4efe9] font-sans">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 surface-glass border-b border-white/[0.06]">
        <div className="container-platform h-full flex items-center justify-between">
          <Link
            href="/"
            className="text-label text-[#f4efe9] hover:text-white transition-colors font-medium tracking-[0.18em]"
          >
            SOVEREIGN.OS
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-body-sm text-[#a8a29a] hover:text-[#f4efe9] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="https://app.defrag.app/app/login"
              className="hidden sm:block text-body-sm text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="https://app.defrag.app/app/login"
              className="btn-primary h-9 px-5 text-sm hidden sm:inline-flex"
            >
              Enter
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-[#a8a29a] hover:text-[#f4efe9] transition-colors p-2"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden surface-glass border-t border-white/[0.06] p-6 shadow-2xl">
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-body text-[#a8a29a] hover:text-[#f4efe9] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="https://app.defrag.app/app/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary justify-center mt-2"
              >
                Enter Sovereign.os
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#08070a] py-16">
        <div className="container-platform">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 justify-between">

            {/* Brand */}
            <div className="flex flex-col gap-3 max-w-xs">
              <span className="text-label text-[#f4efe9] tracking-[0.18em]">SOVEREIGN.OS</span>
              <p className="text-micro text-[#4f4b47] leading-relaxed">
                Defrag · Covenant · Alignment · Baseline Design · Library
              </p>
              <p className="text-micro text-[#4f4b47] leading-relaxed mt-2">
                Private by design. Not a replacement for therapy or professional support.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-12">
              {FOOTER_COLS.map((col) => (
                <div key={col.label} className="flex flex-col gap-3">
                  <span className="text-micro text-[#4f4b47] uppercase tracking-[0.15em] font-mono">{col.label}</span>
                  {col.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-micro text-[#76716b] hover:text-[#f4efe9] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-micro text-[#4f4b47]">© {new Date().getFullYear()} Sovereign.os</span>
            <span className="text-micro text-[#4f4b47]">info@defrag.app</span>
          </div>
        </div>
      </footer>
    </div>
  );
}