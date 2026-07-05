"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

const PRINCIPLES = [
  {
    num: "01",
    title: "Pattern over story",
    body: "You don't need to retell the whole thing. Sovereign.os looks at what's structurally active — the loop, the role, the pressure — not the narrative you've been carrying.",
  },
  {
    num: "02",
    title: "Grounded in how you actually work",
    body: "Your Baseline Design is the starting point. It shows how you tend to move under pressure, what you protect, and how you return to center — before the moment arrives.",
  },
  {
    num: "03",
    title: "No diagnosis. No verdict.",
    body: "The system names what's active, not what's wrong with you. There are no labels, no scores, no clinical categories. Just a clearer read on what's happening.",
  },
  {
    num: "04",
    title: "One clear next move",
    body: "Not a list of options. Not general advice. One specific, proportionate next step — grounded in the pattern, not the pressure.",
  },
  {
    num: "05",
    title: "Built for the moment before you react",
    body: "Before you hit send. Before you walk into the room. Before the old response takes over. That's when Sovereign.os is most useful.",
  },
  {
    num: "06",
    title: "Plain language throughout",
    body: "No framework jargon. No therapy-coded vocabulary. The output should feel recognized, not explained — like something you already knew but couldn't quite name.",
  },
  {
    num: "07",
    title: "Private by design",
    body: "Your Baseline Design and sessions are yours. Nothing is shared, sold, or used to train anything. What you bring here stays here.",
  },
]

export default function PrinciplesPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 bg-[#08070a] overflow-hidden pattern-field">

        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="ambient-blob absolute w-[600px] h-[600px] opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, #c8c2bc 0%, transparent 70%)",
              top: "-10%",
              right: "-5%",
            }}
          />
          <div
            className="ambient-blob-2 absolute w-[400px] h-[400px] opacity-[0.02]"
            style={{
              background: "radial-gradient(circle, #c8c2bc 0%, transparent 70%)",
              bottom: "10%",
              left: "-5%",
            }}
          />
        </div>

        <Container className="relative z-10 max-w-3xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-20"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8c2bc]/50 mb-6">
              Principles
            </p>
            <h1 className="font-serif text-[#f4efe9] text-3xl md:text-5xl tracking-[-0.02em] leading-tight mb-5">
              <span className="text-glow">The architecture</span> of clarity.
            </h1>
            <p className="text-base text-[#76716b] leading-relaxed max-w-lg">
              The core mechanics governing how Sovereign.os processes your inputs and protects your data.
            </p>
          </motion.div>

          {/* Principles list */}
          <div className="flex flex-col gap-0">
            {PRINCIPLES.map((p, idx) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-start gap-8 py-8 border-b border-white/[0.05] last:border-0 glow-card-hover -mx-4 px-4"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {/* Number */}
                <span
                  className="font-mono text-[11px] tracking-[0.2em] shrink-0 mt-1 select-none"
                  style={{ color: "rgba(200, 194, 188, 0.35)", fontVariantNumeric: "tabular-nums" }}
                >
                  {p.num}
                </span>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-serif text-[1rem] text-[#f4efe9] mb-2 group-hover:text-[#c8c2bc] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-[13px] text-[#76716b] leading-[1.7] max-w-xl">
                    {p.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </Container>
      </section>
      {/* CTA */}
      <section className="relative w-full py-20 bg-[#08070a] border-t border-white/[0.04] text-center overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <div className="mx-auto max-w-[1280px] px-6 relative z-10 flex flex-col items-center">
          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] mb-5 text-balance max-w-xl leading-tight">
            See the pattern. Choose the repair.
          </h2>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}
