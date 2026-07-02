'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

const APP_URL = "/app/login"

const productSpaces = [
  {
    name: "Defrag",
    href: "/product/defrag",
    label: "See the loop",
    body: "Name the pattern inside a hard moment, separate pressure from signal, and choose the repair that fits.",
  },
  {
    name: "Alignment",
    href: "/product/alignment",
    label: "Return to signal",
    body: "Notice the forced yes, delayed truth, over-explanation, or quiet self-abandonment before it speaks for you.",
  },
  {
    name: "Covenant",
    href: "/product/covenant",
    label: "Reveal the repeat",
    body: "Look at what a relationship keeps rehearsing, without keeping score, so repair can begin with a clear next step.",
  },
  {
    name: "Baseline",
    href: APP_URL,
    label: "Start here",
    body: "Understand how you move through pressure, choice, conflict, care, and repair before the next moment arrives.",
  },
]

const campaignVideos = [
  {
    title: "You Are Not Broken",
    purpose: "Emotional category hook",
    scene: "A quiet pause after a hard conversation. The phone is dark. The pressure is visible.",
    line: "You are not broken. You are patterned.",
  },
  {
    title: "Everyone Has an Operating System",
    purpose: "Category definition",
    scene: "Rereading a text, pausing before a call, saying yes while your body says no.",
    line: "How you protect. How you love. How you disappear. How you return.",
  },
  {
    title: "Defrag the Loop",
    purpose: "Defrag intro",
    scene: "Type, delete, overthink, lock the phone, feel guilty, repeat the next day.",
    line: "See the loop before it runs you again.",
  },
  {
    title: "Understand What Got Touched",
    purpose: "Core use case",
    scene: "A small message lands bigger than expected, and the reaction starts before the reply.",
    line: "Understand what got touched before you react.",
  },
  {
    title: "Return to Alignment",
    purpose: "Alignment intro",
    scene: "A long text becomes one honest sentence after a real pause.",
    line: "Notice when you leave yourself. Return before the pattern speaks.",
  },
  {
    title: "Covenant",
    purpose: "Relationship-space intro",
    scene: "Two people sit in the same room with the same old silence between them.",
    line: "Reveal what keeps repeating and where repair can begin.",
  },
  {
    title: "Baseline",
    purpose: "Foundation explainer",
    scene: "One person moves through pressure, choice, conflict, care, and repair across ordinary moments.",
    line: "Start with your baseline.",
  },
]

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

export default function Home() {
  return (
    <SiteShell>
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#08070a]">
        {/* Base image — cinematic hand with warm light */}
        <picture>
          <source srcSet="/hero-hand.webp" type="image/webp" media="(min-width: 768px)" />
          <img
            src="/hero-hand.png"
            alt="An open hand with palm facing upward into a beam of warm light"
            className="absolute inset-0 w-full h-full object-cover hero-drift"
            style={{ objectPosition: "center 20%", zIndex: 0, opacity: 0.88 }}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {/* Warm amber light pulse — atmospheric, not decorative */}
        <motion.div
          className="absolute inset-0 z-[1] pointer-events-none"
          animate={{ opacity: [0.6, 1.0, 0.6] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          style={{
            background: "radial-gradient(ellipse 55% 45% at 38% 30%, rgba(224,116,58,0.18) 0%, rgba(240,160,106,0.10) 40%, transparent 75%)",
          }}
        />

        {/* Secondary shimmer — offset phase */}
        <motion.div
          className="absolute inset-0 z-[1] pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 3.5 }}
          style={{
            background: "radial-gradient(ellipse 30% 35% at 50% 0%, rgba(255,230,190,0.12) 0%, transparent 65%)",
          }}
        />

        {/* Edge vignette — all four sides, cinematic depth */}
        <div
          aria-hidden
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: [
              "linear-gradient(180deg, rgba(8,7,10,0.72) 0%, rgba(8,7,10,0.20) 16%, transparent 38%)",
              "linear-gradient(0deg, rgba(8,7,10,1) 0%, rgba(8,7,10,0.90) 18%, rgba(8,7,10,0.40) 42%, transparent 62%)",
              "linear-gradient(90deg, rgba(8,7,10,0.40) 0%, transparent 20%)",
              "linear-gradient(270deg, rgba(8,7,10,0.40) 0%, transparent 20%)",
            ].join(", "),
          }}
        />

        {/* Grain texture overlay */}
        <div
          aria-hidden
          className="absolute inset-0 z-[2] pointer-events-none opacity-[0.028] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Hero content — anchored to bottom, image breathes above */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center"
          style={{ paddingBottom: "max(clamp(3.5rem, 9vh, 7rem), env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Platform label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/28 mb-5"
            style={{ fontSize: "0.6rem" }}
          >
            Sovereign.os
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[#f4efe9] text-balance leading-[1.05] tracking-[-0.025em] px-8"
            style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)", maxWidth: "20ch" }}
          >
            You are not broken.
            <br />
            <span style={{ color: "rgba(244,239,233,0.44)" }}>
              You are patterned.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-sm text-[#a8a29a] leading-relaxed px-8"
            style={{ fontSize: "clamp(0.875rem, 1.8vw, 1rem)" }}
          >
            See the loop. Name the pattern. Choose the repair.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col sm:flex-row gap-3 items-center px-8"
          >
            <Link href={APP_URL} className="btn-primary">
              Start with your baseline
            </Link>
            <Link href="/product" className="btn-secondary" style={{ opacity: 0.70 }}>
              Explore the spaces
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ── NOTEBOOK PREVIEW ─────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/[0.05]">
        <Container>
          <div className="flex flex-col items-center text-center mb-12 reveal-up reveal-up-1">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">
                The notebook
              </span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight text-balance max-w-lg"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
            >
              A real moment. A real result.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-sm">
              Your Baseline Design is active in the background — so every output is grounded in how you actually move through pressure, not a generic read.
            </p>
          </div>

          {/* Live demo preview */}
          <div className="max-w-2xl mx-auto reveal-up reveal-up-2">
            <div
              className="border border-white/[0.08] bg-[#0c0a0d] overflow-hidden"
              style={{ borderRadius: 14 }}
            >
              {/* Input row */}
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Moment</p>
                <p className="text-[14px] text-[#a8a29a] leading-relaxed italic">
                  &ldquo;My brother called me out in front of the whole family. I didn&rsquo;t say anything. I&rsquo;ve been replaying it for three days.&rdquo;
                </p>
              </div>

              {/* Result rows */}
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">What&rsquo;s active</p>
                <p className="text-[14px] text-[#f4efe9] leading-[1.7]">You absorbed the hit publicly and went silent — not because you had nothing to say, but because speaking felt more dangerous than the wound itself.</p>
              </div>

              <div className="px-6 py-5 border-b border-white/[0.05]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">The pattern</p>
                <p className="text-[14px] text-[#f4efe9] leading-[1.7]">You protect the room at your own expense, then spend days alone carrying what you didn&rsquo;t say.</p>
              </div>

              <div className="px-6 py-5 bg-white/[0.015]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">Next move</p>
                <p className="text-[14px] text-[#f4efe9] leading-[1.7]">You don&rsquo;t owe your brother a public confrontation. Write down exactly what you would have said. Then decide — not from the wound, but from what&rsquo;s actually true.</p>
              </div>

              {/* Baseline attribution footer */}
              <div className="px-6 py-3 border-t border-white/[0.04] flex items-center gap-3">
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47]">Baseline Design active</span>
                <span className="h-px flex-1 bg-white/[0.04]" />
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47]">Birth data ✓</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a href={APP_URL} className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] hover:text-[#f4efe9] transition-colors duration-200">
                Start with your baseline →
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-b border-white/[0.06]">
        <Container className="max-w-4xl">
          <MetaLabel>Campaign statement</MetaLabel>
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end">
            <h2 className="font-serif text-[clamp(2.4rem,5vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.025em] text-balance">
              The reaction starts before the reply.
            </h2>
            <div className="space-y-5 text-[#a8a29a] leading-relaxed">
              <p>
                The shut down. The over-explanation. The disappearing. The pressure to carry more than is yours. Sovereign.os gives the moment enough structure to become workable.
              </p>
              <p className="text-[#f4efe9]/80">
                Not a diagnosis. Not a prediction. Not a replacement for human relationship. A private place to notice what is active and choose a clearer next move.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Campaign videos */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-b border-white/[0.06]">
        <Container>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">The work</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              Seven moments. Seven patterns.
            </h2>
          </div>

          <div className="grid gap-px bg-white/[0.05] border border-white/[0.05] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-hidden" style={{ borderRadius: 14 }}>
            {campaignVideos.slice(0, 6).map((video, i) => (
              <div key={video.title} className="bg-[#0c0a0d] p-6 flex flex-col gap-4 hover:bg-[#0f0d10] transition-colors duration-300">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">0{i + 1}</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] text-right leading-tight">{video.purpose}</span>
                </div>
                <div>
                  <h3 className="font-serif text-[1.1rem] text-[#f4efe9] leading-snug mb-2">{video.title}</h3>
                  <p className="text-[12px] text-[#76716b] leading-relaxed">{video.scene}</p>
                </div>
                <p className="mt-auto font-serif text-[13px] text-[#a8a29a] italic leading-snug border-t border-white/[0.05] pt-4">
                  &ldquo;{video.line}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

            <section className="relative w-full py-20 md:py-28 bg-[#08070a] border-b border-white/[0.06] overflow-hidden">
        <div className="ambient-blob absolute -top-40 -left-40 w-[600px] h-[600px] opacity-[0.04]"
          style={{ background: "radial-gradient(circle, rgba(224,116,58,1) 0%, transparent 70%)" }} aria-hidden />
        <Container>
          <MetaLabel>Product spaces</MetaLabel>
          <div className="grid gap-px overflow-hidden border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
            {productSpaces.map((space, index) => (
              <Link
                key={space.name}
                href={space.href}
                className="group relative bg-[#0c0a0d] p-8 md:p-10 border border-white/[0.05] hover:border-white/[0.10] transition-all duration-300 overflow-hidden"
                style={{ borderRadius: "var(--radius-container)" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(224,116,58,0.04) 0%, transparent 70%)" }} />
                <div className="mb-10 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4f4b47]">0{index + 1}</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#e0743a]/60">{space.label}</span>
                </div>
                <h3 className="font-serif text-3xl text-[#f4efe9] group-hover:text-[#f4efe9] transition-colors">{space.name}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#a8a29a] max-w-sm">{space.body}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-28 md:py-40 bg-[#08070a] border-t border-white/[0.05] overflow-hidden">
        {/* Centered warm glow for CTA */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,116,58,0.06) 0%, transparent 70%)" }} />
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2
            className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-3xl text-balance"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)" }}
          >
            Return before the pattern takes over.
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg text-[#a8a29a] leading-relaxed">
            Defrag is free. Describe a difficult moment — the argument, the silence, the message — and see what's actually active beneath it.
          </p>
          <div className="mt-9">
            <Link href={APP_URL} className="btn-primary">
              Enter Sovereign.os
            </Link>
          </div>
        </Container>
      </section>

      <section className="relative w-full py-24 md:py-32 bg-[#08070a] text-center overflow-hidden">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center">
          <MetaLabel>Begin</MetaLabel>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,4.5rem)] text-[#f4efe9] tracking-[-0.025em] mb-6 text-balance max-w-3xl leading-[1.06]">
            See the loop. Name the pattern. Choose the repair.
          </h2>
          <p className="max-w-xl text-[#a8a29a] leading-relaxed mb-10">
            Start with the baseline that helps Sovereign.os understand how pressure, choice, conflict, care, and repair tend to move through you.
          </p>
          <Link href={APP_URL} className="btn-primary">
            Start with your baseline
          </Link>
        </Container>
      </section>
    </SiteShell>
  )
}
