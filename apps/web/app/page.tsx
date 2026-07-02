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
      <section className="relative min-h-screen w-full overflow-hidden bg-[#08070a] border-b border-white/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-hand.png"
          alt="An open hand with palm facing upward into a beam of warm light"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
          style={{ zIndex: 0 }}
        />

        {/* Hero content — headline + single CTA only. Image breathes. */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center"
          style={{ paddingBottom: "max(clamp(3rem, 8vh, 6rem), env(safe-area-inset-bottom, 0px))" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[#f4efe9] text-balance leading-[1.06] tracking-[-0.02em] px-8"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", maxWidth: "22ch" }}
          >
            You are not broken.
            <br />
            <span style={{ color: "rgba(244,239,233,0.48)" }}>
              You are patterned.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <Link href={APP_URL} className="btn-primary">
              Start with your baseline
            </Link>
            <Link href="/product" className="btn-secondary">
              Explore the spaces
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ── NOTEBOOK PREVIEW ─────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/[0.05]">
        <Container>
          <div className="flex flex-col items-center text-center mb-14">
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
              This is what you actually get.
            </h2>
            <p className="mt-4 text-base text-[#a8a29a] leading-relaxed max-w-sm">
              A real moment. A real result — what's active, the pattern beneath it, and the clearest next move. Your Baseline Design active in the background.
            </p>
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

      <section className="w-full py-20 md:py-28 bg-[#08070a] border-b border-white/[0.06]">
        <Container>
          <MetaLabel>Product spaces</MetaLabel>
          <div className="grid gap-px overflow-hidden border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
            {productSpaces.map((space, index) => (
              <Link key={space.name} href={space.href} className="group bg-[#0c0a0d] p-8 md:p-10 hover:bg-[#111015] transition-colors">
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
      <section className="relative w-full py-24 md:py-36 bg-[#0c0a0d] border-t border-white/[0.05] overflow-hidden">
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
          <h2 className="font-serif text-4xl md:text-6xl text-[#f4efe9] tracking-[-0.025em] mb-6 text-balance max-w-3xl">
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
