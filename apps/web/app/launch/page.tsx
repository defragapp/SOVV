import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Launch — Sovereign.os on Product Hunt",
  description: "Sovereign.os is launching on Product Hunt. Pattern-aware AI for the moments that are hard to read while you're inside them.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

const TAGLINES = [
  "Pattern-aware AI for the moments that are hard to read while you're inside them.",
  "The private notebook that turns reflection into direction.",
  "Separate the moment from the pattern — before pressure chooses for you.",
  "Your Baseline Design. Active in every session. Never exposed in outputs.",
  "Defrag is free. Clarity is the product.",
]

const SCREENSHOTS = [
  {
    label: "Defrag workspace",
    desc: "Pattern recognition in real time — what's active, what's repeating, your Best Next Response.",
    file: "/defrag-app-mockup.png",
  },
  {
    label: "Baseline Design",
    desc: "Your private pattern map — built from birth data, active beneath every session.",
    file: "/baseline-app-mockup.png",
  },
  {
    label: "Covenant space",
    desc: "Faith-connected reflection — one honest next step, grounded in values.",
    file: "/covenant-app-mockup.png",
  },
  {
    label: "Alignment space",
    desc: "After the insight. Before the next move. Return to yourself.",
    file: "/alignment-mockup.png",
  },
]

export default function LaunchPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-20 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-3xl">
          <MetaLabel>Product Hunt Launch</MetaLabel>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,4rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-6">
            <span className="text-glow">Sovereign.os</span>
            <br />
            <span style={{ color: "rgba(244,239,233,0.5)" }}>is live on Product Hunt.</span>
          </h1>
          <p className="text-[#a8a29a] text-base leading-relaxed max-w-md mb-8">
            Pattern-aware AI for the moments that are hard to read while you&apos;re inside them.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <a
              href="https://www.producthunt.com/posts/sovereign-os"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Support on Product Hunt ↗
            </a>
            <Link href="/app/login" className="btn-secondary" style={{ opacity: 0.7 }}>
              Try it free
            </Link>
          </div>
        </Container>
      </section>

      {/* Taglines */}
      <section className="w-full py-16 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <MetaLabel>Tagline variants</MetaLabel>
          <div className="flex flex-col gap-3">
            {TAGLINES.map((t, i) => (
              <div
                key={i}
                className="border border-white/[0.06] bg-[#08070a] px-5 py-4 flex items-start justify-between gap-4 group"
                style={{ borderRadius: 10 }}
              >
                <p className="text-[14px] text-[#c8c2bc] leading-relaxed flex-1">{t}</p>
                <span className="font-mono text-[9px] text-[#4f4b47] shrink-0 mt-0.5">0{i + 1}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Screenshots */}
      <section className="w-full py-16 bg-[#08070a] border-t border-white/[0.04]">
        <Container className="max-w-4xl">
          <MetaLabel>Screenshots</MetaLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCREENSHOTS.map((s) => (
              <div
                key={s.label}
                className="border border-white/[0.07] bg-[#0c0a0d] overflow-hidden"
                style={{ borderRadius: 12 }}
              >
                <div className="aspect-[16/10] bg-[#08070a] flex items-center justify-center border-b border-white/[0.05]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.file}
                    alt={s.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-1">{s.label}</p>
                  <p className="text-[13px] text-[#76716b] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Banner copy */}
      <section className="w-full py-16 bg-[#0c0a0d] border-t border-white/[0.04]">
        <Container className="max-w-3xl">
          <MetaLabel>Banner copy</MetaLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Short (60 chars)",
                copy: "Pattern-aware AI for the moments that matter.",
              },
              {
                label: "Medium (120 chars)",
                copy: "Sovereign.os reads your moment through your Baseline Design — showing what's active, repeating, and what to do next.",
              },
              {
                label: "Hunter comment",
                copy: "Hey PH 👋 We built Sovereign.os because we needed it ourselves — a private place to bring the hard moment before the pattern ran the room. Defrag is free forever. Would love your support and honest feedback.",
              },
              {
                label: "First comment",
                copy: "Maker here. Sovereign.os is pattern-aware AI — it reads your situation through your Baseline Design (built from birth data + behavioral calibration) and gives you what's active, what may be repeating, and your Best Next Response. Defrag is free. Covenant and Alignment require Pro. Happy to answer any questions.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-white/[0.06] bg-[#08070a] p-5 flex flex-col gap-3"
                style={{ borderRadius: 10 }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">{item.label}</p>
                <p className="text-[13px] text-[#a8a29a] leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="w-full py-20 bg-[#08070a] border-t border-white/5 text-center">
        <Container className="max-w-xl">
          <h2 className="font-serif text-3xl text-[#f4efe9] tracking-[-0.02em] mb-4">
            Support the launch.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-8">
            An upvote on Product Hunt helps more people find Sovereign.os.
          </p>
          <a
            href="https://www.producthunt.com/posts/sovereign-os"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Upvote on Product Hunt ↗
          </a>
        </Container>
      </section>
    </SiteShell>
  )
}