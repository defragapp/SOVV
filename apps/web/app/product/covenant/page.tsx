'use client'
import Link from "next/link"
import { MotionLink, MotionButton } from "@/components/ui/motion-button"
import * as React from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import { motion, AnimatePresence } from "framer-motion"
import type { Metadata } from "next"

const APP_URL = "https://app.defrag.app/app/login"
const ease = [0.16, 1, 0.3, 1] as const

// ── Interactive demo: shows how Covenant works ─────────────────────────────
// User picks a feeling → sees the biblical match → sees what Covenant gives them
function CovenantDemo() {
  const situations = [
    {
      feeling: "I feel betrayed by someone I trusted.",
      figure: "David",
      ref: "Psalms 55, 2 Samuel 15",
      story: "David was betrayed by his closest advisor, Ahithophel, and his own son. He didn't pretend it didn't hurt. He brought the full weight of it to God — and kept moving.",
      forYou: "You don't have to minimize what happened. Name it honestly. Then ask: what is the next faithful step, not the next reactive one?",
      step: "Write down exactly what was broken. Don't soften it. Then ask: what would it look like to respond from strength instead of wound?",
    },
    {
      feeling: "I feel overwhelmed. I can't carry this alone.",
      figure: "Moses",
      ref: "Exodus 18, Numbers 11",
      story: "Moses was leading millions of people and burning out. His father-in-law saw it and told him plainly: you can't do this alone. Moses listened and delegated.",
      forYou: "Overwhelm is often a sign you're carrying what was meant to be shared. The question isn't how to endure more — it's who should be carrying this with you.",
      step: "Name one thing you're carrying that someone else could hold. Then ask them.",
    },
    {
      feeling: "I feel unseen. Like what I do doesn't matter.",
      figure: "Hagar",
      ref: "Genesis 16, 21",
      story: "Hagar was cast out, alone in the desert with her son. God found her there — not in a temple, not in a crowd. He called her by name and said: I see you.",
      forYou: "Being unseen by people doesn't mean you're unseen by God. The question is: are you looking for recognition in the right place?",
      step: "Sit with this: where are you looking to be seen? Is that the right source?",
    },
    {
      feeling: "I feel stuck. I don't know what I'm supposed to do next.",
      figure: "Abraham",
      ref: "Genesis 12, Hebrews 11",
      story: "Abraham left everything he knew without knowing where he was going. The text says he went out, not knowing. That wasn't failure — it was faith in motion.",
      forYou: "Stuck often means waiting for certainty before moving. But the next step rarely comes with a guarantee. It comes with a direction.",
      step: "What is the smallest honest move you could make today — even without knowing what comes after it?",
    },
  ]

  const [active, setActive] = React.useState(0)
  const [phase, setPhase] = React.useState(0)
  const current = situations[active]

  React.useEffect(() => {
    setPhase(0)
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [active])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Situation selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {situations.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`text-left p-3 border transition-all duration-200 text-[11px] leading-relaxed rounded-sm ${
              active === i
                ? "border-[#e0743a]/40 bg-[#e0743a]/5 text-[#f4efe9]"
                : "border-white/[0.06] text-[#76716b] hover:border-white/[0.12] hover:text-[#a8a29a]"
            }`}
          >
            {s.feeling}
          </button>
        ))}
      </div>

      {/* Result panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease }}
          className="ios-panel overflow-hidden"
        >
          {phase === 0 && (
            <div className="p-6 animate-pulse">
               <div className="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-4">
                  <div className="h-4 bg-white/[0.05] rounded-sm w-1/4"></div>
                  <div className="h-2 bg-white/[0.05] rounded-sm w-1/6"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-1/2 mb-3"></div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-full mb-2"></div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-full"></div>
                  </div>
                  <div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-1/2 mb-3"></div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-full mb-2"></div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-full"></div>
                  </div>
                  <div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-1/2 mb-3"></div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-full mb-2"></div>
                    <div className="h-2 bg-white/[0.05] rounded-sm w-full"></div>
                  </div>
               </div>
            </div>
          )}
          {phase >= 1 && (
            <motion.div
              initial={{ filter: "blur(8px)", opacity: 0.5 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1">Your moment matches</p>
                  <p className="font-serif text-xl text-[#f4efe9]">{current.figure}</p>
                </div>
                <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em]">{current.ref}</span>
              </div>

              {/* Three columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
                <div className="p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-3">Their story</p>
                  <p className="text-[13px] text-[#a8a29a] leading-relaxed">{current.story}</p>
                </div>
                <div className="p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-3">What this means for you</p>
                  <p className="text-[13px] text-[#a8a29a] leading-relaxed">{current.forYou}</p>
                </div>
                {phase === 2 ? (
                  <motion.div
                    initial={{ opacity: 0, backgroundColor: "rgba(255,255,255,0.05)" }}
                    animate={{ opacity: 1, backgroundColor: "transparent" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="p-6 bg-white/[0.02]"
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-3">One grounded next step</p>
                    <p className="text-[13px] text-[#f4efe9] leading-relaxed font-medium">{current.step}</p>
                  </motion.div>
                ) : (
                  <div className="p-6"></div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-center font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mt-4">
        Select a situation above to see how Covenant responds
      </p>
    </div>
  )
}

export default function CovenantProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] via-[#08070a] to-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-6 bg-[#e0743a]/60" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">Covenant · Pro</span>
          </div>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            Your moment has been walked before.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            Covenant connects what you're going through to the real human stories in Scripture — not as metaphor, but as lived experience. It finds the biblical figure who walked something like what you're facing, shows you what they learned, and gives you one honest next step.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <MotionLink href={APP_URL} className="btn-primary">Open Covenant</MotionLink>

          </div>

          {/* Three facts — no icons, no cards */}
          <div className="mt-14 flex flex-col gap-0 border-t border-white/[0.06] pt-10">
            {[
              { label: "Doesn't preach", body: "No judgment. No assumptions about your beliefs. Just the story and what it means for you." },
              { label: "Plain language", body: "No theology jargon. The stories are told the way they actually happened — human, honest, and direct." },
              { label: "One next step", body: "Not a list. Not a lecture. One real, doable thing that fits the story you're in." },
            ].map((f, i) => (
              <div key={i} className="flex flex-col md:flex-row items-baseline gap-4 md:gap-12 py-8 border-b border-white/[0.06] last:border-0">
                <span className="font-serif text-3xl md:text-5xl text-white/[0.1] w-12 shrink-0">0{i + 1}</span>
                <div>
                  <p className="text-[#f4efe9] font-medium text-sm mb-2">{f.label}</p>
                  <p className="text-sm text-[#76716b] leading-relaxed max-w-xl">{f.body}</p>
                </div>
              </div>
            ))}
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
              Pick a situation. See the story.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-md">
              This is how Covenant responds — matching your moment to Scripture, then showing you what it means for you today.
            </p>
          </div>
          <CovenantDemo />
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] via-[#08070a] to-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            You're not the first person to walk this path.
          </h2>
          <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
            Open Covenant and describe what you're walking through. Scripture has been here before.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <MotionLink href={APP_URL} className="btn-primary">Open Covenant</MotionLink>

          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
