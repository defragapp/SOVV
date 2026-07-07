"use client"

import { motion } from "framer-motion"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

const PRINCIPLES = [
  {
    num: "01",
    title: "Pattern over story.",
    body: "You don't need to retell the whole thing. Sovereign.os looks at what's structurally active — the loop, the role, the pressure — not the narrative you've been carrying.",
  },
  {
    num: "02",
    title: "Grounded in how you actually work.",
    body: "Your Baseline Design is the starting point. It shows how you tend to move under pressure, what you protect, and how you return to center — before the moment arrives.",
  },
  {
    num: "03",
    title: "No diagnosis. No verdict.",
    body: "The system names what's active, not what's wrong with you. There are no labels, no scores, no clinical categories. Just a clearer read on what's happening.",
  },
  {
    num: "04",
    title: "One clear next move.",
    body: "Not a list of options. Not general advice. One specific, proportionate next step — grounded in the pattern, not the pressure.",
  },
  {
    num: "05",
    title: "Built for the moment before you react.",
    body: "Before you hit send. Before you walk into the room. Before the old response takes over. That's when Sovereign.os is most useful.",
  },
  {
    num: "06",
    title: "Plain language throughout.",
    body: "No framework jargon. No therapy-coded vocabulary. The output should feel recognized, not explained — like something you already knew but couldn't quite name.",
  },
  {
    num: "07",
    title: "Private by design.",
    body: "Your Baseline Design and sessions are yours. Nothing is shared, sold, or used to train anything. What you bring here stays here.",
  },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function PrinciplesPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-20 md:pt-48 md:pb-24 bg-[#08070a] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,194,188,0.04) 0%, transparent 60%)" }}
          aria-hidden
        />

        {/* Floating orbs */}
        <div
          className="pointer-events-none absolute float"
          style={{ width: 500, height: 500, top: "-10%", right: "-5%", background: "radial-gradient(circle, rgba(200,194,188,0.03) 0%, transparent 70%)", borderRadius: "50%" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute float-slow"
          style={{ width: 300, height: 300, bottom: "10%", left: "-5%", background: "radial-gradient(circle, rgba(200,194,188,0.02) 0%, transparent 70%)", borderRadius: "50%" }}
          aria-hidden
        />

        <Container className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-[#e0743a]/50" />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Principles</span>
            </div>

            <h1 className="font-serif text-[clamp(2.8rem,7vw,5.5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-8">
              The architecture<br />
              <span className="text-[#a8a29a]">of clarity.</span>
            </h1>

            <p className="text-[#76716b] text-base leading-relaxed max-w-lg">
              The core mechanics governing how Sovereign.os processes your inputs and protects your data.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ── PRINCIPLES ── */}
      <section className="w-full bg-[#08070a]">
        <Container className="max-w-3xl">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.03, ease }}
              className={`flex items-start gap-8 py-10 ${i < PRINCIPLES.length - 1 ? "border-b border-white/[0.05]" : ""}`}
            >
              {/* Number */}
              <span
                className="font-mono text-[9px] tracking-[0.2em] shrink-0 pt-1.5 select-none"
                style={{ color: "rgba(200,194,188,0.25)", fontVariantNumeric: "tabular-nums" }}
              >
                {p.num}
              </span>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-serif text-[1.2rem] md:text-[1.35rem] text-[#f4efe9] leading-snug mb-3 tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="text-[0.875rem] text-[#76716b] leading-relaxed max-w-xl">
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-32 md:py-40 bg-[#0c0a0d] border-t border-white/[0.04] text-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {[300, 500, 700].map((size) => (
            <div key={size} className="alignment-ring absolute" style={{ width: size, height: size, left: -size/2, top: -size/2, opacity: 0.05 }} />
          ))}
        </div>
        <Container className="relative z-10 max-w-xl">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-[#f4efe9] tracking-[-0.025em] leading-tight mb-6 text-balance">
            See the pattern.<br />Choose the repair.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-10">
            Free to start. No credit card required.
          </p>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
