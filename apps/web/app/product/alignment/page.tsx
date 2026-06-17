'use client'
import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "https://app.defrag.app/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Interactive demo: shows the before/after of Alignment ─────────────────
function AlignmentDemo() {
  const examples = [
    {
      situation: "After a Defrag session — I know the pattern but I don't know what to do next.",
      insight: "You default into fixing mode when things feel unresolved. You move toward the problem before the other person is ready.",
      outputs: {
        truth: "The situation needs space, not resolution. Your urgency is yours — not a signal that action is required.",
        yours: "Managing your own anxiety about the unresolved tension.",
        theirs: "Their processing timeline. Their readiness to re-engage.",
        step: "Do nothing for 48 hours. Let the space exist without filling it.",
        avoid: "Sending a follow-up message that starts with 'I just wanted to check in…'",
      },
    },
    {
      situation: "Before a difficult conversation — I need to know what is actually mine to say.",
      insight: "You tend to over-explain when you feel misunderstood. You add context to protect yourself from being read wrong.",
      outputs: {
        truth: "Over-explaining signals anxiety, not clarity. The other person will feel the anxiety more than the explanation.",
        yours: "Saying clearly what you need. Owning your part without minimizing it.",
        theirs: "How they receive it. Whether they're ready to hear it.",
        step: "Write down the one sentence that is most true. Say that. Stop there.",
        avoid: "Starting with 'I know this might sound like…' or 'I don't want you to think…'",
      },
    },
    {
      situation: "After a conflict — I want to respond instead of react.",
      insight: "When you feel attacked, you go quiet or go hard. Neither is the response you actually want to give.",
      outputs: {
        truth: "The conflict activated a pattern, not just a disagreement. The pattern is what needs addressing.",
        yours: "Naming what you actually felt, not what you did in response to it.",
        theirs: "Their interpretation of what happened. Their unmet need underneath the conflict.",
        step: "Before you respond, write: 'What I actually felt was ___. What I actually need is ___.' Send the second sentence, not the first.",
        avoid: "Responding within 2 hours of the conflict. The pattern is still running.",
      },
    },
  ]

  const [active, setActive] = React.useState(0)
  const current = examples[active]

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Situation tabs */}
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
            {e.situation}
          </button>
        ))}
      </div>

      {/* Insight context */}
      <div className="border border-white/[0.06] bg-[#08070a] px-5 py-4 mb-3" style={{ borderRadius: 10 }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">From your Baseline Design</p>
        <p className="text-[12px] text-[#76716b] leading-relaxed italic">{current.insight}</p>
      </div>

      {/* Alignment outputs */}
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
              className={`px-5 py-4 border-b border-white/[0.05] last:border-0 ${row.highlight ? "bg-white/[0.02]" : ""}`}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-1.5">{row.label}</p>
              <p className={`text-[13px] leading-relaxed ${row.highlight ? "text-[#f4efe9]" : "text-[#a8a29a]"}`}>{row.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <p className="text-center font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mt-4">
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
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">Alignment · Pro</span>
          </div>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            Turn insight into a usable response.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            You understand what happened. Now you need to know what to do with it. Alignment shows you what is yours to carry, what belongs to the other side, and the one next step — grounded in your Baseline Design.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Alignment</Link>
            <Link href="/pricing" className="btn-secondary">See Pro plan</Link>
          </div>

          {/* When to use */}
          <div className="mt-14 border-t border-white/[0.06] pt-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">Use it when</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "You know the pattern but not the next step",
                "You need to know what is actually yours to say",
                "You want to respond instead of react",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#e0743a]/40 text-sm shrink-0 mt-0.5">→</span>
                  <p className="text-sm text-[#a8a29a] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── INTERACTIVE DEMO ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">See it work</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl text-balance">
              What Alignment actually returns.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-md">
              Five outputs. What is true, what is yours, what is theirs, one next step, and what to avoid.
            </p>
          </div>
          <AlignmentDemo />
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-32 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            Know what to do next.
          </h2>
          <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
            Open Alignment and describe what you're trying to move through. Your Baseline Design is already waiting.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Alignment</Link>
            <Link href="/pricing" className="btn-secondary">See Pro plan</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
