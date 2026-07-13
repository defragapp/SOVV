'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { JourneyHeader } from "@/components/understanding/JourneyHeader"
import { humanQuestions, productJourney } from "@/data/understanding"

const APP_URL = "/app/login"
const ease = [0.16, 1, 0.3, 1] as const

function QuestionCard({ question, example, index }: { question: string; example: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease }}
      className="group border border-white/[0.08] bg-white/[0.025] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#e0743a]/30 hover:bg-white/[0.04]"
      style={{ borderRadius: 16 }}
    >
      <p className="font-serif text-[1.25rem] leading-snug text-[#f4efe9] tracking-[-0.01em]">{question}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-[#76716b] transition-colors group-hover:text-[#a8a29a]">{example}</p>
    </motion.div>
  )
}

function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.52, ease }}
      className="relative mx-auto mt-14 w-full max-w-4xl overflow-hidden border border-white/[0.09] bg-[#0c0a0d]/90 text-left shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      style={{ borderRadius: 22 }}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 md:px-7">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#e0743a]/80" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">Defrag · live understanding</span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47]">Private</span>
      </div>

      <div className="grid gap-px bg-white/[0.05] md:grid-cols-[0.92fr_1.08fr]">
        <div className="bg-[#0c0a0d] p-6 md:p-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/65">What happened</p>
          <p className="mt-5 font-serif text-xl leading-relaxed text-[#f4efe9] md:text-2xl">
            “I asked why they felt distant. They said, ‘Not everything is about you.’”
          </p>
          <div className="mt-8 flex items-center gap-2 text-[11px] text-[#76716b]">
            <span className="h-px w-5 bg-white/10" />
            Bring the real moment. No perfect wording required.
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#0a090b] p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(224,116,58,0.10),transparent_55%)]" />
          <div className="relative">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/65">The pattern underneath</p>
            <p className="mt-5 text-[15px] leading-relaxed text-[#d2cbc4]">
              You asked for reassurance. They heard pressure. The rupture was not only the sentence — it was the different need underneath it.
            </p>
            <div className="mt-7 border-l border-[#e0743a]/35 pl-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#76716b]">Best next response</p>
              <p className="mt-2 text-sm leading-relaxed text-[#f4efe9]">
                “I wasn’t trying to corner you. I noticed distance and became uncertain. We can talk when it feels less pressured.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  return (
    <SiteShell>
      <section className="relative -mt-[68px] min-h-[100svh] overflow-hidden bg-[#08070a]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 72% 48% at 50% -4%, rgba(224,116,58,0.2) 0%, transparent 68%)",
              "radial-gradient(ellipse 42% 28% at 18% 48%, rgba(244,239,233,0.045) 0%, transparent 74%)",
              "radial-gradient(ellipse 40% 25% at 82% 60%, rgba(224,116,58,0.045) 0%, transparent 74%)",
              "linear-gradient(180deg, rgba(8,7,10,0.18) 0%, rgba(8,7,10,1) 94%)",
            ].join(", "),
          }}
        />
        <div className="absolute inset-0 pattern-field opacity-60" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-20 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/[0.025]" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-32 h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-white/[0.02]" aria-hidden />

        <Container className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center pb-24 pt-32 text-center md:pb-28 md:pt-36">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease }}
            className="mb-7 font-mono text-[9px] uppercase tracking-[0.3em] text-[#f4efe9]/40"
          >
            Sovereign.os · human understanding system
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.06, ease }}
            className="max-w-5xl text-balance font-serif leading-[0.98] tracking-[-0.045em] text-[#f4efe9]"
            style={{ fontSize: "clamp(3.1rem, 8vw, 7.4rem)" }}
          >
            See what is really happening.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.24, ease }}
            className="mt-7 max-w-2xl text-[15px] leading-relaxed text-[#a8a29a] md:text-lg"
          >
            Bring the fight, the silence, the reaction, the pressure, or the decision. Sovereign reveals the pattern underneath and helps you choose a cleaner next move.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.38 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/apps/defrag/workspace" className="btn-primary min-w-[190px]">Tell Us What Happened</Link>
            <Link href={APP_URL} className="btn-secondary min-w-[190px]">Build My Baseline</Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.48 }}
            className="mt-4 text-[11px] text-[#4f4b47]"
          >
            Start free · Private by design · No decoding required
          </motion.p>

          <ProductPreview />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.68, ease }}
            className="mt-14 w-full max-w-4xl"
          >
            <JourneyHeader active="experience" />
          </motion.div>
        </Container>
      </section>

      <section className="w-full border-t border-white/[0.04] bg-[#08070a] py-24 md:py-36">
        <Container>
          <div className="mb-12 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29a]">Start with the question underneath the moment</span>
            </div>
            <h2
              className="text-balance font-serif leading-[1.05] tracking-[-0.025em] text-[#f4efe9]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
            >
              People do not arrive with clean categories. They arrive with experiences.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#76716b]">
              Sovereign translates those experiences into the human questions that matter: what happened, why it happened, what pattern it belongs to, and what to do next.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {humanQuestions.map((item, index) => (
              <QuestionCard key={item.id} question={item.question} example={item.example} index={index} />
            ))}
          </div>
        </Container>
      </section>

      <section className="w-full border-t border-white/[0.04] bg-[#0c0a0d] py-24 md:py-36">
        <Container>
          <div className="mb-14 flex flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29a]">One journey</span>
            </div>
            <h2
              className="max-w-2xl text-balance font-serif leading-[1.05] tracking-[-0.025em] text-[#f4efe9]"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
            >
              Baseline, Defrag, Alignment, and Covenant are not separate tools. They are deeper layers of understanding.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden border border-white/[0.06] bg-white/[0.05] md:grid-cols-4" style={{ borderRadius: 16 }}>
            {productJourney.map((space, index) => (
              <Link key={space.name} href={space.href} className="group bg-[#0c0a0d] p-7 transition-all duration-300 hover:bg-white/[0.035] md:p-8">
                <div className="mb-7 flex items-start justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4f4b47]">0{index + 1}</span>
                  <span className={`border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] ${space.tier === "Free" ? "border-white/[0.08] text-[#76716b]" : "border-[#e0743a]/25 text-[#e0743a]/70"}`} style={{ borderRadius: 3 }}>
                    {space.tier}
                  </span>
                </div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/65">{space.question}</p>
                <h3 className="mb-4 font-serif text-[1.45rem] text-[#f4efe9] transition-colors group-hover:text-white">{space.name}</h3>
                <p className="text-[13px] leading-relaxed text-[#76716b] transition-colors group-hover:text-[#a8a29a]">{space.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative w-full overflow-hidden border-t border-white/[0.04] bg-[#08070a] py-28 text-center md:py-44">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(224,116,58,0.09) 0%, transparent 72%)" }} aria-hidden />
        <Container className="relative z-10 flex flex-col items-center">
          <p className="mb-8 font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47]">Start here</p>
          <h2
            className="max-w-2xl text-balance font-serif leading-[1.05] tracking-[-0.025em] text-[#f4efe9]"
            style={{ fontSize: "clamp(2.1rem, 5vw, 4.4rem)" }}
          >
            Most AI gives an answer. Sovereign builds understanding that compounds.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#76716b]">
            Bring the real moment, see the pattern underneath it, and leave with a cleaner next move grounded in your context.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/apps/defrag/workspace" className="btn-primary">Try Defrag</Link>
            <Link href={APP_URL} className="btn-secondary">Build My Baseline</Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
