import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Product — Sovereign.os",
  description: "Pattern-aware AI for the moments that matter. Defrag, Covenant, and Alignment — three spaces, one Baseline Design.",
}

const SPACES = [
  {
    num: "01",
    name: "Defrag",
    href: "/product/defrag",
    tier: "Free",
    headline: "Separate the moment from the pattern.",
    body: "Analyze friction, silence, or recurring dynamics. Identify the structural pattern beneath the surface to determine the clearest next action.",
    tags: ["Relational dynamics", "Family roles", "Boundaries", "Grief", "Team pressure"],
  },
  {
    num: "02",
    name: "Covenant",
    href: "/product/covenant",
    tier: "Pro",
    headline: "Faith connected to repair.",
    body: "Integrate meaning and grounded discernment into your response process. Formulate a next step based on long-term values rather than immediate emotional pressure.",
    tags: ["Values", "Commitments", "Relational agreements", "Honest next steps"],
  },
  {
    num: "03",
    name: "Alignment",
    href: "/product/alignment",
    tier: "Pro",
    headline: "Turn insight into a usable response.",
    body: "After the insight. Before the next move. See what is yours to carry and what belongs to the other side.",
    tags: ["Response integration", "Action choice", "What to say next"],
  },
]

const FEATURES = [
  {
    name: "Baseline Design",
    body: "The starting map. Active beneath every thread. Private, never exposed in outputs.",
    tier: "Free",
  },
  {
    name: "Library",
    body: "Save what helped before the moment disappears. Return before the old pattern takes over.",
    tier: "Pro",
  },
  {
    name: "Audio Overview",
    body: "A spoken version of your result. Generated on demand.",
    tier: "Pro",
  },
  {
    name: "Invite Privately",
    body: "Understand the shared loop without keeping score — when both sides matter.",
    tier: "Pro",
  },
]

export default function ProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-24 md:pt-48 md:pb-32 bg-[#08070a] overflow-hidden">
        {/* Depth layers */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(224,116,58,0.07) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(200,194,188,0.03) 0%, transparent 60%)" }}
          aria-hidden
        />

        {/* Orbit rings */}
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-30" aria-hidden>
          {[200, 350, 500].map((size) => (
            <div
              key={size}
              className="alignment-ring absolute"
              style={{ width: size, height: size, right: -size / 2, top: -size / 2 }}
            />
          ))}
        </div>

        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8 fade-in-up fade-in-up-1">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Product</span>
          </div>

          <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-8 fade-in-up fade-in-up-2">
            One platform.<br />
            <span className="text-[#a8a29a]">Three spaces.</span>
          </h1>

          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed fade-in-up fade-in-up-3">
            Your Baseline Design is active in every session — a private behavioral map that gives the AI context before you type. Defrag, Covenant, and Alignment each do different work — and share the same source.
          </p>
        </Container>
      </section>

      {/* ── SPACES ── */}
      <section className="w-full bg-[#08070a]">
        <Container className="max-w-3xl">
          {SPACES.map((space, i) => (
            <Link
              key={space.name}
              href={space.href}
              className={`group flex items-start gap-8 py-12 ${i < SPACES.length - 1 ? "border-b border-white/[0.05]" : ""} transition-opacity hover:opacity-80`}
            >
              {/* Number */}
              <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.2em] shrink-0 pt-1.5">{space.num}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-serif text-[1.6rem] text-[#f4efe9] leading-none">{space.name}</h3>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.16em] px-2 py-1 border"
                    style={{
                      borderRadius: "var(--radius-minimal)",
                      color: space.tier === "Free" ? "#76716b" : "rgba(224,116,58,0.7)",
                      borderColor: space.tier === "Free" ? "rgba(255,255,255,0.06)" : "rgba(224,116,58,0.2)",
                      background: space.tier === "Free" ? "transparent" : "rgba(224,116,58,0.04)",
                    }}
                  >
                    {space.tier}
                  </span>
                </div>

                <p className="text-[#f4efe9]/80 text-base leading-snug mb-3">{space.headline}</p>
                <p className="text-sm text-[#76716b] leading-relaxed mb-4 max-w-xl">{space.body}</p>

                <div className="flex flex-wrap gap-2">
                  {space.tags.map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#4f4b47] px-2 py-1 border border-white/[0.04]"
                      style={{ borderRadius: "var(--radius-minimal)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <svg
                width="14" height="10" viewBox="0 0 14 10" fill="none"
                className="text-[#4f4b47] group-hover:text-[#e0743a]/60 transition-colors translate-x-0 group-hover:translate-x-1 transition-transform duration-200 shrink-0 mt-2"
              >
                <path d="M1 5h12M7.5 1.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </Container>
      </section>

      {/* ── FEATURES ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-12">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">What you get</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.name}
                className={`p-7 bg-[#0c0a0d] card-hover ${i % 2 === 0 ? "md:border-r border-white/[0.04]" : ""} ${i < 2 ? "border-b border-white/[0.04]" : ""}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[#f4efe9] text-[0.9375rem]">{f.name}</p>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.12em] border px-1.5 py-0.5"
                    style={{
                      borderRadius: "var(--radius-minimal)",
                      color: f.tier === "Free" ? "rgba(168,162,154,0.6)" : "rgba(224,116,58,0.6)",
                      borderColor: f.tier === "Free" ? "rgba(255,255,255,0.06)" : "rgba(224,116,58,0.15)",
                    }}
                  >
                    {f.tier}
                  </span>
                </div>
                <p className="text-sm text-[#76716b] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-32 md:py-40 bg-[#08070a] border-t border-white/[0.04] overflow-hidden text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {[300, 500, 700].map((size) => (
            <div key={size} className="alignment-ring absolute" style={{ width: size, height: size, left: -size/2, top: -size/2, opacity: 0.05 }} />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(224,116,58,0.04) 0%, transparent 70%)" }}
          aria-hidden
        />
        <Container className="relative z-10 max-w-xl">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-[#f4efe9] tracking-[-0.025em] leading-tight mb-6 text-balance">
            Start with Defrag.<br />Free, no time limit.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-10">
            No credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app/login" className="btn-primary">Enter Sovereign.os</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
