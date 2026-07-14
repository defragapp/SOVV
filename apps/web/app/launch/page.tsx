import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

export const metadata: Metadata = {
  title: "Start with Sovereign.os",
  description: "Start free, create a one-time Baseline Guide, or unlock the complete Sovereign.os experience with Pro.",
}

const PATHS = [
  {
    label: "Start free",
    price: "$0",
    cadence: "forever",
    title: "Bring one real moment.",
    description: "Use Defrag to see the pattern underneath a conflict, reaction, pressure point, or decision.",
    features: ["15 sessions each day", "Baseline Design", "Pattern recognition", "Best Next Response"],
    href: "/app/login?utm_source=launch&utm_medium=owned&utm_campaign=public_launch&utm_content=free",
    cta: "Start free",
    featured: false,
  },
  {
    label: "One-time",
    price: "$10",
    cadence: "once",
    title: "Get your personal operating guide.",
    description: "A branded, downloadable guide to how you decide, process pressure, relate, and return to clarity.",
    features: ["Built from your Baseline Design", "No subscription required", "Private downloadable edition", "Useful for you and your people"],
    href: "/baseline-guide?utm_source=launch&utm_medium=owned&utm_campaign=public_launch&utm_content=guide",
    cta: "Create my guide",
    featured: false,
  },
  {
    label: "Complete access",
    price: "$20",
    cadence: "/ month",
    title: "Let understanding compound.",
    description: "Unlock the complete system for ongoing decision support across Defrag, Alignment, and Covenant.",
    features: ["Unlimited sessions", "Covenant and Alignment", "Saved Library depth", "Audio Overview and private invites"],
    href: "/app/login?checkout=1&plan=monthly&utm_source=launch&utm_medium=owned&utm_campaign=public_launch&utm_content=pro",
    cta: "Unlock Pro",
    featured: true,
  },
] as const

const MOMENTS = [
  "A conversation keeps replaying in your head.",
  "You know something feels off, but not why.",
  "Two people remember the same moment differently.",
  "Pressure is making the decision for you.",
]

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29a]">{children}</span>
    </div>
  )
}

export default function LaunchPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-white/5 bg-[#08070a] pb-20 pt-32 md:pb-28 md:pt-44">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 flex max-w-4xl flex-col items-center text-center">
          <MetaLabel>Sovereign.os · Public launch</MetaLabel>
          <h1 className="max-w-4xl text-balance font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.98] tracking-[-0.04em] text-[#f4efe9]">
            See the pattern before it chooses for you.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#a8a29a] md:text-lg">
            Bring the real moment. Sovereign.os reads it through your personal Baseline Design, shows what may be repeating, and helps you choose a cleaner next move.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={PATHS[0].href} className="btn-primary min-w-[180px]">Start free</Link>
            <Link href="#choose" className="btn-secondary min-w-[180px]">Choose your depth</Link>
          </div>
          <p className="mt-4 text-[11px] text-[#4f4b47]">Private by design · No credit card to begin · Cancel Pro anytime</p>
        </Container>
      </section>

      <section className="border-b border-white/[0.04] bg-[#0c0a0d] py-10">
        <Container className="max-w-5xl">
          <div className="grid gap-px overflow-hidden border border-white/[0.06] bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4" style={{ borderRadius: 14 }}>
            {MOMENTS.map((moment) => (
              <div key={moment} className="bg-[#0c0a0d] p-5 text-sm leading-relaxed text-[#a8a29a]">
                <span className="mr-2 text-[#e0743a]">●</span>{moment}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="choose" className="bg-[#08070a] py-20 md:py-28">
        <Container className="max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <MetaLabel>Choose your depth</MetaLabel>
            <h2 className="text-balance font-serif text-4xl tracking-[-0.03em] text-[#f4efe9] md:text-5xl">
              Start where the value is obvious to you.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#76716b]">
              Free is a real daily product. The Guide is yours to keep. Pro is for ongoing, deeper use.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {PATHS.map((path) => (
              <article
                key={path.label}
                className={`relative flex flex-col overflow-hidden rounded-3xl border p-7 md:p-8 ${
                  path.featured
                    ? "border-[#e0743a]/40 bg-[#0c0a0d] shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
                    : "border-white/[0.08] bg-[#0c0a0d]"
                }`}
              >
                {path.featured ? <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(224,116,58,0.10),transparent_72%)]" /> : null}
                <div className="relative">
                  <p className={`font-mono text-[9px] uppercase tracking-[0.2em] ${path.featured ? "text-[#e0743a]" : "text-[#76716b]"}`}>{path.label}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-serif text-5xl text-[#f4efe9]">{path.price}</span>
                    <span className="text-sm text-[#76716b]">{path.cadence}</span>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl tracking-[-0.02em] text-[#f4efe9]">{path.title}</h3>
                  <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-[#a8a29a]">{path.description}</p>
                </div>

                <div className="relative my-7 flex flex-1 flex-col gap-3">
                  {path.features.map((feature) => (
                    <div key={feature} className="flex gap-3 text-sm text-[#a8a29a]">
                      <span className="text-[#e0743a]">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={path.href} className={`${path.featured ? "btn-primary" : "btn-secondary"} relative w-full text-center`}>
                  {path.cta}
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.05] bg-[#0c0a0d] py-20 md:py-28">
        <Container className="grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <MetaLabel>What changes</MetaLabel>
            <h2 className="text-balance font-serif text-4xl tracking-[-0.03em] text-[#f4efe9] md:text-5xl">
              Less decoding. More usable truth.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[#a8a29a]">
            <p>Sovereign does not ask you to become an expert in a framework. It translates the frameworks into direct language for the moment you are actually living.</p>
            <p>Your Baseline Design creates continuity, so every session can understand more than the last without publicly exposing your personal inputs.</p>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.05] bg-[#08070a] py-24 text-center md:py-36">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(224,116,58,0.10) 0%, transparent 72%)" }} aria-hidden />
        <Container className="relative z-10 flex max-w-2xl flex-col items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#76716b]">No perfect wording required</p>
          <h2 className="mt-6 text-balance font-serif text-4xl tracking-[-0.03em] text-[#f4efe9] md:text-6xl">Bring the moment as it is.</h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#a8a29a]">Start free. See whether the understanding is useful. Upgrade only when you want the complete system.</p>
          <Link href={PATHS[0].href} className="btn-primary mt-9 min-w-[190px]">Start free</Link>
        </Container>
      </section>
    </SiteShell>
  )
}
