"use client"

import { motion } from "framer-motion"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

const PRINCIPLES = [
  {
    num: "01",
    title: "Radical Objectivity",
    body: "Sovereign.os cuts through the emotional noise. It isn't designed to just validate how you feel; it's engineered to give you the exact facts of a dynamic so you can navigate it cleanly.",
  },
  {
    num: "02",
    title: "Data over narrative",
    body: "You don't need to rehash the entire story. We map the underlying structure of the conflict — identifying what is active, what you may be carrying, and the options still available.",
  },
  {
    num: "03",
    title: "Mapping, not labeling",
    body: "We don't pathologize. The system maps your Baseline Design to show you exactly how you operate under pressure, completely free from clinical labels.",
  },
  {
    num: "04",
    title: "Immediate Utility",
    body: "Theoretical advice doesn't survive friction. Every output is designed to be instantly recognizable, deeply accurate, and ready to act on right now.",
  },
  {
    num: "05",
    title: "Built for the friction point",
    body: "This isn't a passive journal. It's a precision tool built for the exact moment before you hit send, repeat a cycle, or walk into a difficult room.",
  },
  {
    num: "06",
    title: "Zero Jargon",
    body: "Complex relational dynamics, translated into plain language. You don't need to learn a new framework — you just get the answer.",
  },
  {
    num: "07",
    title: "Edge-Private Security",
    body: "Your Baseline Design and session inputs are processed securely on Cloudflare edge infrastructure. Your personal data trains nothing. What happens in the workspace stays there.",
  },
]

export default function PrinciplesPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 bg-[#08070a] overflow-hidden">

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
              The architecture of clarity.
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
                className="group flex items-start gap-8 py-8 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.01] transition-colors -mx-4 px-4"
                style={{ borderRadius: 2 }}
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
    </SiteShell>
  )
}
