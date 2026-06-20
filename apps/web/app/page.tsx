'use client'

import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "https://app.defrag.app/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Baseline Design data — shown as evidence chips on result rows ─────────────
const BASELINE = {
  label: "Your Design · Apr 3 1990 · 7:42 AM · Chicago",
  facts: [
    { text: "Moves fast under pressure — sometimes before others are ready", chips: ["Sun in Aries", "Gate 51"] },
    { text: "Feels things deeply, even when appearing calm", chips: ["Moon in Pisces", "Gate 55"] },
    { text: "Internal pressure to stay reliable, even when running low", chips: ["Saturn in Cap.", "Gate 38"] },
    { text: "Notices relational shifts before they become visible", chips: ["Venus in Taurus", "Gate 2"] },
  ],
}

// ── Demo sequence ─────────────────────────────────────────────────────────────
// Input types character by character.
// Then a loading state (Sovereign is reading).
// Then result rows appear one at a time with staggered delay.
// Each row that draws from Baseline Design shows the evidence chip inline.

const DEMO_INPUT = "He went quiet after our argument and hasn't responded in four days. I don't know if I pushed too hard or if this is just what he does. I keep checking my phone."

type ResultRow = {
  label: string
  value: string
  evidence?: string[]   // Baseline Design chips that support this row
  highlight?: boolean
}

const DEMO_RESULT: ResultRow[] = [
  {
    label: "What's happening",
    value: "Right now, this feels like something important didn't land.",
    evidence: ["Moon in Pisces", "Gate 55"],
  },
  {
    label: "What it lands on",
    value: "Under this is a simple need: to be met.",
    evidence: ["Gate 2", "Venus in Taurus"],
  },
  {
    label: "The other side",
    value: "They may be reacting from a place of protection — not indifference.",
    evidence: ["Gate 38"],
  },
  {
    label: "The pattern",
    value: "You reach. They pull back. Distance grows. This tends to repeat.",
    evidence: ["Sun in Aries", "Gate 51"],
  },
  {
    label: "Next step",
    value: "Name one feeling and one need — in a single sentence. Keep it brief and concrete.",
    highlight: true,
  },
]

// ── Phase types ───────────────────────────────────────────────────────────────
type Phase = "typing" | "loading" | "result"

function SpacePreview() {
  const [active, setActive] = React.useState<"context" | "thread" | "library">("thread")
  const [typed, setTyped] = React.useState("")
  const [phase, setPhase] = React.useState<Phase>("typing")
  const [visibleRows, setVisibleRows] = React.useState(0)

  // Reset and replay when switching to thread tab
  React.useEffect(() => {
    if (active !== "thread") return
    setTyped("")
    setPhase("typing")
    setVisibleRows(0)

    let i = 0
    const typeInterval = setInterval(() => {
      if (i < DEMO_INPUT.length) {
        setTyped(DEMO_INPUT.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
        // Brief pause, then show loading
        setTimeout(() => {
          setPhase("loading")
          // Loading for 1.4s, then reveal results row by row
          setTimeout(() => {
            setPhase("result")
            setVisibleRows(0)
            DEMO_RESULT.forEach((_, idx) => {
              setTimeout(() => setVisibleRows(idx + 1), idx * 380)
            })
          }, 1400)
        }, 400)
      }
    }, 16)

    return () => clearInterval(typeInterval)
  }, [active])

  const panels = [
    { id: "context" as const, label: "Your Design" },
    { id: "thread" as const, label: "Defrag" },
    { id: "library" as const, label: "Library" },
  ]

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Outer accent glow */}
      <div
        className="pointer-events-none absolute -inset-px"
        style={{
          borderRadius: 20,
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.10) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className="relative border border-white/[0.10] bg-[#0c0a0d] overflow-hidden"
        style={{ borderRadius: 18, boxShadow: "0 32px 80px -16px rgba(0,0,0,0.7)" }}
      >
        {/* ── Titlebar ── */}
        <div className="h-11 border-b border-white/[0.07] bg-[#08070a]/90 flex items-center px-4 gap-3 shrink-0">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />)}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4f4b47]">Sovereign.os</span>
          </div>
          <div className="flex gap-0.5">
            {panels.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-200 ${
                  active === p.id ? "bg-white/[0.10] text-[#f4efe9]" : "text-[#4f4b47] hover:text-[#76716b]"
                }`}
                style={{ borderRadius: 5 }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-0">
          <AnimatePresence mode="wait">

            {/* ── YOUR DESIGN tab ── */}
            {active === "context" && (
              <motion.div key="context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="px-6 pt-5 pb-2 border-b border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/50">{BASELINE.label}</p>
                </div>
                <div className="px-6 py-2">
                  {BASELINE.facts.map((fact, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35, ease }}
                      className="flex items-start gap-4 py-4 border-b border-white/[0.04] last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-[13px] text-[#c8c2bc] leading-snug">{fact.text}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end shrink-0 max-w-[140px]">
                        {fact.chips.map((c) => (
                          <span key={c} className="font-mono text-[8px] tracking-[0.1em] px-2 py-0.5 border border-[#e0743a]/20 text-[#e0743a]/60 bg-[#e0743a]/[0.04]" style={{ borderRadius: 3 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t border-white/[0.04]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">Active in every result · never exposed in outputs</p>
                </div>
              </motion.div>
            )}

            {/* ── DEFRAG tab ── */}
            {active === "thread" && (
              <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                {/* Input area */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[14px] text-[#f4efe9] leading-relaxed" style={{ minHeight: 44 }}>
                        {typed}
                        {phase === "typing" && (
                          <span className="inline-block w-[2px] h-[15px] bg-[#f4efe9]/60 ml-0.5 align-middle animate-pulse" />
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Send indicator — appears when typing is done */}
                  <AnimatePresence>
                    {phase !== "typing" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-end gap-2 mt-3"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">Sent</span>
                        <span className="w-1 h-1 rounded-full bg-[#e0743a]/40" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Loading state */}
                <AnimatePresence>
                  {phase === "loading" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-5 flex items-center gap-3"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1 h-1 rounded-full bg-[#e0743a]/50"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                        Reading your Baseline Design
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result rows — appear one at a time */}
                <AnimatePresence>
                  {phase === "result" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      {/* Baseline Design source bar */}
                      <div className="px-6 py-2.5 border-b border-white/[0.04] flex items-center gap-2 bg-[#e0743a]/[0.03]">
                        <span className="w-1 h-1 rounded-full bg-[#e0743a]/50" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50">
                          Baseline Design active · {BASELINE.label.split("·")[0].trim()}
                        </span>
                      </div>

                      {DEMO_RESULT.map((row, i) => (
                        <AnimatePresence key={row.label}>
                          {visibleRows > i && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, ease }}
                              className={`px-6 py-4 border-b border-white/[0.04] last:border-0 ${
                                row.highlight ? "bg-[#e0743a]/[0.05]" : ""
                              }`}
                            >
                              {/* Label row */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                                  row.highlight ? "text-[#e0743a]/80" : "text-[#4f4b47]"
                                }`}>
                                  {row.label}
                                </span>
                                {/* Evidence chips — Baseline Design data points */}
                                {row.evidence && (
                                  <div className="flex gap-1">
                                    {row.evidence.map((chip) => (
                                      <span
                                        key={chip}
                                        className="font-mono text-[8px] tracking-[0.08em] px-1.5 py-0.5 border border-[#e0743a]/20 text-[#e0743a]/50 bg-[#e0743a]/[0.04]"
                                        style={{ borderRadius: 3 }}
                                      >
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Value */}
                              <p className={`text-[13px] leading-relaxed ${
                                row.highlight
                                  ? "text-[#f4efe9] font-medium"
                                  : "text-[#a8a29a]"
                              }`}>
                                {row.value}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* ── LIBRARY tab ── */}
            {active === "library" && (
              <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="px-6 pt-5 pb-2 border-b border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8a29a]/40">Saved results</p>
                </div>
                <div className="px-6 py-2">
                  {[
                    { space: "Defrag", title: "The silence after the argument", date: "Jun 18" },
                    { space: "Alignment", title: "What is mine to carry after the call", date: "Jun 14" },
                    { space: "Defrag", title: "The message I almost sent at 2am", date: "Jun 9" },
                    { space: "Covenant", title: "Responsibility when the family is watching", date: "Jun 3" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3, ease }}
                      className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] w-14 shrink-0">{item.space}</span>
                        <span className="text-[13px] text-[#76716b] group-hover:text-[#c8c2bc] transition-colors">{item.title}</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#4f4b47] shrink-0">{item.date}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t border-white/[0.04]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">Save to Sovereign before the moment disappears</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mt-4">
        Click the panels above to explore
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
          <source srcSet="/hero-hand.webp" type="image/webp" media="(min-width: 768px)" />
          <source srcSet="/hero-hand-1x.webp" type="image/webp" />
          <img
            src="/hero-hand.jpg"
            alt="An open hand with palm facing upward into a beam of warm light"
            className="absolute inset-0 w-full h-full object-cover hero-drift"
            style={{ objectPosition: "center 20%", zIndex: 0, opacity: 0.85 }}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {/* Animated light layer */}
        <HeroLightBeam />

        {/* Edge vignette — all four sides, subtle */}
        <div
          aria-hidden
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: [
              "linear-gradient(180deg, rgba(8,7,10,0.68) 0%, rgba(8,7,10,0.20) 16%, transparent 38%)",
              "linear-gradient(0deg, rgba(8,7,10,1) 0%, rgba(8,7,10,0.88) 20%, rgba(8,7,10,0.35) 42%, transparent 62%)",
              "linear-gradient(90deg, rgba(8,7,10,0.35) 0%, transparent 18%)",
              "linear-gradient(270deg, rgba(8,7,10,0.35) 0%, transparent 18%)",
            ].join(", "),
          }}
        />

        {/* Hero content — lower-middle third, anchored to bottom */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center"
          style={{ paddingBottom: "max(clamp(2.5rem, 7vh, 5rem), env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Platform label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/30 mb-5"
            style={{ fontSize: "0.65rem" }}
          >
            Sovereign.os
          </motion.p>

          {/* Headline — product-led, anchored, calm */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[#f4efe9] text-balance leading-[1.06] tracking-[-0.02em] px-6"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)", maxWidth: "20ch" }}
          >
            See what&apos;s happening —
            <br />
            <span style={{ color: "rgba(244,239,233,0.52)" }}>
              before it repeats.
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-sm text-[#a8a29a] leading-relaxed px-6"
            style={{ fontSize: "clamp(0.875rem, 1.8vw, 1rem)" }}
          >
            A private intelligence system built around your Baseline Design —
            so each moment is read in context, not from scratch.
          </motion.p>

          {/* Embedded live system surface */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 w-full max-w-[540px] mx-auto px-6 sm:px-0"
          >
            <div
              className="overflow-hidden text-left"
              style={{
                borderRadius: 14,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: "linear-gradient(180deg, rgba(11,11,11,0.42), rgba(11,11,11,0.58))",
                border: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#f4efe9]/38 mb-1">Moment</p>
                <p className="text-[12px] text-[#76716b] leading-relaxed italic">
                  &ldquo;I thought I was being clear, but now it feels worse.&rdquo;
                </p>
              </div>
              {[
                {
                  label: "What’s active",
                  value: "You’re trying to clear the tension by naming it. It’s landing with more pressure than you expect.",
                  delay: 0.56,
                  highlight: false,
                },
                {
                  label: "What forms between you",
                  value: "The more you try to clear it up, the more pressure builds.",
                  delay: 0.58,
                  highlight: false,
                },
                {
                  label: "Next move",
                  value: "Say the part that matters. Then leave room for it to land.",
                  delay: 0.60,
                  highlight: true,
                },
              ].map((row) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: row.delay, ease: [0.16, 1, 0.3, 1] }}
                  className={`px-4 py-3 border-b border-white/[0.05] last:border-0 ${row.highlight ? "border-t border-white/[0.06] bg-white/[0.02]" : ""}`}
                >
                  <p className={`font-mono text-[9px] uppercase tracking-[0.12em] mb-1 ${row.highlight ? "text-[#e0743a]/60" : "text-[#f4efe9]/38"}`}>
                    {row.label}
                  </p>
                  <p className={`text-[12px] leading-relaxed ${row.highlight ? "text-[#f4efe9] font-medium" : "text-[#a8a29a]"}`}>
                    {row.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex flex-col sm:flex-row gap-3 items-center px-6"
          >
            <Link href={APP_URL} className="btn-primary">
              Enter Sovereign.os
            </Link>
            <Link href="/how-it-works" className="btn-secondary" style={{ opacity: 0.65 }}>
              See how it works
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