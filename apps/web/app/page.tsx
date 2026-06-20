'use client'

import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "https://app.defrag.app/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Space Preview ─────────────────────────────────────────────────────────────
// Real prompt. Real structured output. Baseline Design chips visible.
// Text sizes bumped for legibility at all viewport sizes.
function SpacePreview() {
  const [active, setActive] = React.useState<"context" | "thread" | "library">("thread")
  const [typed, setTyped] = React.useState("")
  const [showResult, setShowResult] = React.useState(false)

  const DEMO_INPUT =
    "He went quiet after our argument and hasn't responded in four days. I don't know if I pushed too hard or if this is just what he does. I keep checking my phone."

  const DEMO_RESULT = [
    {
      label: "Active pattern",
      value:
        "You absorbed the hit publicly and went silent — not because you had nothing to say, but because speaking felt more dangerous than the wound itself.",
      highlight: false,
    },
    {
      label: "What keeps happening",
      value:
        "You protect the room at your own expense, then spend days alone carrying what you didn't say.",
      highlight: false,
    },
    {
      label: "Default mode",
      value:
        "Peacekeeper under pressure. You learned early that keeping things calm was your job. That's still running — even when the cost is yours to pay.",
      highlight: false,
    },
    {
      label: "What shaped this",
      value:
        "This pattern didn't start at Thanksgiving. It started the first time staying quiet kept something from breaking.",
      highlight: false,
    },
    {
      label: "Best Next Response",
      value:
        "You don't owe your brother a public confrontation. You owe yourself a private one. Write down exactly what you would have said. Then decide — not from the wound, but from what's actually true.",
      highlight: true,
    },
  ]

  React.useEffect(() => {
    if (active !== "thread") return
    setTyped("")
    setShowResult(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < DEMO_INPUT.length) {
        setTyped(DEMO_INPUT.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowResult(true), 600)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [active])

  const panels = [
    { id: "context" as const, label: "Your Design", desc: "Baseline Design — active in every thread" },
    { id: "thread" as const, label: "Defrag", desc: "Put the moment in. See what's underneath it." },
    { id: "library" as const, label: "Library", desc: "Save what helped. Return before the pattern takes over." },
  ]

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Outer glow */}
      <div
        className="pointer-events-none absolute -inset-px"
        style={{
          borderRadius: 20,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className="relative border border-white/[0.10] bg-[#0c0a0d] overflow-hidden shadow-2xl"
        style={{ borderRadius: 18 }}
      >
        {/* Titlebar */}
        <div className="h-11 border-b border-white/[0.07] bg-[#08070a]/90 flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full bg-white/[0.09]" />
            ))}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4f4b47]">
              Sovereign.os
            </span>
          </div>
          {/* Panel switcher */}
          <div className="flex gap-1">
            {panels.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-200 ${
                  active === p.id
                    ? "bg-white/[0.10] text-[#f4efe9]"
                    : "text-[#4f4b47] hover:text-[#76716b]"
                }`}
                style={{ borderRadius: 6 }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel descriptor */}
        <div className="px-6 py-2.5 border-b border-white/[0.05] bg-[#08070a]/50">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#e0743a]/60"
            >
              {panels.find((p) => p.id === active)?.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Content area */}
        <div className="min-h-[380px] p-6">
          <AnimatePresence mode="wait">

            {/* Context — Baseline Design */}
            {active === "context" && (
              <motion.div
                key="context"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-0"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]/50 mb-5">
                  Your Design · Apr 3 1990 · 7:42 AM · Chicago
                </p>
                {[
                  {
                    s: "I move fast when something needs a decision — sometimes before others are ready.",
                    chips: ["Sun in Aries", "Gate 51", "Channel 25-51"],
                  },
                  {
                    s: "I feel things deeply, even when I appear calm on the surface.",
                    chips: ["Moon in Pisces", "Gate 55"],
                  },
                  {
                    s: "I feel internal pressure to stay reliable, even when I'm running low.",
                    chips: ["Saturn in Cap.", "Gate 38"],
                  },
                  {
                    s: "I notice when something is off in a relationship before it becomes visible to others.",
                    chips: ["Venus in Taurus", "Gate 2"],
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease }}
                    className="py-3.5 border-b border-white/[0.05] last:border-0"
                  >
                    <p className="text-[13px] text-[#c8c2bc] leading-relaxed mb-2">{item.s}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {item.chips.map((c) => (
                        <span
                          key={c}
                          className="text-[9px] font-mono tracking-[0.1em] px-2 py-0.5 border border-white/[0.09] text-[#76716b]"
                          style={{ borderRadius: 3 }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
                <p className="text-[10px] text-[#4f4b47] mt-4 font-mono tracking-wide">
                  Active in every result. Never exposed in outputs.
                </p>
              </motion.div>
            )}

            {/* Thread — real prompt + structured result */}
            {active === "thread" && (
              <motion.div
                key="thread"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Input */}
                <div
                  className="border border-white/[0.09] bg-white/[0.025] p-5"
                  style={{ borderRadius: 10 }}
                >
                  <p className="text-[14px] text-[#f4efe9] leading-relaxed min-h-[56px]">
                    {typed}
                    <span className="inline-block w-0.5 h-4 bg-[#f4efe9]/50 ml-0.5 animate-pulse" />
                  </p>
                  <div className="flex justify-end mt-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
                      ↵ Defrag
                    </span>
                  </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="border border-white/[0.09] bg-white/[0.02] overflow-hidden"
                      style={{ borderRadius: 10 }}
                    >
                      {DEMO_RESULT.map((row, i) => (
                        <motion.div
                          key={row.label}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.09, duration: 0.3, ease }}
                          className={`px-5 py-4 border-b border-white/[0.05] last:border-0 ${
                            row.highlight ? "bg-[#e0743a]/[0.06]" : ""
                          }`}
                        >
                          <p
                            className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-1.5 ${
                              row.highlight ? "text-[#e0743a]/70" : "text-[#4f4b47]"
                            }`}
                          >
                            {row.label}
                          </p>
                          <p
                            className={`text-[13px] leading-relaxed ${
                              row.highlight ? "text-[#f4efe9] font-medium" : "text-[#a8a29a]"
                            }`}
                          >
                            {row.value}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Library */}
            {active === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-0"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]/50 mb-5">
                  Saved results
                </p>
                {[
                  { space: "Defrag", title: "Thanksgiving — what I didn't say", date: "Nov 29" },
                  { space: "Alignment", title: "What is mine to carry after the call", date: "Nov 26" },
                  { space: "Defrag", title: "The message I almost sent at 2am", date: "Nov 18" },
                  { space: "Covenant", title: "Responsibility when the family is watching", date: "Nov 12" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease }}
                    className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0 group cursor-pointer hover:bg-white/[0.025] transition-colors px-2 -mx-2"
                    style={{ borderRadius: 6 }}
                  >
                    <div className="flex items-center gap-5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] w-16 shrink-0">
                        {item.space}
                      </span>
                      <span className="text-[13px] text-[#a8a29a] group-hover:text-[#f4efe9] transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#4f4b47] shrink-0">{item.date}</span>
                  </motion.div>
                ))}
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4f4b47] mt-5">
                  Save to Sovereign before the moment disappears.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#4f4b47] mt-5">
        Select a panel to explore the space
      </p>
    </div>
  )
}

// ── Hero light pulse ──────────────────────────────────────────────────────────
// Warm radial glow breathes from top-center — simulates the light beam
// in the photograph intensifying and receding. Pure CSS, zero artifacts.
function HeroLightBeam() {
  return (
    <>
      {/* Primary beam — slow breath */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none select-none"
        animate={{ opacity: [0.0, 1.0, 0.0] }}
        transition={{
          duration: 11,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.5, 1],
        }}
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% -5%, rgba(255,215,170,0.22) 0%, rgba(240,165,90,0.12) 40%, transparent 72%)",
        }}
      />
      {/* Secondary shimmer — offset phase, tighter beam */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none select-none"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          delay: 3,
        }}
        style={{
          background:
            "radial-gradient(ellipse 30% 35% at 50% 0%, rgba(255,230,190,0.14) 0%, transparent 65%)",
        }}
      />
    </>
  )
}

export default function Home() {
  return (
    <SiteShell>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative -mt-16 w-full overflow-hidden bg-[#08070a]"
        style={{ minHeight: "100svh" }}
      >
        {/* High-res base image — WebP 2560px with JPEG fallback */}
        <picture>
          <source
            srcSet="/hero-hand.webp"
            type="image/webp"
            media="(min-width: 768px)"
          />
          <source
            srcSet="/hero-hand-1x.webp"
            type="image/webp"
          />
          <img
            src="/hero-hand.jpg"
            alt="An open hand with palm facing upward into a beam of warm light"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 20%", zIndex: 0 }}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {/* Animated light layer — pure CSS gradient, zero compositing artifacts */}
        <HeroLightBeam />

        {/* Top vignette — nav always readable */}
        <div
          aria-hidden
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,7,10,0.72) 0%, rgba(8,7,10,0.30) 18%, transparent 42%)",
          }}
        />

        {/* Bottom vignette — title floats above image */}
        <div
          aria-hidden
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, rgba(8,7,10,1) 0%, rgba(8,7,10,0.85) 18%, rgba(8,7,10,0.40) 36%, transparent 58%)",
          }}
        />

        {/* Hero title — full-width, bottom-anchored, no description */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center"
          style={{ paddingBottom: "clamp(3.5rem, 9vh, 7rem)" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 md:mb-8"
          >
            <span
              className="font-mono uppercase tracking-[0.28em] text-[#f4efe9]/40"
              style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.75rem)" }}
            >
              Sovereign.os
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[#f4efe9] text-balance leading-[1.02] tracking-[-0.025em] px-4"
            style={{ fontSize: "clamp(3.2rem, 9vw, 8.5rem)", maxWidth: "16ch" }}
          >
            Healing isn&apos;t optional.
            <br />
            <span style={{ color: "rgba(244,239,233,0.55)" }}>
              Holding the pain is.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-3 items-center"
          >
            <Link href={APP_URL} className="btn-primary">
              Enter Sovereign.os — Free
            </Link>
            <Link href="/pricing" className="btn-secondary">
              See plans
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── INTERACTIVE NOTEBOOK PREVIEW ─────────────────────────────────── */}
      {/* Placed before the space tiles so users see the product immediately */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/[0.05]">
        <Container>
          {/* Section header */}
          <div className="flex flex-col items-center text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
                The notebook
              </span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight text-balance max-w-lg"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
            >
              This is what you actually get.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-sm">
              A real prompt. A real result. Your Baseline Design active in the background.
            </p>
          </div>

          <SpacePreview />
        </Container>
      </section>

      {/* ── THREE SPACES ─────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/[0.05] overflow-hidden">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-12">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
              Three spaces
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.06] overflow-hidden" style={{ borderRadius: 16 }}>
            {[
              {
                num: "01",
                name: "Defrag",
                tier: "Free",
                href: "/product",
                accent: false,
                hook: "Separate the moment from the pattern.",
                what: "Something happened. You don't know if you overreacted or if this is the same thing that always happens.",
                cta: "What's actually active — and your clearest next response.",
                tags: ["Arguments", "Messages", "Family roles", "Boundaries", "Grief"],
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
                    <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                  </svg>
                ),
              },
              {
                num: "02",
                name: "Covenant",
                tier: "Pro",
                href: "/covenant",
                accent: true,
                hook: "Your moment has been walked before.",
                what: "Covenant connects what you're going through to the real human stories in Scripture.",
                cta: "One honest next step — grounded in faith, not performance.",
                tags: ["Faith", "Values", "Commitments", "Repair"],
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M10 3 L10 17" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
                    <path d="M4 7 Q10 4 16 7" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
                    <path d="M4 13 Q10 16 16 13" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                num: "03",
                name: "Alignment",
                tier: "Pro",
                href: "/product",
                accent: false,
                hook: "Get back into your own lane.",
                what: "A conversation, a conflict, a decision — and suddenly you're reacting from somewhere that isn't you.",
                cta: "Your Baseline Design and the live sky above you show the path back.",
                tags: ["After Defrag", "Before a hard conversation", "After a conflict"],
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M3 10 L17 10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
                    <path d="M10 3 L10 8" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" />
                    <path d="M10 12 L10 17" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.9" />
                  </svg>
                ),
              },
            ].map((space) => (
              <Link
                key={space.name}
                href={space.href}
                className="group flex flex-col gap-5 p-8 md:p-10 bg-[#0c0a0d] hover:bg-[#0f0d10] transition-colors duration-300"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 flex items-center justify-center border border-white/[0.08]"
                    style={{
                      borderRadius: 8,
                      color: space.accent ? "#e0743a" : "#76716b",
                      background: space.accent ? "rgba(224,116,58,0.06)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {space.icon}
                  </div>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.14em] border px-2 py-0.5 self-start"
                    style={{
                      borderRadius: 3,
                      color: space.tier === "Free" ? "rgba(168,162,154,0.55)" : "rgba(224,116,58,0.65)",
                      borderColor: space.tier === "Free" ? "rgba(255,255,255,0.08)" : "rgba(224,116,58,0.22)",
                    }}
                  >
                    {space.tier}
                  </span>
                </div>

                {/* Name + hook */}
                <div>
                  <h3
                    className="font-serif text-[#f4efe9] mb-2 group-hover:text-[#f0a06a] transition-colors duration-300"
                    style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
                  >
                    {space.name}
                  </h3>
                  <p className="text-[15px] text-[#f4efe9]/65 leading-snug font-medium">
                    {space.hook}
                  </p>
                </div>

                {/* What + CTA */}
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-[13px] text-[#76716b] leading-relaxed">{space.what}</p>
                  <p className="text-[13px] text-[#a8a29a] leading-relaxed">{space.cta}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.05]">
                  {space.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] px-2 py-0.5 border border-white/[0.05]"
                      style={{ borderRadius: 3 }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-[#4f4b47] group-hover:text-[#f0a06a] transition-colors duration-300">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]">Explore</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/[0.05] overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2
            className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-3xl text-balance"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)" }}
          >
            Return before the pattern takes over.
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
            Defrag is free. Start understanding the patterns beneath the moments that matter most.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">
              Enter Sovereign.os — Free
            </Link>
            <Link href="/pricing" className="btn-secondary">
              See plans
            </Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}