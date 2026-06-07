"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { pricingTiers } from "../data/marketing";

// ── Fragment animation — Defrag visual metaphor ──────────────────────────
// Fragmentation → order. Scattered characters resolve into structure.
const FRAG_CHARS = "01·—/\\|_░▒▓█▄▀■□▪▫◆◇○●".split("");
const COLS = 28;
const ROWS = 5;

function FragmentGrid({ resolved }: { resolved: boolean }) {
  const prefersReduced = useReducedMotion();
  const [cells] = useState(() =>
    Array.from({ length: COLS * ROWS }, () =>
      FRAG_CHARS[Math.floor(Math.random() * FRAG_CHARS.length)]
    )
  );
  const [resolvedSet, setResolvedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (prefersReduced || !resolved) return;
    let i = 0;
    const total = COLS * ROWS;
    const id = setInterval(() => {
      if (i >= total) { clearInterval(id); return; }
      const batch = Math.min(6, total - i);
      setResolvedSet(prev => {
        const next = new Set(prev);
        for (let j = 0; j < batch; j++) next.add(i + j);
        return next;
      });
      i += batch;
    }, 22);
    return () => clearInterval(id);
  }, [resolved, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div className="select-none pointer-events-none" aria-hidden="true">
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} className="flex gap-1.5">
          {Array.from({ length: COLS }, (_, col) => {
            const idx = row * COLS + col;
            return (
              <span
                key={col}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.5rem",
                  letterSpacing: "0.08em",
                  opacity: resolvedSet.has(idx) ? 0.28 : 0.06,
                  transition: `opacity ${0.35 + Math.random() * 0.45}s ease`,
                  color: "#F6F5F3",
                }}
              >
                {cells[idx]}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const REAL_MOMENTS = [
  { label: "The message", body: "You have reread it too many times. You do not know if you are reacting or responding. Before you send it, understand the pattern." },
  { label: "The family role", body: "The conversation pulled you back into something older than the argument. Some family roles survive long after childhood." },
  { label: "The boundary", body: "It is clear in your body. It is impossible in your mouth. A boundary is not a punishment. It is a return to alignment." },
  { label: "The grief", body: "Grief changes how everything lands. The same words hit differently. The same people feel further away. Defrag holds that context." },
  { label: "The relationship pattern", body: "You can feel it before you can explain it. The same dynamic. The same outcome. The pattern is louder than the moment." },
  { label: "The other side", body: "Two people can live through the same conversation and leave with completely different truths. The other side may not be lying. They may be living from another map." },
];

export default function LandingPage() {
  const [fragResolved, setFragResolved] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setFragResolved(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070B] text-[#F6F5F3]">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/8 glass safe-top" aria-label="Main navigation">
        <div className="container-platform flex h-14 items-center justify-between">
          <Link href="/" className="text-label hover:text-[#F6F5F3]/60 transition-colors" aria-label="Sovereign.os home">
            SOVEREIGN.OS
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/product", label: "Product" },
              { href: "/how-it-works", label: "How it works" },
              { href: "/pricing", label: "Pricing" },
              { href: "/covenant", label: "Covenant" },
            ].map(item => (
              <Link key={item.href} href={item.href} className="text-label hover:text-[#F6F5F3]/55 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="text-label text-[#F6F5F3]/28 hover:text-[#F6F5F3]/55 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" className="sovv-button py-2.5 px-5 text-[9px]">
              Enter Sovereign.os
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — full screen ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Structural grid */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" aria-hidden="true" />
        {/* Scan lines */}
        <div className="pointer-events-none absolute inset-0 scan-lines opacity-35" aria-hidden="true" />
        {/* Radial depth */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(246,245,243,0.025) 0%, transparent 70%)" }} />

        {/* Fragment grid — top */}
        <div className="absolute top-16 left-0 right-0 px-8 pt-4 opacity-70" aria-hidden="true">
          <FragmentGrid resolved={fragResolved} />
        </div>

        {/* Hero content */}
        <div className="container-platform relative z-10 pt-28 pb-20">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-8">
              <span className="meta-label">The Platform</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-display mb-8" style={{ fontWeight: 300 }}>
              Healing isn't optional.
              <br />
              <span className="text-[#F6F5F3]/38">Holding the pain is.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-body max-w-2xl mb-3" style={{ fontSize: "1.0625rem" }}>
              Sovereign.os is a private place to work through the patterns that keep showing up in your life.
            </motion.p>

            <motion.p variants={fadeUp} custom={2.5} className="text-caption max-w-xl mb-12">
              For the moments you keep replaying, the patterns you keep meeting, and the responses you are ready to change.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
        </div>

        {/* Fragment grid — bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-4 opacity-45" aria-hidden="true">
          <FragmentGrid resolved={fragResolved} />
        </div>

        {/* Scroll cue */}
        {!prefersReduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-micro text-[#F6F5F3]/18"
            aria-hidden="true"
          >
            ↓
          </motion.div>
        )}
      </section>

      {/* ── The real moments ───────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform space-y-12">
          <div className="space-y-3">
            <span className="meta-label">The real moments</span>
            <h2 className="text-headline max-w-2xl">The moment happened once.<br />The pattern keeps happening until you can see it.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {REAL_MOMENTS.map((m, i) => (
              <div
                key={m.label}
                className={`border border-white/8 p-8 space-y-3 hover:border-white/15 transition-colors
                  ${i % 3 !== 0 ? "md:border-l-0" : ""}
                  ${i >= 3 ? "border-t-0" : ""}
                `}
              >
                <h3 className="text-sm font-light text-[#F6F5F3]/75">{m.label}</h3>
                <p className="text-caption text-xs leading-7">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Sovereign.os does ─────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <span className="meta-label">What Sovereign.os does</span>
              <h2 className="text-headline">Structure for the moments<br />that will not leave you alone.</h2>
              <div className="space-y-5 text-body text-sm">
                <p>
                  The message that unsettled you. The family role you keep falling back into. The boundary you keep negotiating with yourself. The grief that changes the room. The relationship dynamic you can feel, but cannot fully name.
                </p>
                <p>
                  Sovereign.os gives those moments structure — without turning them into a diagnosis, a score, or a verdict.
                </p>
              </div>
            </div>

            {/* Structural visual */}
            <div className="sovv-panel p-8 space-y-4">
              <p className="text-label mb-4">Active in this moment</p>
              {[
                { label: "Pattern", value: "Repeating loop — boundary negotiation" },
                { label: "Active role", value: "Fixer / carrier / peacekeeper" },
                { label: "What repeats", value: "Pressure → protect → distance → repair" },
                { label: "Next response", value: "Name the pattern before the conversation" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-4 py-3 border-b border-white/6 last:border-0">
                  <span className="text-micro shrink-0 w-24">{row.label}</span>
                  <span className="text-caption text-xs">{row.value}</span>
                </div>
              ))}
              <p className="text-micro pt-2">Grounded in your Baseline Design · Saved to Library</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Baseline Design ────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="meta-label">The Source</span>
              <h2 className="text-headline">Your Baseline Design<br />is the source.</h2>
              <div className="space-y-4 text-body text-sm">
                <p>
                  It gives the system a starting point for how you tend to process pressure, conflict, connection, timing, repair, and alignment.
                </p>
                <p className="text-[#F6F5F3]/35">
                  Not as a label. Not as an excuse. As context.
                </p>
                <p>
                  So the work does not begin with "what is wrong with me?" It begins with "what pattern is active, and what response would actually change it?"
                </p>
              </div>
              <Link href="https://app.defrag.app/settings" className="sovv-button inline-flex py-3 px-6">
                Set Your Baseline Design
              </Link>
            </div>

            {/* Baseline Design structural map */}
            <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
              <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
                <rect width="400" height="400" fill="none"/>
                <rect x="40" y="40" width="320" height="320" fill="none" stroke="#F6F5F3" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="40" y1="147" x2="360" y2="147" stroke="#F6F5F3" strokeOpacity="0.04" strokeWidth="1"/>
                <line x1="40" y1="253" x2="360" y2="253" stroke="#F6F5F3" strokeOpacity="0.04" strokeWidth="1"/>
                <line x1="147" y1="40" x2="147" y2="360" stroke="#F6F5F3" strokeOpacity="0.04" strokeWidth="1"/>
                <line x1="253" y1="40" x2="253" y2="360" stroke="#F6F5F3" strokeOpacity="0.04" strokeWidth="1"/>
                <circle cx="200" cy="200" r="120" fill="none" stroke="#F6F5F3" strokeOpacity="0.09" strokeWidth="1"/>
                <circle cx="200" cy="200" r="80" fill="none" stroke="#F6F5F3" strokeOpacity="0.06" strokeWidth="1"/>
                <circle cx="200" cy="200" r="40" fill="none" stroke="#F6F5F3" strokeOpacity="0.05" strokeWidth="1"/>
                <line x1="200" y1="80" x2="200" y2="320" stroke="#F6F5F3" strokeOpacity="0.14" strokeWidth="1"/>
                <line x1="80" y1="200" x2="320" y2="200" stroke="#F6F5F3" strokeOpacity="0.14" strokeWidth="1"/>
                <line x1="115" y1="115" x2="285" y2="285" stroke="#F6F5F3" strokeOpacity="0.04" strokeWidth="1"/>
                <line x1="285" y1="115" x2="115" y2="285" stroke="#F6F5F3" strokeOpacity="0.04" strokeWidth="1"/>
                <circle cx="200" cy="200" r="4" fill="#F6F5F3" fillOpacity="0.55"/>
                <circle cx="200" cy="200" r="10" fill="none" stroke="#F6F5F3" strokeOpacity="0.18" strokeWidth="1"/>
                <text x="200" y="70" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.18" fontFamily="monospace">DOB</text>
                <text x="200" y="340" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.18" fontFamily="monospace">POB</text>
                <text x="65" y="204" textAnchor="middle" fontSize="7" letterSpacing="2" fill="#F6F5F3" fillOpacity="0.18" fontFamily="monospace">TOB</text>
                <rect x="40" y="40" width="12" height="1" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="40" y="40" width="1" height="12" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="348" y="40" width="12" height="1" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="359" y="40" width="1" height="12" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="40" y="359" width="12" height="1" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="40" y="348" width="1" height="12" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="348" y="359" width="12" height="1" fill="#F6F5F3" fillOpacity="0.22"/>
                <rect x="359" y="348" width="1" height="12" fill="#F6F5F3" fillOpacity="0.22"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Defrag ─────────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <span className="meta-label">Defrag space</span>
              <h2 className="text-headline">The moment that will not<br />leave you alone.</h2>
              <div className="space-y-4 text-body text-sm">
                <p>
                  A conversation. A message. A family pattern. A boundary. A loss. A role you keep carrying. A reaction that felt bigger than the situation.
                </p>
                <p>
                  Defrag helps you slow the moment down, separate what happened from what repeated, and find the next response that does not keep feeding the same pattern.
                </p>
              </div>
              <Link href="https://app.defrag.app/apps/defrag" className="sovv-button inline-flex py-3 px-6">
                Enter Defrag space
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-label mb-4">Use Defrag when</p>
              {[
                "You are about to send the message.",
                "You cannot tell if you are reacting or responding.",
                "A family conversation pulled you back into an old role.",
                "A boundary feels clear in your body but impossible in your mouth.",
                "You keep replaying what someone said.",
                "You want to understand the other side without abandoning your own.",
                "You are grieving and everything sounds different.",
                "You know the pattern, but not the next move.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 py-2.5 border-b border-white/6">
                  <div className="mt-2 h-px w-3 bg-[#F6F5F3]/18 shrink-0" />
                  <span className="text-caption text-xs leading-6">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Shadow / old role section ───────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="max-w-3xl space-y-6">
            <span className="meta-label">What you learned to carry</span>
            <h2 className="text-headline">What you learned to carry<br />does not have to lead.</h2>
            <div className="space-y-4 text-body text-sm">
              <p>
                Some reactions are not only about the present. They come from the part of you that learned to stay ready. The part that learned to please, prove, defend, disappear, fix, perform, or carry the room.
              </p>
              <p>
                Defrag does not turn that into a label. It helps you see when an old survival role is running a new moment — so you can choose a response that belongs to who you are becoming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Covenant ───────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <span className="meta-label">Covenant space</span>
              <h2 className="text-headline">Faith connected<br />to the work.</h2>
              <div className="space-y-4 text-body text-sm">
                <p>
                  Covenant is for the user who wants faith to stay connected to the work. Not as certainty. Not as performance. Not as a spiritual shortcut.
                </p>
                <p>
                  Covenant helps bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
                </p>
              </div>
              <Link href="/covenant" className="sovv-button inline-flex py-3 px-6">
                Learn about Covenant
              </Link>
            </div>

            <div className="border border-white/8 p-8 space-y-4">
              <p className="text-label">Covenant is not</p>
              {["Certainty", "Performance", "A spiritual shortcut", "A sermon", "A verdict"].map((item) => (
                <div key={item} className="flex items-center gap-3 py-2 border-b border-white/6 last:border-0">
                  <span className="text-micro text-[#F6F5F3]/20">✕</span>
                  <span className="text-caption text-xs">{item}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-label mb-3">Covenant is</p>
                {["Faith connected to repair", "Grounded discernment", "Honest next steps", "Reflection without performance"].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-2 border-b border-white/6 last:border-0">
                    <div className="h-px w-3 bg-[#F6F5F3]/18 shrink-0" />
                    <span className="text-caption text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── When both sides matter ─────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="max-w-3xl space-y-6">
            <span className="meta-label">When both sides matter</span>
            <h2 className="text-headline">The other side may not be lying.<br />They may be living from another map.</h2>
            <div className="space-y-4 text-body text-sm">
              <p>
                Two people can live through the same conversation and leave with completely different truths. With permission, Sovereign.os can help compare two Baseline Designs — not to decide who is right, not to score compatibility, and not to diagnose the relationship.
              </p>
              <p>
                To show how each person may be receiving, protecting, assuming, fearing, or reaching from a different internal map.
              </p>
              <p className="text-[#F6F5F3]/35">
                When both sides matter, invite privately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Library ────────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="meta-label">The Library</span>
              <h2 className="text-headline">Your Library keeps what<br />the moment taught you.</h2>
              <div className="space-y-4 text-body text-sm">
                <p>
                  The response you found. The pattern you finally saw. The boundary that became clear. The reflection you do not want to lose. The version of the conversation you can return to before you repeat the old one.
                </p>
                <p className="text-[#F6F5F3]/35">
                  Save to Sovereign before the moment disappears.
                </p>
              </div>
            </div>

            <div className="sovv-panel p-8 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-label">Sovereign.os Library</span>
                <span className="text-micro">Private</span>
              </div>
              {[
                { space: "Defrag", label: "Boundary — what I keep negotiating with myself", date: "Jun 6" },
                { space: "Defrag", label: "Family role — the fixer pattern", date: "Jun 4" },
                { space: "Covenant", label: "Covenant Brief — discernment before the decision", date: "Jun 2" },
                { space: "Defrag", label: "Message — before I sent it", date: "May 30" },
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
              <p className="text-micro pt-2">Invite Privately · Public Preview · Watch Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pro ────────────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform space-y-12">
          <div className="space-y-3">
            <span className="meta-label">Pro</span>
            <h2 className="text-headline">Free is for beginning the work.<br />Pro is for the patterns that need more than one pass.</h2>
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

          <div className="max-w-xl space-y-3 pt-4">
            <p className="text-caption text-xs leading-6">
              Build continuity instead of starting over every time something hurts. Save Results. Return to your Library. Use deeper context. Invite privately. Work across Defrag and Covenant.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="section-gap border-t border-white/8">
        <div className="container-platform text-center space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="meta-label mx-auto">Start here</span>
            <h2 className="text-display" style={{ fontWeight: 300 }}>
              Healing isn't optional.
              <br />
              <span className="text-[#F6F5F3]/38">Holding the pain is.</span>
            </h2>
            <p className="text-body">
              Enter Sovereign.os. Set your Baseline Design. Work through what is active. Save what changes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="sovv-button-primary py-4 px-10">
              Enter Sovereign.os
            </Link>
            <Link href="https://app.defrag.app/app/login" className="sovv-button py-4 px-10">
              Start Baseline Design
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