'use client'
import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Sky + Baseline visual ──────────────────────────────────────────────────
// Shows the two inputs Alignment uses — Baseline Design + live sky
function BaselineAndSky() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">

      {/* Baseline Design */}
      <div className="border border-white/[0.08] bg-[#0c0a0d] overflow-hidden" style={{ borderRadius: 14 }}>
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8a29a]/60">Your Baseline Design</p>
          <p className="text-[11px] text-[#4f4b47] mt-0.5">Apr 3 1990 · 7:42 AM · Chicago</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {[
            { s: "I move fast when something needs a decision — sometimes before others are ready.", chips: ["Sun in Aries", "Gate 51"] },
            { s: "I feel things deeply, even when I appear calm on the surface.", chips: ["Moon in Pisces", "Gate 55"] },
            { s: "I feel pressure to stay reliable, even when I'm running low.", chips: ["Saturn in Cap.", "Gate 38"] },
          ].map((item, i) => (
            <div key={i} className="pb-3 border-b border-white/[0.04] last:border-0">
              <p className="text-[10px] text-[#a8a29a] leading-relaxed mb-1.5">{item.s}</p>
              <div className="flex gap-1 flex-wrap">
                {item.chips.map(c => (
                  <span key={c} className="text-[7px] font-mono tracking-[0.1em] px-1.5 py-0.5 border border-white/[0.08] text-[#76716b]" style={{ borderRadius: 3 }}>{c}</span>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[9px] text-[#4f4b47]">Your fixed center. Always active.</p>
        </div>
      </div>

      {/* Live sky */}
      <div className="border border-white/[0.08] bg-[#0c0a0d] overflow-hidden" style={{ borderRadius: 14 }}>
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8a29a]/60">Live Sky · Right Now</p>
          <p className="text-[11px] text-[#4f4b47] mt-0.5">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · Your location</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {[
            { label: "Moon in Scorpio", note: "Emotional intensity is heightened. What feels urgent may be amplified." },
            { label: "Mars square Saturn", note: "Pressure to act meets resistance. This is not the moment to force." },
            { label: "Venus trine Neptune", note: "Compassion is available. Lead from there, not from the wound." },
          ].map((item, i) => (
            <div key={i} className="pb-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1 h-1 rounded-sm bg-[#e0743a]/50 shrink-0" />
                <p className="text-[10px] text-[#f4efe9]">{item.label}</p>
              </div>
              <p className="text-[10px] text-[#76716b] leading-relaxed pl-3">{item.note}</p>
            </div>
          ))}
          <p className="text-[9px] text-[#4f4b47]">The weather you're moving through. Changes daily.</p>
        </div>
      </div>

    </div>
  )
}

// ── Alignment demo ─────────────────────────────────────────────────────────
function AlignmentDemo() {
  const examples = [
    {
      situation: "I keep saying yes to things I don't want to do. I don't know how to stop.",
      context: "Moon in Scorpio amplifies the fear of what happens if you disappoint someone. Your Saturn in Cap. is pushing you to hold the line — but your Gate 55 is absorbing the emotional weight of the ask.",
      outputs: {
        truth: "You're not saying yes because you want to. You're saying yes because the cost of no feels higher than the cost of yes. That math is wrong — and your body already knows it.",
        yours: "Setting the boundary. Saying the no. Holding it without over-explaining.",
        theirs: "Their reaction to the no. Their disappointment. Their adjustment.",
        step: "The next time you feel the pull to say yes, say: 'Let me get back to you.' Then actually decide — from your own center, not from their expectation.",
        avoid: "Saying yes and then resenting it. Saying no and then apologizing for it.",
      },
    },
    {
      situation: "I had a hard conversation with my partner last night. I said things I didn't mean. I don't know how to come back from it.",
      context: "Mars square Saturn is creating friction between the impulse to act and the need to slow down. Your Moon in Pisces absorbed the emotional charge of the conversation — you're still carrying it.",
      outputs: {
        truth: "You said things you didn't mean because you were speaking from the wound, not from what's actually true. That's recoverable. What you said isn't who you are — it's what the pattern does under pressure.",
        yours: "Owning what you said without minimizing it. Naming what was actually happening for you.",
        theirs: "Whether they're ready to receive the repair. Their own processing timeline.",
        step: "Don't try to fix it tonight. Write down: what was I actually feeling when I said that? Then, when they're ready, say that — not the words you used, but what was underneath them.",
        avoid: "Over-explaining. Apologizing so much that the apology becomes about your guilt instead of their hurt.",
      },
    },
    {
      situation: "I'm about to make a big decision and I don't know if I'm thinking clearly or just reacting.",
      context: "Venus trine Neptune is opening a window of clarity — but your Sun in Aries wants to move before the window closes. Your Gate 51 is activated: the impulse to initiate is strong right now.",
      outputs: {
        truth: "The urgency you feel is real — but it's not a signal that the decision needs to happen now. It's a signal that something in you is ready to move. Those are different things.",
        yours: "Deciding from your own values, not from the pressure of the moment.",
        theirs: "The timeline. The outcome. What happens after you decide.",
        step: "Write down the decision as if you've already made it. Live with that for 48 hours. If it still feels right, it probably is.",
        avoid: "Deciding because the window feels like it's closing. The right decision doesn't expire.",
      },
    },
  ]

  const [active, setActive] = React.useState(0)
  const current = examples[active]

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        {examples.map((e, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`text-left px-4 py-3 border text-[12px] leading-relaxed transition-all duration-200 ${
              active === i
                ? "border-[#e0743a]/40 bg-[#e0743a]/5 text-[#f4efe9]"
                : "border-white/[0.06] text-[#76716b] hover:border-white/[0.12] hover:text-[#a8a29a]"
            }`}
            style={{ borderRadius: 8 }}
          >
            "{e.situation}"
          </button>
        ))}
      </div>

      {/* Sky + Baseline context */}
      <div className="border border-white/[0.06] bg-[#08070a] px-5 py-4 mb-3" style={{ borderRadius: 10 }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Baseline Design + Live Sky</p>
        <p className="text-[12px] text-[#76716b] leading-relaxed">{current.context}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="border border-white/[0.08] bg-[#0c0a0d] overflow-hidden"
          style={{ borderRadius: 14 }}
        >
          {[
            { label: "What is true", value: current.outputs.truth },
            { label: "What is yours to carry", value: current.outputs.yours },
            { label: "What belongs to them", value: current.outputs.theirs },
            { label: "One next step", value: current.outputs.step, highlight: true },
            { label: "What to avoid", value: current.outputs.avoid },
          ].map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease }}
              className={`px-5 py-4 border-b border-white/[0.05] last:border-0 ${(row as any).highlight ? "bg-white/[0.02]" : ""}`}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-1.5">{row.label}</p>
              <p className={`text-[13px] leading-relaxed ${(row as any).highlight ? "text-[#f4efe9]" : "text-[#a8a29a]"}`}>{row.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mt-4">
        Select a situation above to see how Alignment responds
      </p>
    </div>
  )
}

export default function AlignmentProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Alignment · Pro</span>
          </div>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            <span className="text-glow">Turn recognition</span> into practice.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            Life pulls you off course. A conversation, a conflict, a decision — and suddenly you're reacting from somewhere that isn't you. Alignment uses two things to show you the path back: your Baseline Design, and the live sky above you right now.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Alignment</Link>

          </div>

          {/* The two inputs */}
          <div className="mt-14 border-t border-white/[0.06] pt-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-6">Two things Alignment uses</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.06] rounded-sm overflow-hidden">
              <div className="bg-[#0c0a0d] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e0743a]/60 border border-white/[0.06] px-2 py-1 rounded-sm">Fixed Data</span>
                </div>
                <p className="text-[13px] text-[#f4efe9] mb-2">Your Baseline Design</p>
                <p className="text-sm text-[#76716b] leading-relaxed">
                  Your fixed center. How you tend to process, respond, and return to yourself under pressure. Derived from your birth data. Active in every result. Never changes.
                </p>
              </div>
              <div className="bg-[#0c0a0d] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#a8a29a]/60 border border-white/[0.06] px-2 py-1 rounded-sm">Live Sky</span>
                </div>
                <p className="text-[13px] text-[#f4efe9] mb-2">The live sky above you</p>
                <p className="text-sm text-[#76716b] leading-relaxed">
                  The current planetary weather — the emotional tone of the moment you're in. Changes daily. Tells Alignment whether this is a moment to move, to wait, or to lead with compassion.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── VISUAL: BASELINE + SKY ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Your two inputs</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl text-balance">
              <span className="text-glow">Your fixed center.</span> The moving sky.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-lg">
              Your Baseline Design is who you are when you're most yourself. The live sky is the weather you're moving through right now. Alignment holds both — and shows you the path that stays true to you.
            </p>
          </div>
          <BaselineAndSky />
        </Container>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">See it work</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl text-balance">
              <span className="text-glow">What Alignment</span> actually returns.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-md">
              Five outputs — grounded in your Baseline Design and the live sky. What is true, what is yours, what is theirs, one next step, and what to avoid.
            </p>
          </div>
          <AlignmentDemo />
        </Container>
      </section>

      {/* ── CTA ── */}
      {/* When to use */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">When to use Alignment</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              After the insight. Before the next move.
            </h2>
            <p className="mt-4 text-[15px] text-[#76716b] leading-relaxed max-w-lg">
              Use Alignment when you understand what happened but need to know how to respond — what's yours to carry, what isn't, and what a clean next step looks like.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { trigger: "After a Defrag session", desc: "You've seen the pattern. Now shape the response." },
              { trigger: "Before a hard conversation", desc: "Know what's yours to say and what belongs to the other side." },
              { trigger: "After a conflict", desc: "Separate what happened from what you're responsible for." },
              { trigger: "When you've said yes but meant no", desc: "Find the boundary that keeps you clear without hardening." },
              { trigger: "When you're carrying too much", desc: "See what's actually yours and what you've taken on unnecessarily." },
              { trigger: "Before a major decision", desc: "Align the choice with your values, not just the pressure." },
            ].map((item, i) => (
              <div key={i} className="border border-white/[0.06] bg-[#0c0a0d] p-5 glow-card-hover" style={{ borderRadius: 10 }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-2">{item.trigger}</p>
                <p className="text-[13px] text-[#a8a29a] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            <span className="text-glow">Back into</span> your own lane.
          </h2>
          <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
            Open Alignment and describe what you're trying to move through. Your Baseline Design and the live sky are already waiting.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Alignment</Link>

          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
