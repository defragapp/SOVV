"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { pricingTiers } from "../data/marketing";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const USE_CASES = [
  "Relational dynamics",
  "Family patterns",
  "Boundaries",
  "Messages you haven't sent",
  "Grief",
  "Parenting",
  "Team dynamics",
  "Repair",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070B] text-[#F6F5F3]">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/8 glass">
        <div className="container-platform flex h-14 items-center justify-between">
          <Link href="/" className="text-label hover:text-[#F6F5F3]/70 transition-colors" aria-label="Sovereign.os">
            SOVEREIGN.OS
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/product" className="text-label hover:text-[#F6F5F3]/60 transition-colors">Product</Link>
            <Link href="/pricing" className="text-label hover:text-[#F6F5F3]/60 transition-colors">Pricing</Link>
            <Link href="/covenant" className="text-label hover:text-[#F6F5F3]/60 transition-colors">Covenant</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="text-label text-[#F6F5F3]/35 hover:text-[#F6F5F3]/60 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" className="sovv-button py-2.5 px-5 text-[9px]">
              Enter Sovereign.os
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">

        {/* Structural grid overlay */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(246,245,243,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(246,245,243,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }} />
          {/* Amber focal glow — active pattern */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(200,146,42,0.06) 0%, transparent 70%)" }} />
        </div>

        <div className="container-platform relative">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="meta-label">The Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-display mb-6"
            >
              Healing isn't optional.<br />
              <span className="text-[#F6F5F3]/50">Holding the pain is.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-body max-w-2xl mb-4 text-[17px]"
            >
              Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries — then save what you learn before the moment disappears.
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={2.5}
              className="text-caption max-w-xl mb-10"
            >
              The pattern keeps moving until you see it. Your next response can change it.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-3"
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
          </motion.div>

          {/* Use case tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 flex flex-wrap gap-2"
          >
            {USE_CASES.map((uc) => (
              <span key={uc} className="space-badge">{uc}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Baseline Design ────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="meta-label">The Source</span>
              <h2 className="text-headline">Your Baseline Design<br />grounds everything.</h2>
              <p className="text-body">
                Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center. Every thread in Defrag and Covenant is grounded here. It is private, never exposed in outputs, and shared across all spaces.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Stored privately — never exposed in outputs",
                  "Shared across Defrag and Covenant",
                  "Used to keep every thread grounded",
                  "Set once. Works across all sessions.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-2 h-px w-4 bg-[#C8922A]/60 shrink-0" />
                    <span className="text-caption">{point}</span>
                  </div>
                ))}
              </div>
              <Link href="https://app.defrag.app/settings" className="sovv-button-amber inline-flex py-3 px-6 mt-2">
                Set Your Baseline Design
              </Link>
            </div>

            {/* Visual — Baseline Design structure */}
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
                <circle cx="200" cy="200" r="120" fill="none" stroke="#F6F5F3" strokeOpacity="0.12" strokeWidth="1"/>
                <circle cx="200" cy="200" r="80" fill="none" stroke="#F6F5F3" strokeOpacity="0.08" strokeWidth="1"/>
                <circle cx="200" cy="200" r="40" fill="none" stroke="#F6F5F3" strokeOpacity="0.06" strokeWidth="1"/>
                {/* Axes */}
                <line x1="200" y1="80" x2="200" y2="320" stroke="#F6F5F3" strokeOpacity="0.18" strokeWidth="1"/>
                <line x1="80" y1="200" x2="320" y2="200" stroke="#F6F5F3" strokeOpacity="0.18" strokeWidth="1"/>
                {/* Diagonals */}
                <line x1="115" y1="115" x2="285" y2="285" stroke="#F6F5F3" strokeOpacity="0.06" strokeWidth="1"/>
                <line x1="285" y1="115" x2="115" y2="285" stroke="#F6F5F3" strokeOpacity="0.06" strokeWidth="1"/>
                {/* Center — amber */}
                <circle cx="200" cy="200" r="5" fill="#C8922A" fillOpacity="0.85"/>
                {/* Labels */}
                <text x="200" y="72" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.25" fontFamily="monospace">DOB</text>
                <text x="200" y="338" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.25" fontFamily="monospace">POB</text>
                <text x="68" y="204" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.25" fontFamily="monospace">TOB</text>
              </svg>
              {/* Amber glow */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(circle at 50% 50%, rgba(200,146,42,0.06) 0%, transparent 60%)"
              }} />
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
            <div className="border border-white/10 p-10 space-y-6 hover:border-white/18 transition-colors group">
              <div className="space-y-2">
                <span className="space-badge-amber">Defrag space</span>
                <h3 className="text-title mt-3">Relational intelligence.</h3>
              </div>
              <p className="text-body text-sm">
                Defrag helps you work through relational dynamics, family dynamics, boundaries, messages, grief, parenting, and team dynamics. Put the moment into context. See the pattern underneath. Find the next response that changes the pattern.
              </p>
              <div className="pt-2 space-y-2">
                <div className="accent-amber">
                  <p className="text-caption text-xs">Grounded in your Baseline Design. Saves to your Sovereign.os Library.</p>
                </div>
              </div>
              <Link href="https://app.defrag.app/apps/defrag" className="sovv-button-amber inline-flex py-3 px-6">
                Enter Defrag space
              </Link>
            </div>

            {/* Covenant */}
            <div className="border border-white/10 border-l-0 p-10 space-y-6 hover:border-white/18 transition-colors group">
              <div className="space-y-2">
                <span className="space-badge-oxblood">Covenant space</span>
                <h3 className="text-title mt-3">Faith-context reflection.</h3>
              </div>
              <p className="text-body text-sm">
                Covenant helps you bring faith, reflection, and grounded discernment into what you are walking through. For users who want their inner work, relationships, and faith to stay connected — without becoming performative or vague. Saves Covenant Briefs to your Sovereign.os Library.
              </p>
              <div className="pt-2 space-y-2">
                <div className="accent-oxblood">
                  <p className="text-caption text-xs">Optional. User-initiated. Uses the same Baseline Design as Defrag.</p>
                </div>
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
            <h2 className="text-headline">From moment to clarity.</h2>
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
                <h3 className="text-sm font-light text-[#F6F5F3]/80 leading-snug">{step.title}</h3>
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
              <h2 className="text-headline">Save what you learn.</h2>
              <p className="text-body">
                Your Sovereign.os Library is the shared save layer across all spaces. Defrag results, Covenant Briefs, Best Next Responses, and saved patterns all live here — private, organized, and used by the AI to keep future threads grounded.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  "Defrag results",
                  "Covenant Briefs",
                  "Best Next Responses",
                  "Saved patterns",
                  "Watch It outputs",
                  "Private notes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="h-px w-3 bg-[#F6F5F3]/20 shrink-0" />
                    <span className="text-caption text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Library visual */}
            <div className="border border-white/8 p-8 space-y-3">
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
                    <span className={item.space === "Covenant" ? "space-badge-oxblood" : "space-badge-amber"}>
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
                  tier.highlight ? "border-[#B8960C]/30 shadow-[0_0_60px_rgba(184,150,12,0.04)]" : ""
                } ${i === 1 ? "md:border-l-0" : ""}`}
              >
                {tier.highlight && (
                  <div className="self-start font-mono text-[9px] uppercase tracking-widest text-[#05070B] bg-[#B8960C] px-2.5 py-1">
                    Recommended
                  </div>
                )}
                <div>
                  <p className="text-micro mb-4">{tier.name}</p>
                  <div className="text-5xl font-light tracking-tight">
                    {tier.price}
                    <span className="text-sm text-[#F6F5F3]/30 font-normal ml-2">{tier.period}</span>
                  </div>
                </div>
                <p className="text-caption">{tier.description}</p>
                <ul className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-xs text-[#F6F5F3]/45">
                      <span className="block h-px w-4 bg-[#F6F5F3]/18 shrink-0 mt-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                    tier.highlight
                      ? "bg-[#B8960C] text-[#05070B] hover:bg-[#C8A020]"
                      : "border border-white/18 text-[#F6F5F3]/70 hover:bg-white/5"
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
              <Link key={item.href} href={item.href} className="text-label hover:text-[#F6F5F3]/60 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}