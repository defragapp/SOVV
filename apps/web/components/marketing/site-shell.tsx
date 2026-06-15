"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
    <div className="min-h-[100dvh] flex flex-col bg-[#08070a] text-[#f4efe9] font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 surface-glass border-b border-white/[0.06]">
        <div className="container-platform h-full flex items-center justify-between">
          <Link
            href="/"
            className="text-label text-[#f4efe9] hover:text-white transition-colors font-medium"
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
              className="btn-primary py-2 px-5 text-sm hidden sm:inline-flex"
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

        {menuOpen && (
          <div className="md:hidden surface-glass border-t border-white/[0.06] p-6 shadow-2xl">
            <nav className="flex flex-col gap-6">
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
                className="btn-primary justify-center mt-4 py-3"
              >
                Enter Sovereign.os
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-white/[0.06] bg-[#08070a] py-16">
        <div className="container-platform flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#76716b]">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-label text-[#76716b]">SOVEREIGN.OS</span>
            <span className="text-micro text-[#4f4b47]">
              Defrag · Covenant · Baseline Design · Library
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-micro text-[#76716b] hover:text-[#f4efe9] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}