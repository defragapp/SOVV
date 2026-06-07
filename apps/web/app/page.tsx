"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { pricingTiers } from "../data/marketing";

// ── Fragment animation — Defrag visual metaphor ──────────────────────────
const FRAGMENT_CHARS = "01·—/\\|_░▒▓█▄▀■□▪▫◆◇○●".split("");
const GRID_COLS = 32;
const GRID_ROWS = 6;

function FragmentGrid({ resolved }: { resolved: boolean }) {
  const prefersReduced = useReducedMotion();
  const [chars, setChars] = useState<string[]>(() =>
    Array.from({ length: GRID_COLS * GRID_ROWS }, () =>
      FRAGMENT_CHARS[Math.floor(Math.random() * FRAGMENT_CHARS.length)]
    )
  );
  const [resolvedCells, setResolvedCells] = useState<boolean[]>(
    Array(GRID_COLS * GRID_ROWS).fill(false)
  );

  useEffect(() => {
    if (prefersReduced || !resolved) return;
    let i = 0;
    const total = GRID_COLS * GRID_ROWS;
    const interval = setInterval(() => {
      if (i >= total) { clearInterval(interval); return; }
      const batch = Math.min(8, total - i);
      setResolvedCells(prev => {
        const next = [...prev];
        for (let j = 0; j < batch; j++) next[i + j] = true;
        return next;
      });
      i += batch;
    }, 18);
    return () => clearInterval(interval);
  }, [resolved, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div
      className="select-none pointer-events-none overflow-hidden"
      style={{ fontFamily: "monospace", lineHeight: "1.4" }}
      aria-hidden="true"
    >
      {Array.from({ length: GRID_ROWS }, (_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: GRID_COLS }, (_, col) => {
            const idx = row * GRID_COLS + col;
            return (
              <span
                key={col}
                className="fragment-char"
                style={{
                  opacity: resolvedCells[idx] ? 0.35 : 0.08,
                  transition: `opacity ${0.3 + Math.random() * 0.4}s ease`,
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                }}
              >
                {chars[idx]}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const USE_CASES = [
  "Relationship", "Family", "Boundary", "Message",
  "Grief", "Parenting", "Team", "Repair",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LandingPage() {
  const [fragmentResolved, setFragmentResolved] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setFragmentResolved(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070B] text-[#F6F5F3]">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/8 glass safe-top">
        <div className="container-platform flex h-14 items-center justify-between">
          <Link href="/" className="text-label hover:text-[#F6F5F3]/60 transition-colors" aria-label="Sovereign.os">
            SOVEREIGN.OS
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/product" className="text-label hover:text-[#F6F5F3]/55 transition-colors">Product</Link>
            <Link href="/pricing" className="text-label hover:text-[#F6F5F3]/55 transition-colors">Pricing</Link>
            <Link href="/how-it-works" className="text-label hover:text-[#F6F5F3]/55 transition-colors">How it works</Link>
            <Link href="/covenant" className="text-label hover:text-[#F6F5F3]/55 transition-colors">Covenant</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="text-label text-[#F6F5F3]/30 hover:text-[#F6F5F3]/55 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" className="sovv-button py-2.5 px-5 text-[9px]">
              Enter Sovereign.os
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — full screen entry ────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />

        {/* Scan lines */}
        <div className="pointer-events-none absolute inset-0 scan-lines opacity-40" aria-hidden="true" />

        {/* Radial depth */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(246,245,243,0.03) 0%, transparent 70%)" }} />

        {/* Fragment grid — top */}
        <div className="absolute top-20 left-0 right-0 px-6 pt-6 opacity-60" aria-hidden="true">
          <FragmentGrid resolved={fragmentResolved} />
        </div>

        {/* Hero content */}
        <div className="container-platform relative z-10 pt-32 pb-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-8">
              <span className="meta-label">The Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-display mb-6"
              style={{ fontWeight: 300 }}
            >
              Healing isn't optional.
              <br />
              <span className="text-[#F6F5F3]/40">Holding the pain is.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-body max-w-2xl mb-4"
              style={{ fontSize: "1.0625rem" }}
            >
              Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries — then save what you learn before the moment disappears.
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={2.5}
              className="text-caption max-w-xl mb-12"
            >
              The pattern keeps moving until you see it. Your next response can change it.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-3 flex-wrap"
            >
              <Link href="https://app.defrag.app/app/login" className="sovv-button-primary py-4 px-8">
                Start Baseline Design
              </Link>
              <Link href="https://app.defrag.app/apps/defrag" className="sovv-button py-4 px-8">
                Enter Defrag space
              </Link>
              <Link href="/product" className="sovv-button-ghost py-4">
                See how it works →
              </Link>
            </motion.div>

            {/* Use case tags */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-12 flex flex-wrap gap-2"
            >
              {USE_CASES.map((uc) => (
                <span key={uc} className="space-badge">{uc}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fragment grid */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 opacity-40" aria-hidden="true">
          <FragmentGrid resolved={fragmentResolved} />
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-micro text-[#F6F5F3]/20"
          aria-hidden="true"
        >
          ↓
        </motion.div>
      </section>

      {/* ── Baseline Design ────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="meta-label">The Source</span>
              <h2 className="text-headline">Your Baseline Design<br />grounds everything.</h2>
              <p className="text-body">
                Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center. Every thread in Defrag and Covenant is grounded here. Private, never exposed in outputs.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Stored privately — never exposed in outputs",
                  "Shared across Defrag and Covenant",
                  "Used to keep every thread grounded",
                  "Set once. Works across all sessions.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-2 h-px w-4 bg-[#F6F5F3]/20 shrink-0" />
                    <span className="text-caption">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="https://app.defrag.app/settings" className="sovv-button inline-flex py-3 px-6 mt-2">
                Set Your Baseline Design
              </Link>
            </div>

            {/* Baseline Design visual — monochrome structural map */}
            <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
              <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
                <rect width="400" height="400" fill="none"/>
                {/* Outer frame */}
                <rect x="40" y="40" width="320" height="320" fill="none" stroke="#F6F5F3" strokeOpacity="0.08" strokeWidth="1"/>
                {/* Grid */}
                <line x1="40" y1="147" x2="360" y2="147" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                <line x1="40" y1="253" x2="360" y2="253" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                <line x1="147" y1="40" x2="147" y2="360" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                <line x1="253" y1="40" x2="253" y2="360" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                {/* Rings */}
                <circle cx="200" cy="200" r="120" fill="none" stroke="#F6F5F3" strokeOpacity="0.10" strokeWidth="1"/>
                <circle cx="200" cy="200" r="80" fill="none" stroke="#F6F5F3" strokeOpacity="0.07" strokeWidth="1"/>
                <circle cx="200" cy="200" r="40" fill="none" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                {/* Axes */}
                <line x1="200" y1="80" x2="200" y2="320" stroke="#F6F5F3" strokeOpacity="0.15" strokeWidth="1"/>
                <line x1="80" y1="200" x2="320" y2="200" stroke="#F6F5F3" strokeOpacity="0.15" strokeWidth="1"/>
                {/* Diagonals */}
                <line x1="115" y1="115" x2="285" y2="285" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                <line x1="285" y1="115" x2="115" y2="285" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                {/* Center — white dot */}
                <circle cx="200" cy="200" r="4" fill="#F6F5F3" fillOpacity="0.60"/>
                {/* Labels */}
                <text x="200" y="72" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.20" fontFamily="monospace">DOB</text>
                <text x="200" y="338" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.20" fontFamily="monospace">POB</text>
                <text x="68" y="204" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.20" fontFamily="monospace">TOB</text>
                {/* Corner marks */}
                <rect x="40" y="40" width="12" height="1" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="40" y="40" width="1" height="12" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="348" y="40" width="12" height="1" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="359" y="40" width="1" height="12" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="40" y="359" width="12" height="1" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="40" y="348" width="1" height="12" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="348" y="359" width="12" height="1" fill="#F6F5F3" fillOpacity="0.25"/>
                <rect x="359" y="348" width="1" height="12" fill="#F6F5F3" fillOpacity="0.25"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Spaces ─────────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform space-y-12">
          <div className="space-y-3">
            <span className="meta-label">The Spaces</span>
            <h2 className="text-headline max-w-xl">Two guided spaces.<br />One platform.</h2>
            <p className="text-body max-w-2xl">
              Defrag and Covenant share your Baseline Design, Library, auth, and subscription. They are not separate products — they are different lenses inside Sovereign.os.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Defrag */}
            <div className="border border-white/10 p-10 space-y-6 hover:border-white/18 transition-colors">
              <div className="space-y-2">
                <span className="space-badge-defrag">Defrag space</span>
                <h3 className="text-title mt-3">Relational intelligence.</h3>
              </div>
              <p className="text-body text-sm">
                Defrag helps you work through relational dynamics, family dynamics, boundaries, messages, grief, parenting, and team dynamics. Put the moment into context. See the pattern underneath. Find the next response that changes the pattern.
              </p>
              <div className="border-l border-white/15 pl-4">
                <p className="text-caption text-xs">Grounded in your Baseline Design. Saves to your Sovereign.os Library.</p>
              </div>
              <Link href="https://app.defrag.app/apps/defrag" className="sovv-button inline-flex py-3 px-6">
                Enter Defrag space
              </Link>
            </div>

            {/* Covenant */}
            <div className="border border-white/10 border-l-0 p-10 space-y-6 hover:border-white/18 transition-colors">
              <div className="space-y-2">
                <span className="space-badge-covenant">Covenant space</span>
                <h3 className="text-title mt-3">Faith-context reflection.</h3>
              </div>
              <p className="text-body text-sm">
                Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through. For users who want faith connected to repair — without becoming vague, performative, or certain where certainty does not belong.
              </p>
              <div className="border-l border-white/10 pl-4">
                <p className="text-caption text-xs">Optional. User-initiated. Uses the same Baseline Design as Defrag.</p>
              </div>
              <Link href="/covenant" className="sovv-button inline-flex py-3 px-6">
                Learn about Covenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform space-y-12">
          <div className="space-y-3">
            <span className="meta-label">The Flow</span>
            <h2 className="text-headline">What repeats matters more<br />than what happened.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {[
              { num: "01", title: "Set Baseline Design", body: "Enter your date, time, and place of birth. This becomes the private source that grounds every thread." },
              { num: "02", title: "Work through the moment", body: "Put the moment into context. Defrag helps surface the pattern underneath — the loop, the dynamic, the next response." },
              { num: "03", title: "Find the response", body: "See the Best Next Response. Practice it. Understand what changes when you use it." },
              { num: "04", title: "Save to Sovereign", body: "Save what you learn to your Sovereign.os Library. The AI uses it to keep future threads grounded." },
            ].map((step, i) => (
              <div key={step.num} className={`border border-white/8 p-8 space-y-4 ${i > 0 ? "border-l-0" : ""}`}>
                <span className="text-micro">{step.num}</span>
                <h3 className="text-sm font-light text-[#F6F5F3]/75 leading-snug">{step.title}</h3>
                <p className="text-caption text-xs leading-6">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Library ────────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="meta-label">The Library</span>
              <h2 className="text-headline">Your Library keeps what you learn,<br />not just what you asked.</h2>
              <p className="text-body">
                Defrag results, Covenant Briefs, Best Next Responses, and saved patterns all live in your Sovereign.os Library — private, organized, and used by the AI to keep future threads grounded.
              </p>
              <div className="space-y-2 pt-2">
                {["Defrag results", "Covenant Briefs", "Best Next Responses", "Saved patterns", "Watch It outputs", "Private notes"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-px w-3 bg-[#F6F5F3]/18 shrink-0" />
                    <span className="text-caption text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Library preview panel */}
            <div className="sovv-panel p-8 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label">Sovereign.os Library</span>
                <span className="text-micro">Private</span>
              </div>
              {[
                { space: "Defrag", label: "Relational thread — boundary repair", date: "Jun 6" },
                { space: "Defrag", label: "Family dynamic — recurring loop", date: "Jun 4" },
                { space: "Covenant", label: "Covenant Brief — discernment", date: "Jun 2" },
                { space: "Defrag", label: "Message review — before sending", date: "May 30" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={item.space === "Covenant" ? "space-badge-covenant" : "space-badge-defrag"}>
                      {item.space}
                    </span>
                    <span className="text-caption text-xs">{item.label}</span>
                  </div>
                  <span className="text-micro shrink-0 ml-4">{item.date}</span>
                </div>
              ))}
              <div className="pt-2">
                <span className="text-micro">Invite Privately · Public Preview · Watch Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform space-y-12">
          <div className="space-y-3">
            <span className="meta-label">Access</span>
            <h2 className="text-headline">Simple. No surprises.</h2>
            <p className="text-body max-w-xl">
              One subscription. Both spaces. Your Baseline Design, Library, and history — shared across Defrag and Covenant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`border border-white/10 p-10 flex flex-col space-y-6 ${
                  tier.highlight ? "border-white/22" : ""
                } ${i === 1 ? "md:border-l-0" : ""}`}
              >
                {tier.highlight && (
                  <div className="self-start font-mono text-[9px] uppercase tracking-widest text-[#05070B] bg-[#F6F5F3] px-2.5 py-1">
                    Recommended
                  </div>
                )}
                <div>
                  <p className="text-micro mb-4">{tier.name}</p>
                  <div className="text-5xl font-light tracking-tight">
                    {tier.price}
                    <span className="text-sm text-[#F6F5F3]/28 font-normal ml-2">{tier.period}</span>
                  </div>
                </div>
                <p className="text-caption">{tier.description}</p>
                <ul className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-xs text-[#F6F5F3]/40">
                      <span className="block h-px w-4 bg-[#F6F5F3]/15 shrink-0 mt-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                    tier.highlight
                      ? "bg-[#F6F5F3] text-[#05070B] hover:bg-[#F6F5F3]/88"
                      : "border border-white/15 text-[#F6F5F3]/65 hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform text-center space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="meta-label mx-auto">Start here</span>
            <h2 className="text-headline">Your Baseline Design<br />is the source.</h2>
            <p className="text-body">
              Sovereign.os is where the work becomes yours. Set your Baseline Design. Work through what is active. Save what changes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="sovv-button-primary py-4 px-10">
              Start Baseline Design
            </Link>
            <Link href="https://app.defrag.app/apps/defrag" className="sovv-button py-4 px-10">
              Enter Defrag space
            </Link>
          </div>
          <p className="text-micro">Free tier · No credit card required · 5 sessions/day</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10">
        <div className="container-platform flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-label">Sovereign.os</p>
            <p className="text-micro">Defrag · Covenant · Baseline Design · Library</p>
          </div>
          <div className="flex flex-wrap gap-5">
            {[
              { href: "/about", label: "About" },
              { href: "/product", label: "Product" },
              { href: "/pricing", label: "Pricing" },
              { href: "/covenant", label: "Covenant" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="text-label hover:text-[#F6F5F3]/55 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}