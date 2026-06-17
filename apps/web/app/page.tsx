'use client'

import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "https://app.defrag.app/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Interactive space preview ──────────────────────────────────────────────
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
      if (i < DEMO_INPUT.length) { setTyped(DEMO_INPUT.slice(0, i + 1)); i++ }
      else { clearInterval(interval); setTimeout(() => setShowResult(true), 600) }
    }, 26)
    return () => clearInterval(interval)
  }, [active])

  const panels = [
    { id: "context" as const, label: "Context", desc: "Your Baseline Design — active in every thread" },
    { id: "thread" as const, label: "Defrag", desc: "Describe the moment. See the pattern." },
    { id: "library" as const, label: "Library", desc: "Save what helped. Return before the pattern takes over." },
  ]

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div
        className="pointer-events-none absolute -inset-px"
        style={{ borderRadius: 20, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.10) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="relative border border-white/[0.08] bg-[#0c0a0d] overflow-hidden shadow-2xl" style={{ borderRadius: 18 }}>
        {/* Titlebar */}
        <div className="h-10 border-b border-white/[0.06] bg-[#08070a]/80 flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => <span key={i} className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />)}
          </div>
          <div className="flex-1 flex justify-center">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#4f4b47]">Sovereign.os</span>
          </div>
          <div className="flex gap-0.5">
            {panels.map(p => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] uppercase transition-all duration-200 ${
                  active === p.id ? "bg-white/[0.08] text-[#f4efe9]" : "text-[#4f4b47] hover:text-[#76716b]"
                }`}
                style={{ borderRadius: 5 }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel label */}
        <div className="px-5 py-2 border-b border-white/[0.04] bg-[#08070a]/40">
          <AnimatePresence mode="wait">
            <motion.p key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#e0743a]/50">
              {panels.find(p => p.id === active)?.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="min-h-[280px] p-5">
          <AnimatePresence mode="wait">

            {active === "context" && (
              <motion.div key="context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }} className="flex flex-col gap-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8a29a]/50 mb-4">Your Design</p>
                {[
                  { s: "I naturally move fast when something needs a decision — sometimes before others are ready.", chips: ["Sun in Aries", "Gate 51"] },
                  { s: "I tend to feel things deeply, even when I appear calm on the surface.", chips: ["Moon in Pisces", "Gate 55"] },
                  { s: "I feel pressure to stay reliable, even when I'm running low.", chips: ["Saturn in Cap.", "Gate 38"] },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3, ease }}
                    className="py-3 border-b border-white/[0.04] last:border-0">
                    <p className="text-[11px] text-[#c8c2bc] leading-relaxed mb-1.5">{item.s}</p>
                    <div className="flex gap-1 flex-wrap">
                      {item.chips.map(c => (
                        <span key={c} className="text-[8px] font-mono tracking-[0.1em] px-2 py-0.5 border border-white/[0.08] text-[#76716b]" style={{ borderRadius: 3 }}>{c}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
                <p className="text-[9px] text-[#4f4b47] mt-3">Active in every result.</p>
              </motion.div>
            )}

            {active === "thread" && (
              <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }} className="flex flex-col gap-3">
                <div className="border border-white/[0.08] bg-white/[0.02] p-3" style={{ borderRadius: 10 }}>
                  <p className="text-[12px] text-[#f4efe9] leading-relaxed min-h-[36px]">
                    {typed}<span className="inline-block w-0.5 h-3.5 bg-[#f4efe9]/60 ml-0.5 animate-pulse" />
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#4f4b47]">↵ Defrag</span>
                  </div>
                </div>
                <AnimatePresence>
                  {showResult && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="border border-white/[0.08] bg-white/[0.02] overflow-hidden" style={{ borderRadius: 10 }}>
                      {[
                        { label: "Active pattern", value: DEMO_RESULT.pattern },
                        { label: "What keeps happening", value: DEMO_RESULT.repeat },
                        { label: "Suggested response", value: DEMO_RESULT.response },
                      ].map((row, i) => (
                        <motion.div key={row.label} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.3, ease }}
                          className="px-4 py-3 border-b border-white/[0.04] last:border-0">
                          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#e0743a]/50 mb-1">{row.label}</p>
                          <p className="text-[11px] text-[#f4efe9] leading-relaxed">{row.value}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {active === "library" && (
              <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }} className="flex flex-col gap-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8a29a]/50 mb-4">Saved results</p>
                {[
                  { space: "Defrag", title: "The boundary conversation", date: "Jun 14" },
                  { space: "Alignment", title: "What is mine vs what is theirs", date: "Jun 11" },
                  { space: "Defrag", title: "After the silence at dinner", date: "Jun 9" },
                  { space: "Covenant", title: "Responsibility in family conflict", date: "Jun 7" },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease }}
                    className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 group cursor-pointer hover:bg-white/[0.02] transition-colors px-2 -mx-2" style={{ borderRadius: 6 }}>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] w-14">{item.space}</span>
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
      <p className="text-center font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mt-4">
        Click the panels above to explore the space
      </p>
    </div>
  )
}

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
          <p className="mt-7 max-w-lg text-base md:text-lg text-[#c8c2ba] leading-relaxed text-balance animate-fade-up delay-100">
            Sovereign.os is a private notebook for the patterns that keep showing up — in your relationships, your family, your messages, and your grief. Describe the moment. See what's actually active. Find the clearest way through.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Enter Sovereign.os — Free</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

      {/* ── THREE SPACES ── */}
      <section className="relative w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5 overflow-hidden">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-10">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">Three spaces</span>
          </div>

          <div className="flex flex-col gap-0 max-w-3xl">
            {[
              {
                num: "01", name: "Defrag", href: "/product/defrag", tier: "Free",
                headline: "Separate the moment from the pattern.",
                body: "Something happened. You don't know if you overreacted or if this is the same thing that always happens. Defrag shows you what is actually active — and gives you the clearest next response.",
                tags: "Arguments · Messages · Family roles · Boundaries · Grief",
              },
              {
                num: "02", name: "Covenant", href: "/product/covenant", tier: "Pro",
                headline: "Your moment has been walked before.",
                body: "Covenant connects what you're going through to the real human stories in Scripture. It finds the biblical figure who walked something like what you're facing and gives you one honest next step.",
                tags: "Faith · Values · Commitments · Repair",
              },
              {
                num: "03", name: "Alignment", href: "/product/alignment", tier: "Pro",
                headline: "Turn insight into a usable response.",
                body: "You understand what happened. Now you need to know what to do with it. Alignment shows you what is yours to carry, what belongs to the other side, and the one next step.",
                tags: "After Defrag · Before a hard conversation · After a conflict",
              },
            ].map((space, idx) => (
              <Link
                key={space.name}
                href={space.href}
                className="group flex items-start gap-8 py-10 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors duration-300 px-4 -mx-4"
                style={{ borderRadius: 12 }}
              >
                <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
                  <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em]">{space.num}</span>
                  <div className="w-px h-8 bg-white/[0.06]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-2xl text-[#f4efe9] group-hover:text-[#f0a06a] transition-colors duration-300">{space.name}</h3>
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.12em] border px-2 py-0.5"
                      style={{
                        borderRadius: 3,
                        color: space.tier === "Free" ? "rgba(168,162,154,0.6)" : "rgba(224,116,58,0.6)",
                        borderColor: space.tier === "Free" ? "rgba(255,255,255,0.08)" : "rgba(224,116,58,0.2)",
                      }}
                    >
                      {space.tier}
                    </span>
                  </div>
                  <p className="text-base text-[#f4efe9]/70 mb-2 leading-snug">{space.headline}</p>
                  <p className="text-sm text-[#a8a29a] leading-relaxed mb-3 max-w-xl">{space.body}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">{space.tags}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#4f4b47] group-hover:text-[#f0a06a] group-hover:translate-x-1 transition-all duration-300 mt-2 shrink-0">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── INTERACTIVE NOTEBOOK PREVIEW ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">The notebook</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl text-balance">
              Three panels. One thread. Everything connected.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-md">
              Your Baseline Design is on the left. The AI thread is in the center. Your Library is on the right. Click the panels to see how each one works.
            </p>
          </div>
          <SpacePreview />
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-3xl text-balance">
            Return before the pattern takes over.
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
            Defrag is free. Start understanding the patterns beneath the moments that matter most.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Enter Sovereign.os — Free</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
