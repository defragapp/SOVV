import Link from "next/link"
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
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#08070a]/60 via-transparent to-[#08070a]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-[#08070a]/20 to-transparent" />
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center py-24">
          <p className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/30 mb-6 text-[0.65rem]">
            Sovereign.os
          </p>
          <h1 className="font-serif text-[#f4efe9] text-balance leading-[1.02] tracking-[-0.035em] text-[clamp(3rem,8vw,7.5rem)] max-w-5xl">
            You are not broken. You are patterned.
          </h1>
          <p className="mt-6 font-mono uppercase tracking-[0.2em] text-[#f4efe9]/30 text-[0.65rem]">
            The personal operating system for relational intelligence.
          </p>
          <p className="mt-7 max-w-xl text-[#a8a29a] leading-relaxed text-base md:text-lg">
            Sovereign.os helps you see the loop, name the pattern, and choose the repair with grounded reflection before the old response takes over.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center">
            <Link href={APP_URL} className="btn-primary">
              Start with your baseline
            </Link>
            <Link href="/product" className="btn-secondary">
              Explore the spaces
            </Link>
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

      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-b border-white/[0.06]">
        <Container>
          <div className="mb-12 max-w-2xl">
            <MetaLabel>Short video campaign</MetaLabel>
            <h2 className="font-serif text-[clamp(2.2rem,5vw,4rem)] text-[#f4efe9] leading-[1.08] tracking-[-0.02em] text-balance">
              Seven quiet cuts for the moments people recognize immediately.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaignVideos.map((video, index) => (
              <article key={video.title} className="card p-6 min-h-[250px] flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4f4b47]">Video {index + 1}</span>
                  <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#e0743a]/60 text-right">{video.purpose}</span>
                </div>
                <h3 className="mt-8 font-serif text-2xl text-[#f4efe9]">{video.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#a8a29a]">{video.scene}</p>
                <p className="mt-auto pt-8 text-sm leading-relaxed text-[#f4efe9]/80 border-t border-white/[0.06]">“{video.line}”</p>
              </article>
            ))}
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
