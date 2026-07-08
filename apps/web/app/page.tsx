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
      className="border border-white/[0.08] bg-white/[0.025] p-5 md:p-6 hover:border-[#e0743a]/25 transition-colors"
      style={{ borderRadius: 16 }}
    >
      <p className="font-serif text-[1.25rem] leading-snug text-[#f4efe9] tracking-[-0.01em]">{question}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-[#76716b]">{example}</p>
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
              "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(224,116,58,0.16) 0%, transparent 68%)",
              "radial-gradient(ellipse 45% 35% at 50% 55%, rgba(244,239,233,0.055) 0%, transparent 72%)",
              "linear-gradient(180deg, rgba(8,7,10,0.25) 0%, rgba(8,7,10,1) 92%)",
            ].join(", "),
          }}
        />
        <div className="absolute inset-0 pattern-field opacity-70" aria-hidden />
        <Container className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center pt-28 pb-20 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease }}
            className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#f4efe9]/35 mb-6"
          >
            Sovereign.os · human understanding system
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.06, ease }}
            className="font-serif max-w-4xl text-balance text-[#f4efe9] leading-[1.02] tracking-[-0.035em]"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6.25rem)" }}
          >
            Understand the pattern behind your experiences.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease }}
            className="mt-6 max-w-xl text-[15px] md:text-base leading-relaxed text-[#a8a29a]"
          >
            Bring the fight, the silence, the reaction, the pressure, or the decision. Sovereign turns lived experience into structured understanding and a cleaner next move.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.42, ease }}
            className="mt-9 flex flex-col sm:flex-row items-center gap-3"
          >
            <Link href={APP_URL} className="btn-primary">Build My Baseline</Link>
            <Link href="/apps/defrag/workspace" className="btn-secondary">Tell Us What Happened</Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.58, ease }}
            className="mt-14 w-full max-w-4xl"
          >
            <JourneyHeader active="experience" />
          </motion.div>
        </Container>
      </section>

      <section className="w-full py-24 md:py-36 bg-[#08070a] border-t border-white/[0.04]">
        <Container>
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">Start with the question underneath the moment</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] text-balance"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
            >
              People do not arrive with clean categories. They arrive with experiences.
            </h2>
            <p className="mt-5 text-[15px] text-[#76716b] leading-relaxed max-w-lg">
              Sovereign helps translate those experiences into the human questions that matter: what happened, why it happened, what pattern it belongs to, and what to do next.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {humanQuestions.map((item, index) => (
              <QuestionCard key={item.id} question={item.question} example={item.example} index={index} />
            ))}
          </div>
        </Container>
      </section>

      <section className="w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container>
          <div className="flex flex-col items-center text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">One journey</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] text-balance max-w-2xl"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
            >
              Baseline, Defrag, Alignment, and Covenant are not separate tools. They are deeper layers of understanding.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.06] overflow-hidden" style={{ borderRadius: 16 }}>
            {productJourney.map((space, index) => (
              <Link key={space.name} href={space.href} className="group bg-[#0c0a0d] p-7 md:p-8 hover:bg-white/[0.025] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-7">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4f4b47]">0{index + 1}</span>
                  <span className={`font-mono text-[8px] uppercase tracking-[0.14em] border px-2 py-0.5 ${space.tier === "Free" ? "border-white/[0.08] text-[#76716b]" : "border-[#e0743a]/25 text-[#e0743a]/70"}`} style={{ borderRadius: 3 }}>
                    {space.tier}
                  </span>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/65 mb-3">{space.question}</p>
                <h3 className="font-serif text-[1.45rem] text-[#f4efe9] mb-4 group-hover:text-white transition-colors">{space.name}</h3>
                <p className="text-[13px] text-[#76716b] leading-relaxed">{space.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative w-full py-28 md:py-44 bg-[#08070a] border-t border-white/[0.04] overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(224,116,58,0.07) 0%, transparent 72%)" }} aria-hidden />
        <Container className="relative z-10 flex flex-col items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-8">Start here</p>
          <h2
            className="font-serif text-[#f4efe9] tracking-[-0.025em] leading-[1.05] max-w-2xl text-balance"
            style={{ fontSize: "clamp(2.1rem, 5vw, 4.4rem)" }}
          >
            Most AI gives an answer. Sovereign builds understanding that compounds.
          </h2>
          <p className="mt-6 max-w-md text-[15px] text-[#76716b] leading-relaxed">
            Build your Baseline, bring the real moment, and leave with a cleaner next move grounded in your context.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Build My Baseline</Link>
            <Link href="/apps/defrag/workspace" className="btn-secondary">Try Defrag</Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
