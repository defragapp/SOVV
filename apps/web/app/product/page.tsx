import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Product — Sovereign.os",
  description: "Sovereign.os helps you work through the patterns that keep showing up. Your Baseline Design is the source.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

export default function ProductPage() {
  return (
    <SiteShell>

      {/* Hero */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>Product</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            One platform. Three spaces. One source.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed">
            Your Baseline Design is active in every session — a private behavioral map that gives the AI context before you type. Defrag, Covenant, and Alignment each do different work — and share the same context.
          </p>
        </Container>
      </section>

      {/* Spaces */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <MetaLabel>The spaces</MetaLabel>
          <div className="flex flex-col divide-y divide-white/[0.05]">
            {[
              {
                num: "01",
                name: "Defrag",
                href: "/product/defrag",
                tier: "Free",
                headline: "Separate the moment from the pattern.",
                body: "Analyze friction, silence, or recurring dynamics. Identify the structural pattern beneath the surface to determine the clearest next action.",
                detail: "Relational dynamics · Family roles · Boundaries · Grief · Team pressure",
              },
              {
                num: "02",
                name: "Covenant",
                href: "/product/covenant",
                tier: "Pro",
                headline: "Faith connected to repair.",
                body: "Integrate meaning and grounded discernment into your response process. Formulate a next step based on long-term values rather than immediate emotional pressure.",
                detail: "Values · Commitments · Relational agreements · Honest next steps",
              },
              {
                num: "03",
                name: "Alignment",
                href: "/product/alignment",
                tier: "Pro",
                headline: "Turn insight into a usable response.",
                body: "After the insight. Before the next move. See what is yours to carry and what belongs to the other side.",
                detail: "Response integration · Action choice · What to say next",
              },
            ].map((space) => (
              <Link
                key={space.name}
                href={space.href}
                className="group flex items-start gap-8 py-10 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors px-4 -mx-4"
                style={{ borderRadius: 12 }}
              >
                <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
                  <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em]">{space.num}</span>
                  <div className="w-px h-8 bg-white/[0.06]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-2xl text-[#f4efe9] group-hover:text-[#f4efe9] transition-colors">{space.name}</h3>
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.14em] border px-2 py-0.5"
                      style={{
                        borderRadius: 4,
                        color: space.tier === "Free" ? "rgba(168,162,154,0.7)" : "rgba(224,116,58,0.7)",
                        borderColor: space.tier === "Free" ? "rgba(255,255,255,0.08)" : "rgba(224,116,58,0.2)",
                      }}
                    >
                      {space.tier}
                    </span>
                  </div>
                  <p className="text-base text-[#f4efe9]/80 mb-2 leading-snug">{space.headline}</p>
                  <p className="text-sm text-[#a8a29a] leading-relaxed mb-3 max-w-xl">{space.body}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">{space.detail}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#4f4b47] group-hover:text-[#f0a06a] group-hover:translate-x-1 transition-all mt-2 shrink-0">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* What you get */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What you get</MetaLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {[
              { name: "Baseline Design", body: "The starting map. Active beneath every thread. Private, never exposed in outputs.", tier: "Free" },
              { name: "Sovereign.os Library", body: "Save what helped before the moment disappears. Return before the old pattern takes over.", tier: "Pro" },
              { name: "Audio Overview", body: "A spoken version of your result. Generated on demand.", tier: "Pro" },
              { name: "Invite Privately", body: "Understand the shared loop without keeping score — when both sides matter.", tier: "Pro" },
            ].map((f, i) => (
              <div key={i} className="py-8 pr-8 border-b border-white/[0.06] md:border-r md:even:border-r-0">
                <div className="flex items-center gap-2 mb-3">
                  <p className="font-medium text-[#f4efe9] text-[15px]">{f.name}</p>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.12em] border px-1.5 py-0.5"
                    style={{
                      borderRadius: 3,
                      color: f.tier === "Free" ? "rgba(168,162,154,0.6)" : "rgba(224,116,58,0.6)",
                      borderColor: f.tier === "Free" ? "rgba(255,255,255,0.06)" : "rgba(224,116,58,0.15)",
                    }}
                  >
                    {f.tier}
                  </span>
                </div>
                <p className="text-sm text-[#a8a29a] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative w-full py-24 bg-[#0c0a0d] border-t border-white/5 overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] mb-8 text-balance max-w-2xl">
            Start with Defrag. Free, no time limit.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/app/login" className="btn-primary">Enter Sovereign.os</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
