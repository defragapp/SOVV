'use client'

import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "/app/login"
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
    label: "What's active",
    value: "You absorbed the silence and went internal — not because you had nothing to say, but because waiting felt safer than pushing.",
    evidence: ["Moon in Pisces", "Gate 55"],
  },
  {
    label: "You",
    value: "Under this is a simple need: to be met. The checking-your-phone is the loop.",
    evidence: ["Gate 2", "Venus in Taurus"],
  },
  {
    label: "Them",
    value: "They may be reacting from a place of protection — not indifference.",
    evidence: ["Gate 38"],
  },
  {
    label: "What forms between you",
    value: "You reach. They pull back. Distance grows. This tends to repeat.",
    evidence: ["Sun in Aries", "Gate 51"],
  },
  {
    label: "Next move",
    value: "Name one feeling and one need — in a single sentence. Send it without asking for a response.",
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
  const [promptOpen, setPromptOpen] = React.useState(false)
  const [baselineOpen, setBaselineOpen] = React.useState(false)

  React.useEffect(() => {
    if (active !== "thread") return
    setTyped("")
    setPhase("typing")
    setVisibleRows(0)
    setPromptOpen(false)

    let i = 0
    const typeInterval = setInterval(() => {
      if (i < DEMO_INPUT.length) {
        setTyped(DEMO_INPUT.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          setPhase("loading")
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

  const baselineCategories = [
    { label: "Identity", count: 12 },
    { label: "Relationships", count: 18 },
    { label: "Decision Making", count: 9 },
    { label: "Communication", count: 14 },
    { label: "Values", count: 11 },
    { label: "Emotional Patterns", count: 16 },
    { label: "Behavior Under Pressure", count: 13 },
    { label: "Current Timing", count: 4 },
  ]

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Outer accent glow */}
      <div
        className="pointer-events-none absolute -inset-px"
        style={{
          borderRadius: "var(--radius-container)",
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(224,116,58,0.14) 0%, transparent 65%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-px"
        style={{
          borderRadius: "var(--radius-container)",
          background: "radial-gradient(ellipse 60% 30% at 50% 100%, rgba(200,194,188,0.05) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div
        className="relative border border-white/[0.12] bg-[#0c0a0d] overflow-hidden scan-lines"
        style={{ borderRadius: "var(--radius-container)", boxShadow: "0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(224,116,58,0.06)" }}
      >
        {/* ── Titlebar ── */}
        <div className="h-11 border-b border-white/[0.08] bg-[#08070a]/95 flex items-center px-4 gap-3 shrink-0">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-sm bg-white/[0.10]" />)}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#76716b]">Sovereign.os</span>
          </div>
          <div className="flex gap-0.5">
            {panels.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-200 ${
                  active === p.id ? "bg-white/[0.12] text-[#f4efe9]" : "text-[#4f4b47] hover:text-[#76716b]"
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
                {/* Intelligence engine header */}
                <div className="px-6 pt-5 pb-3 border-b border-white/[0.06] bg-[#e0743a]/[0.03]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#e0743a]/60" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/70">Baseline Design Active</p>
                  </div>
                  <p className="text-[11px] text-[#76716b] leading-relaxed">{BASELINE.label}</p>
                </div>

                {/* Baseline facts — improved readability */}
                <div className="px-6 py-1">
                  {BASELINE.facts.map((fact, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.35, ease }}
                      className="flex items-start gap-4 py-4 border-b border-white/[0.05] last:border-0"
                    >
                      <div className="flex-1">
                        {/* Improved text contrast: #c8c2bc → #d4cec8 */}
                        <p className="text-[13px] text-[#d4cec8] leading-snug">{fact.text}</p>
                      </div>
                      {/* Improved chips: more padding, better contrast */}
                      <div className="flex gap-1.5 flex-wrap justify-end shrink-0 max-w-[150px]">
                        {fact.chips.map((c) => (
                          <span
                            key={c}
                            className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06]"
                            style={{ borderRadius: 4 }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Expandable: Baseline Design categories */}
                <div className="border-t border-white/[0.06]">
                  <button
                    onClick={() => setBaselineOpen(o => !o)}
                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">Your Baseline Design</span>
                    <motion.span
                      animate={{ rotate: baselineOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-[10px] text-[#4f4b47]"
                    >
                      ▾
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {baselineOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 grid grid-cols-2 gap-2">
                          {baselineCategories.map((cat) => (
                            <div key={cat.label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                              <span className="text-[12px] text-[#a8a29a]">{cat.label}</span>
                              <span className="font-mono text-[9px] text-[#4f4b47]">{cat.count} signals</span>
                            </div>
                          ))}
                        </div>
                        <div className="px-6 pb-3">
                          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50">97+ Baseline datapoints active</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="px-6 py-3 border-t border-white/[0.04]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Active in every result · never exposed in outputs</p>
                </div>
              </motion.div>
            )}

            {/* ── DEFRAG tab ── */}
            {active === "thread" && (
              <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                {/* Input area — improved contrast */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-sm bg-white/25 mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[14px] text-[#f4efe9] leading-relaxed" style={{ minHeight: 44 }}>
                        {typed}
                        {phase === "typing" && (
                          <span className="inline-block w-[2px] h-[15px] bg-[#f4efe9]/70 ml-0.5 align-middle animate-pulse" />
                        )}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {phase !== "typing" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-end gap-2 mt-3"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">Sent</span>
                        <span className="w-1 h-1 rounded-sm bg-[#e0743a]/50" />
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
                            className="w-1 h-1 rounded-sm bg-[#e0743a]/60"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">
                        Reading your Baseline Design
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result rows */}
                <AnimatePresence>
                  {phase === "result" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      {/* Baseline Design source bar — stronger visual separation */}
                      <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2.5 bg-[#e0743a]/[0.04]">
                        <span className="w-1.5 h-1.5 rounded-sm bg-[#e0743a]/60" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70">
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
                              className={`px-6 py-4 border-b border-white/[0.05] last:border-0 ${
                                row.highlight ? "bg-[#e0743a]/[0.06]" : ""
                              }`}
                            >
                              {/* Label + chips row */}
                              <div className="flex items-center justify-between mb-2.5">
                                <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${
                                  row.highlight ? "text-[#e0743a]/90" : "text-[#76716b]"
                                }`}>
                                  {row.label}
                                </span>
                                {/* Improved chips */}
                                {row.evidence && (
                                  <div className="flex gap-1.5">
                                    {row.evidence.map((chip) => (
                                      <span
                                        key={chip}
                                        className="font-mono text-[8px] tracking-[0.1em] px-2.5 py-1 border border-[#e0743a]/30 text-[#e0743a]/70 bg-[#e0743a]/[0.06]"
                                        style={{ borderRadius: 4 }}
                                      >
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Value — improved contrast */}
                              <p className={`text-[14px] leading-relaxed ${
                                row.highlight
                                  ? "text-[#f4efe9]"
                                  : "text-[#c8c2bc]"
                              }`}>
                                {row.value}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ))}

                      {/* Expandable: Prompt that built this */}
                      {visibleRows >= DEMO_RESULT.length && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                          className="border-t border-white/[0.06]"
                        >
                          <button
                            onClick={() => setPromptOpen(o => !o)}
                            className="w-full px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                          >
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Prompt that built this Baseline Design</span>
                            <motion.span
                              animate={{ rotate: promptOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-mono text-[10px] text-[#4f4b47]"
                            >
                              ▾
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {promptOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-5">
                                  {/* Prompt preview */}
                                  <div className="border border-white/[0.06] bg-[#08070a] p-4 mb-4" style={{ borderRadius: 8 }}>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">System prompt excerpt</p>
                                    <p className="text-[12px] text-[#76716b] leading-relaxed font-mono">
                                      You are Sovereign.os. You work from Baseline Design — a private synthesis of the user&rsquo;s natal data, Human Design, Gene Keys, and behavioral patterns. Translate this into grounded, specific pattern recognition. Never expose raw data. Never diagnose. One clear next move.
                                    </p>
                                  </div>
                                  {/* Built from checklist */}
                                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Built from this conversation:</p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                      "Identity", "Relationships", "Decision Making",
                                      "Emotional Patterns", "Values", "Communication Style",
                                      "Motivations", "Timing", "Pattern Memory",
                                    ].map((item) => (
                                      <div key={item} className="flex items-center gap-2">
                                        <span className="text-[#e0743a]/60 text-[10px]">✓</span>
                                        <span className="text-[12px] text-[#a8a29a]">{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60">97+ Baseline datapoints</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* ── LIBRARY tab ── */}
            {active === "library" && (
              <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="px-6 pt-5 pb-2 border-b border-white/[0.06]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]/60">Saved results</p>
                </div>
                <div className="px-6 py-1">
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
                      className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] w-14 shrink-0">{item.space}</span>
                        <span className="text-[13px] text-[#a8a29a] group-hover:text-[#d4cec8] transition-colors">{item.title}</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#4f4b47] shrink-0">{item.date}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Save to Sovereign before the moment disappears</p>
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
        className="relative -mt-[68px] w-full overflow-hidden bg-[#08070a]"
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
            width="2560"
            height="1440"
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

        {/* Hero content — headline + single CTA only. Image breathes. */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center"
          style={{ paddingBottom: "max(clamp(3rem, 8vh, 6rem), env(safe-area-inset-bottom, 0px))" }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#f4efe9]/30 mb-5 px-8"
          >
            Sovereign.os · Personal AI with your full context
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[#f4efe9] text-balance leading-[1.06] tracking-[-0.02em] px-8"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", maxWidth: "22ch" }}
          >
            <span className="text-glow">Personal AI</span>
            <br />
            <span style={{ color: "rgba(244,239,233,0.48)" }}>
              with your full context.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-xs text-[#a8a29a] leading-relaxed px-8"
            style={{ fontSize: "clamp(0.8rem, 1.6vw, 0.9rem)" }}
          >
            Sovereign.os combines your Baseline Design, live timing, and relationship context to help you understand the moment — and the next move that actually fits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-3 items-center px-8"
          >
            <Link href={APP_URL} className="btn-primary">
              Build Your Baseline
            </Link>
            <Link href="/how-it-works" className="btn-secondary" style={{ opacity: 0.70 }}>
              Explore Sovereign
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ── NOTEBOOK PREVIEW ─────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-36 bg-[#08070a] border-t border-white/[0.04] pattern-field">
        <Container>
          <div className="flex flex-col items-center text-center mb-14 reveal-up reveal-up-1">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">
                The clarity console
              </span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight text-balance max-w-lg"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
            >
              <span className="text-glow">Better answers</span> need better context.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-sm">
              Most AI only knows what you type. Sovereign works from a deeper foundation — your Baseline Design, live timing, and relationship context — so you can ask real human questions and get guidance that actually fits.
            </p>
          </div>
          <SpacePreview />
        </Container>
      </section>

            {/* ── THE PROBLEM ─────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#08070a] border-t border-white/[0.04] overflow-hidden pattern-field">
        {/* Alignment rings — decorative */}
        <div className="alignment-ring absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-30" />
        <div className="alignment-ring absolute -right-60 top-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-20" />
        <div className="alignment-ring absolute -right-80 top-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-10" />

        <Container className="relative z-10">
          <div className="max-w-2xl mb-16 reveal-up reveal-up-1">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Why it matters</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] text-balance"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
            >
              <span className="text-glow">Some moments</span> are too layered for generic advice.
            </h2>
            <p className="mt-5 text-[15px] text-[#76716b] leading-relaxed max-w-lg">
              When people, timing, history, and emotion are all involved, context changes the answer. Sovereign.os separates the moment from the pattern — before pressure decides for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "The Moment",
                desc: "What happened on the surface — the message, the silence, the conversation, the decision.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="3" stroke="rgba(224,116,58,0.6)" strokeWidth="1.5"/>
                    <circle cx="10" cy="10" r="7" stroke="rgba(224,116,58,0.2)" strokeWidth="1" strokeDasharray="2 3"/>
                  </svg>
                ),
                delay: "reveal-up-2",
              },
              {
                label: "The Pattern",
                desc: "What may be repeating underneath — the role, the loop, the pressure that makes the moment feel heavier than the facts.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10 Q7 4 10 10 Q13 16 17 10" stroke="rgba(224,116,58,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M3 10 Q7 4 10 10 Q13 16 17 10" stroke="rgba(224,116,58,0.15)" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  </svg>
                ),
                delay: "reveal-up-3",
              },
              {
                label: "The Next Move",
                desc: "The response, pause, boundary, or repair that resolves the moment without pulling you out of yourself.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="rgba(224,116,58,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                delay: "reveal-up-4",
              },
            ].map((card) => (
              <div key={card.label} className={`moment-card p-7 flex flex-col gap-5 ${card.delay} reveal-up`}>
                <div className="w-9 h-9 flex items-center justify-center border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: 8 }}>
                  {card.icon}
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">{card.label}</p>
                  <p className="text-[14px] text-[#c8c2bc] leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container>
          <div className="flex flex-col items-center text-center mb-16 reveal-up reveal-up-1">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">The process</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] text-balance max-w-xl"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
            >
              Ask human questions. Get context-aware guidance.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] border border-white/[0.05] overflow-hidden max-w-4xl mx-auto" style={{ borderRadius: 16 }}>
            {[
              {
                num: "01",
                title: "Bring the moment",
                body: "Describe what's happening — a message, conflict, boundary, grief point, or decision. No framework required.",
              },
              {
                num: "02",
                title: "Sovereign reads the context",
                body: "Your Baseline Design, live timing, and relationship dynamics are already active. The AI translates the complexity into plain language.",
              },
              {
                num: "03",
                title: "Choose your next move",
                body: "Get a clear, context-aware response — what's active, what may be repeating, and the next move that gives the situation a better chance.",
              },
            ].map((step, i) => (
              <div key={step.num} className={`bg-[#0c0a0d] p-8 md:p-10 flex flex-col gap-6 reveal-up reveal-up-${i + 2}`}>
                {/* Step number with signal dot */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4f4b47]">{step.num}</span>
                  {i < 2 && (
                    <div className="flex-1 h-px bg-gradient-to-r from-[#e0743a]/20 to-transparent" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-[1.15rem] text-[#f4efe9] leading-snug mb-3">{step.title}</h3>
                  <p className="text-[13px] text-[#76716b] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── BRAND BELIEF ────────────────────────────────────────────────── */}
      <section className="relative w-full py-28 md:py-44 bg-[#08070a] border-t border-white/[0.04] overflow-hidden text-center">
        {/* Alignment rings — centered */}
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-20" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-12" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.06]" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.04]" />
        {/* Warm center glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(224,116,58,0.06) 0%, transparent 70%)" }} aria-hidden />

        <Container className="relative z-10 max-w-2xl">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">What we believe</p>
          <blockquote
            className="font-serif text-[#f4efe9] leading-[1.15] tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.5rem)" }}
          >
            <span className="text-glow">You do not need to decode the system.</span>
            <br />
            <span style={{ color: "rgba(244,239,233,0.45)" }}>Sovereign translates it for you.</span>
          </blockquote>
          <p className="mt-8 text-[15px] text-[#76716b] leading-relaxed max-w-md mx-auto">
            Astrology, Human Design, Gene Keys, numerology, live timing — Sovereign.os brings it all together into one personal context layer. No homework. No decoding. Just clearer guidance.
          </p>
        </Container>
      </section>

      {/* ── THREE SPACES ─────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/[0.04] overflow-hidden">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-12">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">
              The spaces
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.06] overflow-hidden" style={{ borderRadius: 16 }}>
            {[
              {
                num: "01",
                name: "Defrag",
                tier: "Free",
                href: "/product/defrag",
                hook: "Understand relationship tension before it becomes damage.",
                what: "For the argument, the silence, the message, the grief — and the pattern beneath all of them.",
                cta: "What's active, what may be repeating, and your Best Next Response.",
                tags: ["Arguments", "Messages", "Family roles", "Boundaries", "Grief"],
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    {/* Defrag: separated layers becoming clear */}
                    <rect x="3" y="4" width="18" height="3" rx="1" stroke="rgba(224,116,58,0.5)" strokeWidth="1.2"/>
                    <rect x="3" y="10.5" width="12" height="3" rx="1" stroke="rgba(224,116,58,0.35)" strokeWidth="1.2"/>
                    <rect x="3" y="17" width="15" height="3" rx="1" stroke="rgba(224,116,58,0.2)" strokeWidth="1.2"/>
                    <line x1="17" y1="12" x2="21" y2="12" stroke="rgba(224,116,58,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M19 10l2 2-2 2" stroke="rgba(224,116,58,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                num: "02",
                name: "Covenant",
                tier: "Pro",
                href: "/product/covenant",
                hook: "For the questions that need meaning, not more noise.",
                what: "Values, responsibility, faith-context reflection, family patterns, grief, and decisions that feel bigger than simple problem-solving.",
                cta: "One honest next step — grounded in what matters, not reaction.",
                tags: ["Faith", "Values", "Grief", "Discernment", "Family patterns"],
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    {/* Covenant: connected arc, story bridge */}
                    <path d="M4 18 Q12 4 20 18" stroke="rgba(224,116,58,0.5)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                    <circle cx="4" cy="18" r="1.5" fill="rgba(224,116,58,0.4)"/>
                    <circle cx="20" cy="18" r="1.5" fill="rgba(224,116,58,0.4)"/>
                    <circle cx="12" cy="9" r="1.5" fill="rgba(224,116,58,0.6)"/>
                    <line x1="4" y1="18" x2="12" y2="9" stroke="rgba(224,116,58,0.15)" strokeWidth="1" strokeDasharray="2 2"/>
                    <line x1="20" y1="18" x2="12" y2="9" stroke="rgba(224,116,58,0.15)" strokeWidth="1" strokeDasharray="2 2"/>
                  </svg>
                ),
              },
              {
                num: "03",
                name: "Alignment",
                tier: "Pro",
                href: "/product/alignment",
                hook: "Choose the move that keeps you clear.",
                what: "After the insight. Before the next move. Speak, wait, repair, clarify, hold the boundary — with less reactivity.",
                cta: "The right move should resolve the moment without pulling you out of yourself.",
                tags: ["After Defrag", "Before a hard conversation", "After a conflict"],
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    {/* Alignment: concentric rings, centered axis */}
                    <circle cx="12" cy="12" r="2" fill="rgba(224,116,58,0.7)"/>
                    <circle cx="12" cy="12" r="5" stroke="rgba(224,116,58,0.35)" strokeWidth="1.2" fill="none"/>
                    <circle cx="12" cy="12" r="8.5" stroke="rgba(224,116,58,0.15)" strokeWidth="1" fill="none" strokeDasharray="2 3"/>
                    <line x1="12" y1="3" x2="12" y2="21" stroke="rgba(224,116,58,0.1)" strokeWidth="1"/>
                    <line x1="3" y1="12" x2="21" y2="12" stroke="rgba(224,116,58,0.1)" strokeWidth="1"/>
                  </svg>
                ),
              },
            ].map((space) => (
              <Link
                key={space.name}
                href={space.href}
                className="group flex flex-col gap-5 p-8 md:p-10 bg-[#0c0a0d] glow-card-hover"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 flex items-center justify-center border border-white/[0.08]"
                    style={{
                      borderRadius: 8,
                      background: space.tier === "Pro" ? "rgba(224,116,58,0.04)" : "rgba(255,255,255,0.02)",
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

                <div>
                  <h3
                    className="font-serif text-[#f4efe9] mb-2 group-hover:text-white transition-colors duration-200"
                    style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
                  >
                    {space.name}
                  </h3>
                  <p className="text-[15px] text-[#f4efe9]/65 leading-snug">
                    {space.hook}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-[13px] text-[#a8a29a] leading-relaxed">{space.what}</p>
                </div>

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
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-32 md:py-48 bg-[#0c0a0d] border-t border-white/[0.04] overflow-hidden">
        {/* Alignment rings */}
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-15" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-[0.08]" />
        <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.04]" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,116,58,0.05) 0%, transparent 70%)" }} aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">Start here</p>
          <h2
            className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] max-w-2xl text-balance"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}
          >
            <span className="text-glow">Less guessing.</span>
            <br />
            <span style={{ color: "rgba(244,239,233,0.55)" }}>More context.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] text-[#76716b] leading-relaxed">
            Defrag is free. Build your Baseline Design and bring the moment — the argument, the silence, the message — and see what&rsquo;s actually active beneath it.
          </p>
          <div className="mt-9">
            <Link href={APP_URL} className="btn-primary">
              Build Your Baseline
            </Link>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
              Private by design · Free to start
            </p>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
