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

          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -mr-2 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
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
      <footer className="border-t border-white/[0.04] py-12 mt-20 relative z-10 bg-[#060606]">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Sovereign.os. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
