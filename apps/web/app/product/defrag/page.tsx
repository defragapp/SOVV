'use client'
import Link from "next/link"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"

const APP_URL = "/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Interactive demo: shows a real Defrag result ───────────────────────────
function DefragDemo() {
  const scenarios = [
    {
      input: "She went quiet after I said that. I don't know if I crossed a line or if she's just processing.",
      result: {
        pattern: "You moved fast when the silence felt like rejection — before you could find out what it actually meant.",
        repeat: "You interpret quiet as withdrawal, then act to close the gap before it's confirmed.",
        mode: "When something feels unresolved, you move toward it immediately—even when the other person needs space.",
        response: "Wait one full day before following up. Let her process without your anxiety filling the space.",
      },
    },
    {
      input: "My dad made a comment at dinner that I can't stop thinking about. I don't know why it hit so hard.",
      result: {
        pattern: "The comment landed on an existing vulnerability that predates this interaction.",
        repeat: "A minor interaction carries the accumulated weight of past interactions.",
        mode: "You internalize statements and replay them to extract deeper meaning.",
        response: "Ask yourself: what would I need to hear from him that I've never heard? That's what the comment is really about.",
      },
    },
    {
      input: "I keep saying yes to things I don't want to do. I don't know how to stop.",
      result: {
        pattern: "You are absorbing external friction at the cost of your own capacity.",
        repeat: "Declining feels more dangerous than the cost of conceding.",
        mode: "You previously learned that stabilizing others preserved safety. That mechanism is still active.",
        response: "The next time you feel the pull to say yes, pause for 24 hours before responding. The discomfort you're avoiding is theirs to hold.",
      },
    },
  ]

  const [active, setActive] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const current = scenarios[active]

  React.useEffect(() => {
    setRevealed(false)
    const t = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Scenario tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 text-left px-4 py-2.5 border text-[11px] leading-snug transition-all duration-200 max-w-[200px] ${
              active === i
                ? "border-[#e0743a]/40 bg-[#e0743a]/5 text-[#f4efe9]"
                : "border-white/[0.06] text-[#76716b] hover:border-white/[0.12] hover:text-[#a8a29a]"
            }`}
            style={{ borderRadius: 8 }}
          >
            {s.input.slice(0, 60)}…
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border border-white/[0.08] bg-[#0c0a0d] p-5 mb-3" style={{ borderRadius: 14 }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">What you described</p>
        <p className="text-[14px] text-[#f4efe9] leading-relaxed">{current.input}</p>
        <div className="flex justify-end mt-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#4f4b47]">↵ Defrag</span>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="border border-white/[0.08] bg-[#0c0a0d] overflow-hidden"
            style={{ borderRadius: 14 }}
          >
            {[
              
            ].map((row: any, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease }}
                className={`px-5 py-4 border-b border-white/[0.05] last:border-0 ${row.highlight ? "bg-white/[0.02]" : ""}`}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-1.5">{row.label}</p>
                <p className={`text-[13px] leading-relaxed ${row.highlight ? "text-[#f4efe9]" : "text-[#a8a29a]"}`}>{row.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mt-4">
        Select a scenario above to see a real Defrag result
      </p>
    </div>
  )
}

export default function DefragProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">Defrag · Free</span>
          </div>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            Separate the moment from the pattern.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            Something happened. You don't know if you overreacted, if they crossed a line, or if this is the same thing that always happens. Defrag shows you what is actually active — and gives you the clearest next response.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Defrag — Free</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>

          {/* What it works on */}
          <div className="mt-14 border-t border-white/[0.06] pt-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">Works on</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Arguments that keep repeating",
                "Messages you don't know how to answer",
                "Family roles you keep falling into",
                "Boundaries you can't hold",
                "Grief that changes the room",
                "Team dynamics that slow things down",
                "Conversations you keep rehearsing",
                "Silence that feels like rejection",
              ].map((item) => (
                <span
                  key={item}
                  className="text-[11px] text-[#76716b] border border-white/[0.06] px-3 py-1.5"
                  style={{ borderRadius: 6 }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── LIVE DEMO ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">See it work</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl text-balance">
              Real inputs. Real results.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-md">
              This is what Defrag actually returns — four structured outputs that show you what's active and what to do next.
            </p>
          </div>
          <DefragDemo />
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-32 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            See what is actually active.
          </h2>
          <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
            Defrag is free. Open it and describe the moment. Your Baseline Design is already waiting.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Defrag — Free</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
