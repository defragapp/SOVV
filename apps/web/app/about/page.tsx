import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About",
  description: "Sovereign.os is a private place to work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

export default function AboutPage() {
  return (
    <SiteShell>

      {/* Hero */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <div className="ambient-blob absolute -top-60 -right-60 w-[700px] h-[700px] opacity-[0.03]"
          style={{ background: "radial-gradient(circle, rgba(224,116,58,1) 0%, transparent 70%)" }} aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>About</MetaLabel>
          <h1 className="reveal-up reveal-up-2 font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            <span className="text-glow">Before you explain yourself again,</span>
            <br />
            return to yourself first.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-xl leading-relaxed">
            Not for abstract self-improvement. For the specific, real, sometimes difficult moments of actual life.
          </p>
        </Container>
      </section>

      {/* What it is */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {[
              {
                label: "The moment",
                body: "The message that unsettled you. The family role you keep falling back into. The boundary you keep negotiating with yourself. The grief that changes the room.",
              },
              {
                label: "The structure",
                body: "Sovereign.os gives those moments structure — without turning them into a diagnosis, a score, or a verdict.",
              },
              {
                label: "The platform",
                body: "Your Baseline Design is the starting map. Defrag, Covenant, and Alignment are the spaces where the work happens. The Library is where you save what helped.",
              },
              {
                label: "The limit",
                body: "Sovereign.os does not diagnose, predict, or guarantee outcomes. It is not a replacement for therapy. It is the space between sessions.",
              },
            ].map((item, i) => (
              <div key={i} className={`py-8 pr-8 border-b border-white/[0.06] md:border-r md:even:border-r-0 last:border-b-0 reveal-up reveal-up-${Math.min(i + 2, 6)}`}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/50 mb-3">{item.label}</p>
                <p className="text-[15px] text-[#a8a29a] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* The wound */}
      <section className="w-full py-16 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4f4b47]">
            The wound is real. So is the choice after it.
          </p>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative w-full py-24 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-8 text-balance">
            The way through is already here.
          </h2>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
