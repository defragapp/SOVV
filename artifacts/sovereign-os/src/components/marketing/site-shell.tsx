import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { animate, motion, AnimatePresence } from "framer-motion";

interface SiteShellProps {
  children: React.ReactNode;
  /**
   * When true, the nav header starts invisible and waits for the
   * `sovereign:nav-reveal` custom event before animating in.
   * Pass only from HomePage to coordinate with the cinematic entrance.
   */
  entranceControlled?: boolean;
}

const NAV_LINKS = [
  { href: "/product",      label: "Product"      },
  { href: "/how-it-works", label: "How it works"  },
  { href: "/pricing",      label: "Pricing"       },
  { href: "/about",        label: "About"         },
];

const FOOTER_COLS = [
  {
    label: "Platform",
    links: [
      { href: "/product",      label: "Product"      },
      { href: "/how-it-works", label: "How it works"  },
      { href: "/pricing",      label: "Pricing"       },
      { href: "/about",        label: "About"         },
      { href: "/faq",          label: "FAQ"           },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/principles", label: "Principles" },
      { href: "/use-cases",  label: "Use cases"  },
      { href: "/contact",    label: "Contact"    },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms",   label: "Terms"   },
    ],
  },
];

const HEADER_H = 60; // px — tighter, more iOS-like

export function SiteShell({ children, entranceControlled = false }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // ── Nav entrance (coordinated with hero) ───────────────────────────────────
  useEffect(() => {
    const header = headerRef.current;
    if (!header || !entranceControlled) return;

    const alreadyPlayed = !!sessionStorage.getItem("sovereign:entrance-played");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (alreadyPlayed || reducedMotion) {
      header.style.opacity   = "1";
      header.style.transform = "translateY(0)";
      return;
    }

    header.style.opacity   = "0";
    header.style.transform = "translateY(-16px)";

    const onReveal = (e: Event) => {
      const instant = (e as CustomEvent<{ instant?: boolean }>).detail?.instant;
      animate(
        header,
        { opacity: 1, y: 0 },
        { duration: instant ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] },
      );
    };

    window.addEventListener("sovereign:nav-reveal", onReveal, { once: true });
    return () => window.removeEventListener("sovereign:nav-reveal", onReveal);
  }, [entranceControlled]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#08070a] text-[#f4efe9]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 select-none"
        style={{
          background:           scrolled ? "rgba(8,7,10,0.88)" : "transparent",
          backdropFilter:       scrolled ? "blur(20px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom:         scrolled ? "1px solid rgba(255,255,255,0.055)" : "1px solid transparent",
          transition:           "background 400ms ease, border-color 400ms ease",
          paddingTop:           "env(safe-area-inset-top)",
        }}
      >
        <div
          className="mx-auto max-w-[1280px] px-6 md:px-8 flex items-center justify-between"
          style={{ height: HEADER_H }}
        >
          {/* Wordmark */}
          <Link href="/" className="group flex items-center" aria-label="Sovereign.os — Home">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#f4efe9]/70 group-hover:text-[#f4efe9] transition-colors duration-200">
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
              className="text-[13px] text-[#76716b] hover:text-[#f4efe9] transition-colors duration-200 tracking-[-0.01em]"
            >
              Sign in
            </Link>
            <Link
              href="/app/login"
              className="inline-flex items-center h-8 px-5 font-mono text-[10px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-85"
              style={{ background: '#f4efe9', color: '#08070a', borderRadius: 100 }}
            >
              Get started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2 -mr-2 group"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {/* top bar: rotate 45° and drop 6px (gap 5px + 1px line) to meet center */}
            <span
              className="block h-px bg-[#76716b] group-hover:bg-[#f4efe9] origin-center"
              style={{
                width: 20,
                transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
                transition: "transform 220ms cubic-bezier(0.16,1,0.3,1), background-color 200ms ease",
              }}
            />
            {/* middle bar: fade out */}
            <span
              className="block h-px bg-[#76716b]"
              style={{
                width: 20,
                opacity: menuOpen ? 0 : 1,
                transition: "opacity 150ms ease",
              }}
            />
            {/* bottom bar: rotate -45° and rise 6px */}
            <span
              className="block h-px bg-[#76716b] group-hover:bg-[#f4efe9] origin-center"
              style={{
                width: 20,
                transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
                transition: "transform 220ms cubic-bezier(0.16,1,0.3,1), background-color 200ms ease",
              }}
            />
          </button>
        </div>

        {/* Mobile drawer — animated */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden px-6 pb-6 pt-2"
              style={{
                background: "rgba(8,7,10,0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
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
                  className="mt-5 inline-flex items-center justify-center h-11 px-6 font-mono text-[10px] uppercase tracking-[0.14em] font-semibold bg-[#f4efe9] text-[#08070a]"
                  style={{ borderRadius: 100 }}
                  onClick={() => setMenuOpen(false)}
                >
                  Get started
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <div className="flex-1 relative z-10">
        {children}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer role="contentinfo" className="relative z-10 bg-[#08070a]" style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
        <div className="mx-auto max-w-[1280px] px-6 md:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">

            {/* Brand */}
            <div className="flex flex-col gap-3 max-w-[220px]">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f4efe9]/70">
                Sovereign.os
              </span>
              <p className="text-[13px] text-[#4f4b47] leading-relaxed">
                See the loop. Name the pattern. Choose the repair.
              </p>
              <p className="text-[11px] text-[#4f4b47]/50 leading-relaxed mt-1">
                Not a replacement for therapy or professional support.
              </p>
            </div>

            {/* Nav columns */}
            <div className="flex flex-wrap gap-x-14 gap-y-8">
              {FOOTER_COLS.map((col) => (
                <div key={col.label} className="flex flex-col gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#4f4b47] mb-1">
                    {col.label}
                  </p>
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

          <div
            className="mt-12 pt-6 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[12px] text-[#4f4b47]">
              © {new Date().getFullYear()} Sovereign.os
            </p>
            <Link
              href="/app/login"
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] hover:text-[#a8a29a] transition-colors duration-200"
            >
              Enter the app
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
