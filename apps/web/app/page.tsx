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
      className="rounded-none border-white/[0.12] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit"
    >
      {children}
    </Badge>
  )
}

function Rule() {
  return <div className="h-px w-full bg-white/[0.06]" />
}

function Dot({ dim }: { dim?: boolean }) {
  return (
    <div
      className={`mt-[6px] w-1 h-1 shrink-0 rounded-full ${dim ? "bg-white/[0.15]" : "bg-white/30"}`}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center selection:bg-white/10 selection:text-white bg-[#050505]">

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[100svh] pt-28 pb-20 overflow-hidden border-b border-white/[0.06]">

        {/* Grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <Container className="relative z-10 flex flex-col items-center text-center max-w-[900px]">

          {/* Wordmark pill */}
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>SOVEREIGN.OS</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          {/* Primary headline */}
          <div className="mb-8 space-y-2">
            <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance">
              Healing isn&apos;t optional.
            </h1>
            <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-semibold tracking-[-0.035em] text-[#3F3F46] leading-[1.04] text-balance">
              Holding the pain is.
            </h1>
          </div>

          {/* Support copy */}
          <p className="text-[#A1A1AA] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[640px] mb-3 text-balance leading-[1.65]">
            Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
          </p>

          {/* Three-line sub-statement */}
          <div className="mb-12 flex flex-col sm:flex-row items-center gap-x-5 gap-y-1 text-[#71717A] font-mono text-[10px] tracking-[0.12em] uppercase">
            <span>See what is actually happening</span>
            <span className="hidden sm:block text-white/[0.12]">·</span>
            <span>Understand your role in it</span>
            <span className="hidden sm:block text-white/[0.12]">·</span>
            <span>Respond differently</span>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-none bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-12 px-8 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
              >
                Enter Sovereign.os
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto rounded-none border-white/[0.12] bg-transparent text-[#FAFAFA] hover:bg-white/[0.04] hover:text-white h-12 px-8 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
              >
                Start Baseline Design
              </Button>
            </Link>
          </div>

          {/* Secondary CTAs */}
          <div className="mt-8 flex gap-7 text-[#71717A] font-mono text-[10px] tracking-[0.1em] uppercase">
            <Link href="#defrag" className="hover:text-[#A1A1AA] transition-colors">
              Explore Defrag →
            </Link>
            <Link href="#covenant" className="hover:text-[#A1A1AA] transition-colors">
              Explore Covenant →
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── 2. What this helps with ─────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#080808]">
        <Container>
          <div className="max-w-3xl mx-auto">

            {/* Cascade headline */}
            <div className="mb-16 space-y-1">
              <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                See what is actually happening.
              </h2>
              <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-semibold tracking-[-0.025em] text-[#A1A1AA] leading-tight">
                Understand your role in it.
              </h2>
              <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-semibold tracking-[-0.025em] text-[#3F3F46] leading-tight">
                Respond differently.
              </h2>
            </div>

            {/* Help grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-white/[0.07]">
              {WHAT_HELPS.map((item, i) => (
                <div
                  key={i}
                  className={[
                    "p-7 md:p-8 space-y-2",
                    i % 2 === 0 && i < WHAT_HELPS.length - 1 ? "border-r border-white/[0.07]" : "",
                    i < 2 ? "border-b border-white/[0.07]" : "",
                  ].join(" ")}
                >
                  <h3 className="text-[#FAFAFA] text-[15px] font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[#71717A] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 3. What Sovereign.os does ───────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#050505]">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 justify-between items-start">

            {/* Sticky label column */}
            <div className="lg:w-[280px] shrink-0 space-y-5 lg:sticky lg:top-24">
              <SectionLabel>The Loop</SectionLabel>
              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-snug">
                How the platform works
              </h2>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Sovereign.os does not chat with you. It provides structured architectural insight into your situations, allowing you to interrupt old patterns.
              </p>
            </div>

            {/* Step cards */}
            <div className="flex-1 flex flex-col gap-0 border border-white/[0.07]">
              {HOW_IT_WORKS.map((item, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-start gap-6 p-7 md:p-8 group",
                    i < HOW_IT_WORKS.length - 1 ? "border-b border-white/[0.07]" : "",
                  ].join(" ")}
                >
                  <span className="text-[#3F3F46] font-mono text-xs mt-[3px] shrink-0 w-6">
                    {item.step}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-[#FAFAFA] text-[15px] font-medium tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-[#71717A] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 4. Baseline Design ──────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#080808]">
        <Container>
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
              <SectionLabel>Foundation</SectionLabel>
              <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                Baseline Design
              </h2>
              <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl">
                The context that exists before you type. Your core attachment patterns, relational history, and default responses — established once, applied to every session.
              </p>
            </div>

            <div className="border border-white/[0.07] divide-y divide-white/[0.07]">
              {[
                {
                  label: "Core Pattern",
                  desc: "Your primary relational architecture — how you learned to connect and protect yourself.",
                },
                {
                  label: "Default Roles",
                  desc: "The recurring positions you step into without choosing them: caretaker, mediator, exile.",
                },
                {
                  label: "Threshold Markers",
                  desc: "The specific situations that reliably trigger your oldest protective responses.",
                },
              ].map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8 px-7 py-5">
                  <span className="text-[#FAFAFA] text-[13px] font-medium font-mono tracking-tight shrink-0 sm:w-40">
                    {row.label}
                  </span>
                  <p className="text-[#71717A] text-sm leading-relaxed">{row.desc}</p>
                </div>
              ))}
            </div>

            <Link href="/login">
              <Button
                size="lg"
                className="rounded-none bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-11 px-7 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
              >
                Start Baseline Design
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── 5. Defrag Space ─────────────────────────────────────────────────── */}
      <Section id="defrag" className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#050505]">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">

            <div className="space-y-4">
              <SectionLabel>Primary Action</SectionLabel>
              <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                The Defrag Space
              </h2>
              <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl">
                Bring what feels active, unresolved, or repeating. Receive a structured breakdown of the dynamic — not a paragraph of advice.
              </p>
            </div>

            {/* Feature tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border border-white/[0.07]">
              {[
                {
                  tag: "A",
                  title: "Structured Results",
                  desc: "Defrag breaks the situation into: Active Pattern · The Repeat · The Old Role · What You Learned to Carry.",
                },
                {
                  tag: "B",
                  title: "Clear Direction",
                  desc: "Move from insight to action with a Best Next Response and Conversational Steering for every situation.",
                },
                {
                  tag: "C",
                  title: "No Chat Interface",
                  desc: "This is not a dialogue. It is a structured reading of a dynamic — returned to you, not discussed with you.",
                },
                {
                  tag: "D",
                  title: "Baseline-Aware",
                  desc: "Every Defrag result is filtered through your Baseline Design, so the output is always contextually yours.",
                },
              ].map((tile, i) => (
                <div
                  key={i}
                  className={[
                    "p-8 md:p-10 space-y-4",
                    i % 2 === 0 ? "sm:border-r border-white/[0.07]" : "",
                    i < 2 ? "border-b border-white/[0.07]" : "",
                  ].join(" ")}
                >
                  <div className="w-8 h-8 border border-white/[0.12] flex items-center justify-center text-[#FAFAFA] font-mono text-[10px] tracking-widest">
                    {tile.tag}
                  </div>
                  <h3 className="text-[#FAFAFA] text-[15px] font-medium tracking-tight">
                    {tile.title}
                  </h3>
                  <p className="text-[#71717A] text-sm leading-relaxed">{tile.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 6. Covenant Space ───────────────────────────────────────────────── */}
      <Section id="covenant" className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#080808]">
        <Container>
          <div className="flex flex-col lg:flex-row gap-14 xl:gap-20 items-start">

            {/* Copy */}
            <div className="lg:w-[44%] space-y-7">
              <SectionLabel>Optional Module</SectionLabel>
              <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                The Covenant Space
              </h2>
              <p className="text-[#A1A1AA] text-base leading-relaxed">
                A grounded reflection space for faith context. Connect real-life situations to Scripture, responsibility, repair, and discernment.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "No preachy conclusions.",
                  "Focus on responsibility and repair.",
                  "Connects to the same Sovereign Library.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#A1A1AA] text-sm leading-relaxed">
                    <Dot />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock card */}
            <div className="lg:w-[56%] w-full">
              <div className="border border-white/[0.08] bg-[#0A0A0A] p-8 md:p-10 relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.025)_0,transparent_60%)]"
                />
                <div className="relative z-10 border border-white/[0.07] bg-[#070707] p-6 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 w-16 bg-white/[0.08]" />
                    <SectionLabel>Covenant Brief</SectionLabel>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <div className="h-3 w-3/4 bg-white/[0.05] rounded-sm" />
                    <div className="h-3 w-full bg-white/[0.05] rounded-sm" />
                    <div className="h-3 w-5/6 bg-white/[0.05] rounded-sm" />
                  </div>
                  <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-2">
                    <div className="h-2.5 w-full bg-white/[0.03] rounded-sm" />
                    <div className="h-2.5 w-4/5 bg-white/[0.03] rounded-sm" />
                    <div className="h-2.5 w-2/3 bg-white/[0.03] rounded-sm" />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <div className="h-7 w-20 bg-white/[0.06] rounded-sm" />
                    <div className="h-7 w-14 bg-white/[0.03] rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 7. Alignment Space ──────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#050505]">
        <Container>
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
              <SectionLabel>Response Layer</SectionLabel>
              <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                The Alignment Space
              </h2>
              <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl">
                Turn insight into usable response. Understand what is active in you, what is yours to hold, and what is not yours to carry. Find the response that fits who you are now — not who you were in the old pattern.
              </p>
            </div>

            <div className="border border-white/[0.07] divide-y divide-white/[0.07]">
              {[
                {
                  label: "What is Active",
                  desc: "Identify the emotional charge that is present right now, separate from the story.",
                },
                {
                  label: "What is Yours",
                  desc: "Distinguish between your responsibility in this moment and what you have been conditioned to carry.",
                },
                {
                  label: "How to Respond",
                  desc: "A specific, grounded response — calibrated to your Baseline and the current situation.",
                },
              ].map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8 px-7 py-5">
                  <span className="text-[#FAFAFA] text-[13px] font-medium font-mono tracking-tight shrink-0 sm:w-40">
                    {row.label}
                  </span>
                  <p className="text-[#71717A] text-sm leading-relaxed">{row.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 8. When Both Sides Matter ───────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#080808]">
        <Container>
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
              <SectionLabel>Consent-Based</SectionLabel>
              <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                Invite Privately
              </h2>
              <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl">
                When both sides matter. A consent-based comparison of patterns to see where the collision is happening — not to determine who is wrong.
              </p>
            </div>

            {/* What it is not */}
            <div className="border border-white/[0.07]">
              <div className="px-7 py-4 border-b border-white/[0.07]">
                <span className="text-[#71717A] font-mono text-[10px] tracking-[0.15em] uppercase">
                  What it is not
                </span>
              </div>
              <div className="divide-y divide-white/[0.07]">
                {["No diagnosis.", "No compatibility score.", "No verdict."].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 px-7 py-4">
                    <span className="font-mono text-[10px] text-[#3F3F46]">×</span>
                    <span className="text-[#71717A] text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What it does */}
            <div className="border border-white/[0.07]">
              <div className="px-7 py-4 border-b border-white/[0.07]">
                <span className="text-[#71717A] font-mono text-[10px] tracking-[0.15em] uppercase">
                  What it does
                </span>
              </div>
              <div className="divide-y divide-white/[0.07]">
                {[
                  "Shows where patterns collide.",
                  "Surfaces what each person is protecting.",
                  "Suggests where repair is possible.",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 px-7 py-4">
                    <span className="font-mono text-[10px] text-[#A1A1AA]">→</span>
                    <span className="text-[#A1A1AA] text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 9. Sovereign.os Library ─────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#050505]">
        <Container>
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <SectionLabel>Continuity Layer</SectionLabel>
              <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA] leading-tight">
                Sovereign.os Library
              </h2>
              <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl mx-auto">
                Not just storage. The private record of what helped. Save Defrag Results, Covenant Briefs, and Best Next Responses — and return to them before the old pattern takes over again.
              </p>
            </div>

            {/* Mock library rows */}
            <div className="border border-white/[0.07] divide-y divide-white/[0.07]">
              {[
                { type: "Defrag", label: "The argument that won't resolve", date: "Saved" },
                { type: "Covenant", label: "Where repair is mine to initiate", date: "Saved" },
                { type: "Alignment", label: "What I am carrying that isn't mine", date: "Saved" },
              ].map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-7 py-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[#3F3F46] font-mono text-[10px] tracking-widest uppercase shrink-0 w-16">
                      {entry.type}
                    </span>
                    <span className="text-[#A1A1AA] text-sm truncate">{entry.label}</span>
                  </div>
                  <span className="text-[#3F3F46] font-mono text-[10px] shrink-0">{entry.date}</span>
                </div>
              ))}
              <div className="px-7 py-4 text-center">
                <span className="text-[#3F3F46] font-mono text-[10px] tracking-[0.1em] uppercase">
                  Your entries will appear here
                </span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 10. Free vs Pro ─────────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#080808]">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold tracking-[-0.025em] text-[#FAFAFA]">
                Choose your depth
              </h2>
              <p className="mt-3 text-[#71717A] text-sm">Start free. Go deeper when you&apos;re ready.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/[0.07]">

              {/* Free */}
              <div className="p-8 md:p-10 space-y-7 border-b md:border-b-0 md:border-r border-white/[0.07]">
                <div className="space-y-2">
                  <h3 className="text-[#FAFAFA] text-xl font-medium">Free</h3>
                  <p className="text-[#71717A] text-sm">Understand a moment.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#FAFAFA] text-3xl font-semibold tracking-tight">$0</span>
                  <span className="text-[#71717A] text-sm">/forever</span>
                </div>
                <ul className="space-y-3">
                  {FREE_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#A1A1AA] text-sm leading-relaxed">
                      <Dot dim />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block">
                  <Button
                    variant="ghost"
                    className="w-full rounded-none border-white/[0.12] bg-transparent text-[#FAFAFA] hover:bg-white/[0.04] h-11 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>

              {/* Pro */}
              <div className="p-8 md:p-10 space-y-7 bg-[#0A0A0A] relative">
                <div className="absolute top-6 right-7">
                  <Badge className="bg-white text-[#050505] hover:bg-white/90 rounded-none font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-0.5">
                    Pro
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[#FAFAFA] text-xl font-medium">Sovereign Pro</h3>
                  <p className="text-[#71717A] text-sm">
                    Return, remember, compare, and interrupt the pattern.
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#FAFAFA] text-3xl font-semibold tracking-tight">$20</span>
                  <span className="text-[#71717A] text-sm">/mo</span>
                </div>
                <ul className="space-y-3">
                  {PRO_FEATURES.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#FAFAFA] text-sm leading-relaxed">
                      <Dot />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block">
                  <Button
                    className="w-full rounded-none bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-11 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
                  >
                    Start Sovereign Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 11. Final CTA ───────────────────────────────────────────────────── */}
      <Section className="w-full py-32 md:py-48 bg-[#050505] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <Container className="relative z-10 text-center max-w-[780px]">
          <div className="space-y-2 mb-10">
            <h2 className="text-[clamp(2.4rem,6.5vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance">
              Healing isn&apos;t optional.
            </h2>
            <h2 className="text-[clamp(2.4rem,6.5vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#3F3F46] leading-[1.04] text-balance">
              Holding the pain is.
            </h2>
          </div>

          <p className="text-[#71717A] text-sm font-mono tracking-[0.12em] uppercase mb-10">
            The platform is ready when you are.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <Button
                size="lg"
                className="rounded-none bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-12 px-10 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
              >
                Enter Sovereign.os
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="ghost"
                className="rounded-none border-white/[0.12] bg-transparent text-[#FAFAFA] hover:bg-white/[0.04] hover:text-white h-12 px-8 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
              >
                Start Baseline Design
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

    </main>
  )
}
