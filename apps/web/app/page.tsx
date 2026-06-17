'use client'

import Link from "next/link"
import Image from "next/image"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "https://app.defrag.app/app/login"

// ─── Design tokens ────────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  )
}

// ─── Interactive Space Preview ─────────────────────────────────────────────────
// Shows a simplified, interactive render of the Defrag notebook
// Clicking different sections reveals what each panel does
function SpacePreview() {
  const [active, setActive] = React.useState<"context" | "thread" | "library">("thread")
  const [typed, setTyped] = React.useState("")
  const [showResult, setShowResult] = React.useState(false)

  const DEMO_INPUT = "She went quiet after I said that. I don't know if I crossed a line or if she's just processing."
  const DEMO_RESULT = {
    pattern: "You moved fast when the silence felt like rejection — before you could find out what it actually meant.",
    repeat: "The loop where you interpret quiet as withdrawal, then act to close the gap before it's confirmed.",
    response: "Wait one full day before following up. Let her process without your anxiety filling the space.",
  }

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
    }, 28)
    return () => clearInterval(interval)
  }, [active])

  const panels = [
    { id: "context" as const, label: "Context", desc: "Your Baseline Design — active in every thread" },
    { id: "thread" as const, label: "Defrag", desc: "Describe the moment. See the pattern." },
    { id: "library" as const, label: "Library", desc: "Save what helped. Return before the pattern takes over." },
  ]

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.12) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Chrome frame */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0a0d] overflow-hidden shadow-2xl">

        {/* Titlebar */}
        <div className="h-10 border-b border-white/[0.06] bg-[#08070a]/80 flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#4f4b47]">Sovereign.os / Defrag</span>
          </div>
          {/* Panel switcher */}
          <div className="flex gap-0.5">
            {panels.map(p => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] uppercase rounded transition-all duration-200 ${
                  active === p.id
                    ? "bg-white/[0.08] text-[#f4efe9]"
                    : "text-[#4f4b47] hover:text-[#76716b]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel description */}
        <div className="px-5 py-2 border-b border-white/[0.04] bg-[#08070a]/40">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease }}
              className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#e0743a]/60"
            >
              {panels.find(p => p.id === active)?.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Content area */}
        <div className="min-h-[320px] p-5">
          <AnimatePresence mode="wait">

            {/* Context panel */}
            {active === "context" && (
              <motion.div
                key="context"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col gap-3"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8a29a]/60 mb-2">Your Design</p>
                {[
                  { statement: "I naturally move fast when something needs a decision — sometimes before others are ready.", chips: ["Sun in Aries", "Gate 51"] },
                  { statement: "I tend to feel things deeply, even in situations where I appear calm on the surface.", chips: ["Moon in Pisces", "Gate 55"] },
                  { statement: "I feel internal pressure to stay reliable, even when I'm running low.", chips: ["Saturn in Cap.", "Gate 38"] },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4, ease }}
                    className="py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <p className="text-[11px] text-[#c8c2bc] leading-relaxed mb-1.5">{item.statement}</p>
                    <div className="flex gap-1 flex-wrap">
                      {item.chips.map(chip => (
                        <span key={chip} className="text-[8px] font-mono tracking-[0.1em] px-2 py-0.5 border border-white/[0.08] text-[#76716b]" style={{ borderRadius: 4 }}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
                <p className="text-[9px] text-[#4f4b47] mt-2">Active in every result.</p>
              </motion.div>
            )}

            {/* Thread panel */}
            {active === "thread" && (
              <motion.div
                key="thread"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col h-full gap-4"
              >
                {/* Input */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <p className="text-[12px] text-[#f4efe9] leading-relaxed min-h-[40px]">
                    {typed}
                    <span className="inline-block w-0.5 h-3.5 bg-[#f4efe9]/60 ml-0.5 animate-pulse" />
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#4f4b47]">↵ Defrag</span>
                  </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-3"
                    >
                      {[
                        { label: "Active pattern", value: DEMO_RESULT.pattern },
                        { label: "What keeps happening", value: DEMO_RESULT.repeat },
                        { label: "Suggested response", value: DEMO_RESULT.response },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.12, duration: 0.35, ease }}
                          className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
                        >
                          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#76716b] mb-1">{item.label}</p>
                          <p className="text-[11px] text-[#f4efe9] leading-relaxed">{item.value}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Library panel */}
            {active === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col gap-0"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8a29a]/60 mb-4">Saved results</p>
                {[
                  { space: "Defrag", title: "The boundary conversation", date: "Jun 14" },
                  { space: "Alignment", title: "What is mine vs what is theirs", date: "Jun 11" },
                  { space: "Defrag", title: "After the silence at dinner", date: "Jun 9" },
                  { space: "Covenant", title: "Responsibility in family conflict", date: "Jun 7" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.35, ease }}
                    className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 group cursor-pointer hover:bg-white/[0.02] transition-colors px-2 -mx-2 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] w-16">{item.space}</span>
                      <span className="text-[11px] text-[#a8a29a] group-hover:text-[#f4efe9] transition-colors">{item.title}</span>
                    </div>
                    <span className="text-[9px] text-[#4f4b47]">{item.date}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mt-4">
        Click the panels above to explore the space
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative -mt-16 min-h-[100svh] w-full flex items-end justify-center overflow-hidden bg-[#08070a]">
        <img
          src="/hero-hand.png"
          alt="An open hand with palm facing upward into a beam of warm light"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
          style={{ zIndex: 0 }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#08070a]/60 via-transparent to-[#08070a]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-[#08070a]/20 to-transparent" />

        <Container className="relative z-10 flex flex-col items-center text-center pb-16 md:pb-24">
          <h1 className="font-serif text-[#f4efe9] text-balance text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.25rem] tracking-[-0.02em] max-w-4xl animate-fade-up">
            Healing isn&apos;t optional.
            <br />
            Holding the pain is.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed text-balance animate-fade-up delay-100">
            Sovereign.os is the private intelligence that helps you understand what is active beneath the moment — and find a clearer way through.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">
              Enter Sovereign.os
            </Link>
            <Link href="/pricing" className="btn-secondary">
              See plans
            </Link>
          </div>
        </Container>
      </section>

      {/* ── WHAT IT IS ── */}
      <section className="relative w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5 overflow-hidden">
        <div className="light-beam opacity-70" aria-hidden />
        <Container className="relative z-10">
          <MetaLabel>What Sovereign.os does</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight">
            A private notebook for the patterns that keep showing up.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-5 max-w-lg text-base md:text-lg text-[#a8a29a] leading-relaxed">
              You describe what happened. Sovereign.os shows you what is active beneath it — the pattern, the role you defaulted into, and the clearest next response. Then you save it before the moment disappears.
            </p>
          </TextReveal>

          <div className="mt-16 flex flex-col gap-0 max-w-3xl">
            {[
              {
                num: "01",
                name: "Defrag",
                href: "/product/defrag",
                copy: "Separate the moment from the pattern. See what is active beneath the argument, the silence, the message, or the grief.",
                detail: "Relational dynamics · Family roles · Boundaries · Grief · Team pressure",
              },
              {
                num: "02",
                name: "Covenant",
                href: "/product/covenant",
                copy: "Faith-context reflection anchored in responsibility. Plain-language repair and grounded discernment for what you are walking through.",
                detail: "Values · Commitments · Relational agreements · Honest next steps",
              },
              {
                num: "03",
                name: "Alignment",
                href: "/product/alignment",
                copy: "Turn insight into a usable response. See what is yours to carry and what belongs to the other side.",
                detail: "Response integration · Action choice · What to say next",
              },
            ].map((space, idx) => (
              <Link
                key={space.name}
                href={space.href}
                className="group flex items-start gap-8 py-10 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors duration-300 px-4 -mx-4 rounded-xl"
                style={{ animation: `slideUp 0.6s ease-out ${idx * 0.12}s both` }}
              >
                <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
                  <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.2em]">{space.num}</span>
                  <div className="w-px h-8 bg-white/[0.06]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl text-[#f4efe9] group-hover:text-[#f0a06a] transition-colors duration-300 mb-2">{space.name}</h3>
                  <p className="text-sm md:text-[15px] text-[#a8a29a] leading-relaxed max-w-xl mb-3">{space.copy}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">{space.detail}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#4f4b47] group-hover:text-[#f0a06a] group-hover:translate-x-1 transition-all duration-300 mt-2 shrink-0">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── INTERACTIVE SPACE PREVIEW ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-14">
            <MetaLabel>The notebook</MetaLabel>
            <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight max-w-2xl text-balance">
              Three panels. One thread. Everything connected.
            </AnimatedHeading>
            <TextReveal delay={200}>
              <p className="mt-5 max-w-md text-base text-[#a8a29a] leading-relaxed">
                Your Baseline Design is active on the left. The AI thread is in the center. Your Library is on the right. Click the panels below to see how each one works.
              </p>
            </TextReveal>
          </div>
          <SpacePreview />
        </Container>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-14 md:mb-20">
            <MetaLabel>Getting started</MetaLabel>
            <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight max-w-xl text-balance">
              From stuck to seen. In minutes.
            </AnimatedHeading>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col gap-0">
            {[
              { num: "01", title: "Create your space", copy: "Verify your email. Takes two minutes." },
              { num: "02", title: "Set your Baseline Design", copy: "Your date, time, and place of birth. Maps how you tend to respond under pressure. Private, never exposed in outputs." },
              { num: "03", title: "Describe the situation", copy: "The conversation, the silence, the message, the grief. Say it how it actually happened." },
              { num: "04", title: "Receive a structured result", copy: "See the active pattern. Find your best next response. Save it to your Library before the moment disappears." },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease }}
                className="flex items-start gap-8 py-8 border-b border-white/[0.06] last:border-0"
              >
                <span className="font-serif text-3xl text-[#e0743a]/50 shrink-0 w-10">{step.num}</span>
                <div>
                  <h3 className="text-[#f4efe9] font-medium text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-[#a8a29a] leading-relaxed">{step.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── BASELINE DESIGN ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <MetaLabel>Baseline Design</MetaLabel>
            <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] leading-tight max-w-lg">
              The longer you stay, the clearer it gets.
            </AnimatedHeading>
            <div className="mt-10 flex flex-col gap-8 max-w-md">
              {[
                { title: "Understands plain language", copy: "Say it how it actually happened. No frameworks to learn, no right way to phrase it.", delay: 200 },
                { title: "Your Baseline Design stays private", copy: "Active beneath every thread — and never exposed in outputs.", delay: 300 },
                { title: "Saves what you learn", copy: "Save to Sovereign before the moment disappears. Your Library holds what helped.", delay: 400 },
              ].map((f) => (
                <TextReveal key={f.title} delay={f.delay}>
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center border border-white/10 text-[#f0a06a]" style={{ borderRadius: 8 }}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[#f4efe9] font-medium text-[15px]">{f.title}</h3>
                      <p className="mt-1 text-sm text-[#a8a29a] leading-relaxed">{f.copy}</p>
                    </div>
                  </div>
                </TextReveal>
              ))}
            </div>
          </div>

          {/* Baseline Design visual */}
          <div className="relative order-first lg:order-last">
            <div
              className="relative w-full max-w-sm mx-auto border border-white/[0.08] bg-[#0c0a0d] overflow-hidden"
              style={{ borderRadius: 20 }}
            >
              <div className="px-5 h-10 flex items-center border-b border-white/[0.06]">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8a29a]">Your Design</p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-0">
                {[
                  { s: "I naturally move fast when something needs a decision.", chips: ["Sun in Aries", "Gate 51"] },
                  { s: "I tend to feel things deeply, even when I appear calm.", chips: ["Moon in Pisces", "Gate 55"] },
                  { s: "I feel pressure to stay reliable, even when running low.", chips: ["Saturn in Cap.", "Gate 38"] },
                ].map((item, i) => (
                  <div key={i} className="py-3 border-b border-white/[0.04] last:border-0">
                    <p className="text-[11px] text-[#c8c2bc] leading-relaxed mb-1.5">{item.s}</p>
                    <div className="flex gap-1 flex-wrap">
                      {item.chips.map(c => (
                        <span key={c} className="text-[8px] font-mono tracking-[0.1em] px-2 py-0.5 border border-white/[0.08] text-[#76716b]" style={{ borderRadius: 4 }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                <p className="text-[9px] text-[#4f4b47]">Active in every result.</p>
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#76716b]">Edit</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <MetaLabel>Questions</MetaLabel>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight">Before you begin.</h2>
          </div>
          <div className="flex flex-col">
            {[
              { q: "Is this a replacement for therapy?", a: "No. Sovereign.os is complementary — it gives you a personal way to understand your patterns and respond differently, including between sessions. It does not diagnose, predict, or replace professional judgment." },
              { q: "What is the Baseline Design?", a: "Your Baseline Design is the starting map. It shows how you tend to process, respond, connect, protect, communicate, and return to center. It is active beneath every thread and never exposed in outputs." },
              { q: "Is my data private?", a: "Yes. Your Baseline Design and everything you share are held privately, encrypted, and never sold or exposed in outputs. Private by design." },
              { q: "What is the Sovereign.os Library?", a: "The Library is the private record of what helped. Save a result to Sovereign before the moment disappears. Return to it before the old pattern takes over again." },
              { q: "What is the difference between Defrag, Covenant, and Alignment?", a: "Defrag separates the moment from the pattern. Covenant holds the faith-context layer — values, commitments, and relational agreements. Alignment turns insight into a usable next response. All three share your Baseline Design and Library." },
            ].map((item, i) => (
              <details key={i} className="group border-b border-white/[0.08] py-6 cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-[#f4efe9] text-base md:text-lg font-medium list-none">
                  {item.q}
                  <span className="flex-none text-xl text-[#e0743a] transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm md:text-base text-[#a8a29a] leading-relaxed max-w-xl">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative w-full py-24 md:py-36 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <AnimatedHeading className="text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl text-balance">
            Return before the pattern takes over.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-6 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
              Enter Sovereign.os and start understanding the patterns beneath the moments that matter most.
            </p>
          </TextReveal>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-300">
            <Link href={APP_URL} className="btn-primary">Enter Sovereign.os</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
