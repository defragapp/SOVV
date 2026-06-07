"use client";

import Link from "next/link";
import { pricingTiers } from "../data/marketing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
          Sovereign.os
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/product"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors hidden sm:block"
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors hidden sm:block"
          >
            Pricing
          </Link>
          <Link
            href="https://app.defrag.app/app/login"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="https://app.defrag.app/app/login"
            className="sovv-button"
          >
            Enter Sovereign.os
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="py-32 md:py-40 max-w-4xl mx-auto text-center space-y-8">
          <span className="meta-label mx-auto">The Platform</span>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.05]">
            Your Baseline Design<br className="hidden md:block" /> is the source.
          </h1>
          <p className="text-lg md:text-xl text-white/45 font-light leading-relaxed max-w-2xl mx-auto">
            Sovereign.os is where the work becomes yours. Bring the moment here. Understand what is active. Work through the pattern. Save what changes.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="https://app.defrag.app/app/login"
              className="sovv-button-primary py-4 px-10 text-sm"
            >
              Start Baseline Design
            </Link>
            <Link
              href="/product"
              className="sovv-button py-4 px-10 text-sm"
            >
              See how it works
            </Link>
          </div>
        </section>

        {/* ── Spaces ─────────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-white/8 space-y-12">
          <div className="text-center space-y-3">
            <span className="meta-label mx-auto">The Spaces</span>
            <h2 className="text-3xl font-light tracking-tight">Two guided spaces. One platform.</h2>
            <p className="text-sm text-white/35 max-w-xl mx-auto leading-7">
              Defrag and Covenant are spaces inside Sovereign.os. They share your Baseline Design, Library, auth, and subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-4xl mx-auto">
            {/* Defrag */}
            <div className="border border-white/10 p-10 space-y-6 hover:border-white/20 transition-colors">
              <div className="space-y-1">
                <span className="space-badge">Defrag space</span>
                <h3 className="text-2xl font-light mt-3">Relational intelligence.</h3>
              </div>
              <p className="text-sm text-white/45 leading-7">
                Defrag helps you understand what is active in the moment. Bring a message, a conversation, a family dynamic, a boundary, a grief, or a team situation. Defrag helps surface the pattern underneath and find the response that gives the moment a better chance.
              </p>
              <p className="text-xs text-white/25 font-mono uppercase tracking-widest">
                Relational · Family · Boundaries · Messages · Grief · Teams
              </p>
              <Link
                href="https://app.defrag.app/apps/defrag"
                className="sovv-button inline-block"
              >
                Enter Defrag space
              </Link>
            </div>

            {/* Covenant */}
            <div className="border border-white/10 border-l-0 p-10 space-y-6 hover:border-white/20 transition-colors">
              <div className="space-y-1">
                <span className="space-badge">Covenant space</span>
                <h3 className="text-2xl font-light mt-3">Faith-context reflection.</h3>
              </div>
              <p className="text-sm text-white/45 leading-7">
                Covenant is an optional reflection space inside Sovereign.os. For users who want to explore a moment through a faith-based lens — plain language, grounded, and private by design. Uses the same Baseline Design and Library as Defrag.
              </p>
              <p className="text-xs text-white/25 font-mono uppercase tracking-widest">
                Optional · User-initiated · Saves to Sovereign.os Library
              </p>
              <Link
                href="/covenant"
                className="sovv-button inline-block"
              >
                Learn about Covenant
              </Link>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <section className="py-24 border-t border-white/8 space-y-12">
          <div className="text-center space-y-3">
            <span className="meta-label mx-auto">The Source</span>
            <h2 className="text-3xl font-light tracking-tight">Your Baseline Design grounds everything.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-5xl mx-auto">
            {[
              {
                num: "01",
                title: "Start Your Baseline Design",
                body: "Enter your date, time, and place of birth. This becomes the starting map — how you tend to process, respond, connect, protect, communicate, and return to center.",
              },
              {
                num: "02",
                title: "Bring the moment",
                body: "Tell Defrag what is happening. A message you haven't sent. A conversation that keeps repeating. A dynamic you can't name. Defrag helps surface the pattern underneath.",
              },
              {
                num: "03",
                title: "Save to Sovereign",
                body: "Save what changes to your Sovereign.os Library. Defrag results, Covenant Briefs, and your notes all save here — private, organized, and yours.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`border border-white/10 p-8 space-y-4 ${i > 0 ? "border-l-0" : ""}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/20">{step.num}</span>
                <h3 className="text-base font-light text-white">{step.title}</h3>
                <p className="text-sm text-white/40 leading-7">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ────────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-white/8 space-y-12">
          <div className="text-center space-y-3">
            <span className="meta-label mx-auto">Access</span>
            <h2 className="text-3xl font-light tracking-tight">Simple. No surprises.</h2>
            <p className="text-sm text-white/35 max-w-lg mx-auto leading-7">
              One subscription. Both spaces. Your Baseline Design, Library, and history — shared across Defrag and Covenant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`border border-white/10 p-10 flex flex-col space-y-6 ${
                  tier.highlight ? "border-white/25" : ""
                } ${i === 1 ? "md:border-l-0" : ""}`}
              >
                {tier.highlight && (
                  <div className="self-start font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2.5 py-1">
                    Recommended
                  </div>
                )}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-4">{tier.name}</p>
                  <div className="text-5xl font-light">{tier.price} <span className="text-sm text-white/30 font-normal">{tier.period}</span></div>
                </div>
                <p className="text-sm text-white/35">{tier.description}</p>
                <ul className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/50">
                      <span className="block h-px w-4 bg-white/20 shrink-0 mt-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center py-3.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    tier.highlight
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        <section className="py-24 border-t border-white/8 text-center space-y-6">
          <h2 className="text-3xl font-light tracking-tight">Bring the moment here.</h2>
          <p className="text-sm text-white/35 max-w-md mx-auto leading-7">
            Sovereign.os is where the work becomes yours. Start with your Baseline Design.
          </p>
          <Link
            href="https://app.defrag.app/app/login"
            className="sovv-button-primary inline-block py-4 px-10"
          >
            Start Baseline Design
          </Link>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25">
            Sovereign.os
          </p>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { href: "/about", label: "About" },
              { href: "/product", label: "Product" },
              { href: "/pricing", label: "Pricing" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
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