import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// ─── Data ────────────────────────────────────────────────────────────────────

const WHAT_HELPS = [
  {
    title: "Repeating Conflicts",
    desc: "Understand why the same arguments happen with different people.",
  },
  {
    title: "Boundary Ruptures",
    desc: "Identify when a boundary is yours to hold versus theirs to respect.",
  },
  {
    title: "Grief & Stagnation",
    desc: "See where you are holding onto old roles that no longer serve you.",
  },
  {
    title: "Decision Paralysis",
    desc: "Clarify what is yours to decide and what is not yours to carry.",
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Baseline Design",
    desc: "The context exists before you type. Sovereign.os understands your core patterns.",
  },
  {
    step: "02",
    title: "Current Situation",
    desc: "Enter what is happening right now, without needing to explain the history.",
  },
  {
    step: "03",
    title: "Structured Result",
    desc: "Receive a structural breakdown of the pattern, the old role, and the gift under strain.",
  },
  {
    step: "04",
    title: "Library Return",
    desc: "Save useful Results. Return to them before the old pattern takes over again.",
  },
]

const FREE_FEATURES = [
  "Baseline Design access",
  "Defrag space (limited sessions)",
  "Library saving",
]

const PRO_FEATURES = [
  "Unlimited Defrag sessions",
  "Covenant Space access",
  "Deep Library continuity",
  "Audio Overview & Watch Preview (when available)",
  "Private Invites",
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full border-border bg-transparent text-secondary font-sans font-medium text-[12px] tracking-[0.1em] uppercase px-4 py-1.5 w-fit"
    >
      {children}
    </Badge>
  )
}

function Rule() {
  return <div className="h-px w-full bg-border" />
}

function Dot({ dim }: { dim?: boolean }) {
  return (
    <div
      className={`mt-[8px] w-1.5 h-1.5 shrink-0 rounded-full ${dim ? "bg-white/[0.15]" : "bg-white/40"}`}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground selection:bg-white/10 selection:text-white">

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[90svh] pt-32 pb-20 overflow-hidden border-b border-border bg-gradient-to-b from-background to-surface">

        {/* Dynamic Texture overlay */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at center, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <Container className="relative z-10 flex flex-col items-center text-center max-w-4xl px-4 sm:px-6">

          {/* Wordmark */}
          <div className="mb-10 animate-fade-in-up">
            <SectionLabel>SOVEREIGN.OS</SectionLabel>
          </div>

          {/* Primary headline with balanced contrast */}
          <div className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold tracking-tight text-primary leading-[1.1] text-balance">
              Healing isn&apos;t optional.
            </h1>
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold tracking-tight text-secondary leading-[1.1] text-balance">
              Holding the pain is.
            </h1>
          </div>

          {/* Support copy */}
          <p className="text-secondary text-lg sm:text-xl font-normal max-w-2xl mb-12 text-balance leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
          </p>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary text-background hover:bg-primary/90 font-sans font-medium text-[13px] tracking-wider uppercase h-14 px-8 transition-transform active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                Enter Sovereign.os
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-full border border-border bg-transparent text-primary hover:bg-white/5 h-14 px-8 font-sans font-medium text-[13px] tracking-wider uppercase transition-colors">
                Start Baseline Design
              </Button>
            </Link>
          </div>

          {/* Supporting lines */}
          <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-tertiary font-sans font-medium text-[11px] tracking-[0.15em] uppercase animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <span>See what is actually happening</span>
            <span className="hidden sm:block opacity-40">·</span>
            <span>Understand your role in it</span>
            <span className="hidden sm:block opacity-40">·</span>
            <span>Respond differently</span>
          </div>
        </Container>
      </Section>

      {/* ── 2. What this helps with ─────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-border bg-surface">
        <Container>
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-6">
              <SectionLabel>The application</SectionLabel>
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-primary leading-tight">
                What this helps with
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border overflow-hidden rounded-2xl">
              {WHAT_HELPS.map((item, i) => (
                <div key={i} className="bg-surface p-8 sm:p-10 flex flex-col gap-4 hover:bg-elevated transition-colors duration-300">
                  <h3 className="text-primary text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="text-secondary text-base leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 3. How it Works (Sovereign.os does) ─────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-border bg-background">
        <Container>
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-6">
              <SectionLabel>The progression</SectionLabel>
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-primary leading-tight">
                How Sovereign.os works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="flex flex-col gap-4 p-8 border border-border rounded-2xl bg-surface/50">
                  <span className="text-tertiary font-sans font-bold text-[12px] tracking-widest">{step.step}</span>
                  <h3 className="text-primary text-xl font-semibold">{step.title}</h3>
                  <p className="text-secondary text-base leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 4. Library (Continuity Layer) ──────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-border bg-surface">
        <Container>
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <SectionLabel>Continuity Layer</SectionLabel>
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-primary leading-tight">
                Sovereign.os Library
              </h2>
              <p className="text-secondary text-lg leading-relaxed max-w-xl mx-auto">
                Not just storage. The private record of what helped. Save Defrag Results, Covenant Briefs, and Best Next Responses — and return to them before the old pattern takes over again.
              </p>
            </div>

            <div className="border border-border rounded-2xl divide-y divide-border bg-background overflow-hidden shadow-2xl">
              {[
                { type: "Defrag", label: "The argument that won't resolve", date: "Saved" },
                { type: "Covenant", label: "Where repair is mine to initiate", date: "Saved" },
                { type: "Alignment", label: "What I am carrying that isn't mine", date: "Saved" },
              ].map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-surface transition-colors cursor-default">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-tertiary font-sans font-medium text-[11px] tracking-widest uppercase shrink-0 w-20">
                      {entry.type}
                    </span>
                    <span className="text-primary text-base font-medium truncate">{entry.label}</span>
                  </div>
                  <span className="text-tertiary font-sans font-medium text-[11px] shrink-0">{entry.date}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 5. Pricing ──────────────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-border bg-background">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-primary">
                Choose your depth
              </h2>
              <p className="text-secondary text-lg">Start free. Go deeper when you&apos;re ready.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Free */}
              <div className="flex flex-col p-10 space-y-8 border border-border rounded-3xl bg-surface hover:border-white/20 transition-colors">
                <div className="space-y-3">
                  <h3 className="text-primary text-2xl font-semibold">Free</h3>
                  <p className="text-tertiary text-base">Understand a moment.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-primary text-5xl font-bold tracking-tight">$0</span>
                  <span className="text-tertiary text-base font-medium">/forever</span>
                </div>
                <ul className="space-y-4 flex-1 mt-4">
                  {FREE_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 text-secondary text-base leading-relaxed">
                      <Dot dim />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-8">
                  <Button variant="ghost" className="w-full rounded-full border-border bg-transparent text-primary hover:bg-white/5 h-14 font-sans font-medium text-[13px] tracking-wider uppercase transition-colors">
                    Get Started Free
                  </Button>
                </Link>
              </div>

              {/* Pro */}
              <div className="flex flex-col p-10 space-y-8 border border-white/20 rounded-3xl bg-elevated shadow-2xl relative">
                <div className="absolute -top-4 right-8">
                  <Badge className="bg-primary text-background hover:bg-primary/90 rounded-full font-sans font-bold text-[11px] uppercase tracking-widest px-4 py-1.5 shadow-lg">
                    Recommended
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h3 className="text-primary text-2xl font-semibold">Sovereign Pro</h3>
                  <p className="text-tertiary text-base">Return, remember, compare, and interrupt.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-primary text-5xl font-bold tracking-tight">$20</span>
                  <span className="text-tertiary text-base font-medium">/mo</span>
                </div>
                <ul className="space-y-4 flex-1 mt-4">
                  {PRO_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 text-primary text-base leading-relaxed font-medium">
                      <Dot />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block mt-8">
                  <Button className="w-full rounded-full bg-primary text-background hover:bg-primary/90 h-14 font-sans font-bold text-[13px] tracking-wider uppercase transition-transform active:scale-95 shadow-xl">
                    Start Sovereign Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 6. Final CTA ────────────────────────────────────────────────────── */}
      <Section className="w-full py-32 md:py-48 bg-surface relative overflow-hidden">
        <Container className="relative z-10 text-center max-w-3xl px-4">
          <div className="space-y-4 mb-12">
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-tight text-primary leading-[1.05] text-balance">
              Healing isn&apos;t optional.
            </h2>
            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-tight text-secondary leading-[1.05] text-balance opacity-50">
              Holding the pain is.
            </h2>
          </div>

          <p className="text-tertiary text-[13px] font-sans font-bold tracking-[0.2em] uppercase mb-12">
            The platform is ready when you are.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary text-background hover:bg-primary/90 h-14 px-10 font-sans font-medium text-[13px] tracking-wider uppercase transition-transform active:scale-95 shadow-lg">
                Enter Sovereign.os
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  )
}
