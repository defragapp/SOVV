"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { navItems, footerItems } from "@/data/marketing";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b border-white/8 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.3em] text-white/80 hover:text-white transition-colors"
          >
            DEFRAG
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="https://app.defrag.app/login"
              className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="https://app.defrag.app/login"
              className="border border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden font-mono text-[10px] uppercase tracking-widest text-white/40"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/8 bg-[#05070B] md:hidden"
            >
              <nav className="flex flex-col px-6 py-6 gap-5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="https://app.defrag.app/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 border border-white/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white text-center hover:bg-white/5 transition-colors"
                >
                  Get Started
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-[65px]">{children}</main>

      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25">
            Sovereign.os / DEFRAG
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {footerItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-[10px] uppercase tracking-widest text-white/35 hover:text-white/70 transition-colors"
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
