import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center selection:bg-white/10 selection:text-white bg-[#050505]">

      {/* 1. Hero Section */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[100svh] pt-32 pb-24 overflow-hidden border-b border-white/[0.06]">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-4xl">

          <div className="mb-10 flex items-center gap-3">
            <div className="h-px w-8 bg-white/20" />
            <Badge variant="outline" className="rounded-none border-white/[0.12] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
              SOVEREIGN.OS
            </Badge>
            <div className="h-px w-8 bg-white/20" />
          </div>

          <div className="space-y-5 mb-10">
            <h1 className="text-5xl md:text-[72px] font-semibold tracking-[-0.03em] text-[#FAFAFA] leading-[1.05] text-balance">
              Healing isn&apos;t optional.
            </h1>
            <h1 className="text-5xl md:text-[72px] font-semibold tracking-[-0.03em] text-[#3F3F46] leading-[1.05] text-balance">
              Holding the pain is.
            </h1>
          </div>

          <p className="text-base md:text-lg text-[#71717A] max-w-xl leading-relaxed text-pretty mb-10">
            Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
          </p>

          <div className="w-full max-w-xs border border-white/[0.06] divide-y divide-white/[0.06] mb-12 text-left">
            <p className="text-sm text-[#71717A] px-4 py-3 font-mono tracking-wide">See what is actually happening.</p>
            <p className="text-sm text-[#71717A] px-4 py-3 font-mono tracking-wide">Understand your role in it.</p>
            <p className="text-sm text-[#FAFAFA] px-4 py-3 font-mono tracking-wide">Respond differently.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors">
                Enter Sovereign.os
              </Button>
            </Link>
            <Link href="/settings" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors">
                Start Baseline Design
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 2. What this helps with — Bento Grid */}
      <Section className="w-full border-b border-white/[0.06]">
        <Container>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-1 border-l-2 border-white/[0.08] pl-5">
              <p className="text-[10px] font-mono text-[#52525B] tracking-[0.2em] uppercase mb-2">01 / SCOPE</p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">What this helps with</h2>
              <p className="text-sm text-[#71717A] mt-1 leading-relaxed max-w-sm">
                Most platforms track tasks. Sovereign.os helps you track the undercurrents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
              {[
                { title: "Relational Dynamics", desc: "Understand repeating conflicts and connection patterns." },
                { title: "Family Roles", desc: "See the part you learned to play under pressure." },
                { title: "Boundaries", desc: "Clarify where you end and others begin." },
                { title: "Grief", desc: "Hold space for loss without forcing a fix." },
                { title: "Communication Breakdowns", desc: "Decode what is actually being said when wires cross." },
                { title: "Team Dynamics", desc: "Navigate unspoken tension and alignment issues." }
              ].map((item, i) => (
                <div key={i} className="bg-[#050505] p-6 flex flex-col gap-3 group hover:bg-[#0C0C0C] transition-colors">
                  <div className="w-1 h-1 bg-white/20 mb-1" />
                  <h3 className="text-sm font-medium text-[#FAFAFA] tracking-tight">{item.title}</h3>
                  <p className="text-xs text-[#52525B] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. The Problem */}
      <Section className="w-full border-b border-white/[0.06]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.05]">
            <div className="bg-[#050505] p-10 lg:p-14 flex flex-col gap-8">
              <p className="text-[10px] font-mono text-[#52525B] tracking-[0.2em] uppercase">02 / APPROACH</p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-[#FAFAFA] text-balance">
                Most advice tries to fix the symptom.<br className="hidden md:block" /> We look at the source.
              </h2>
              <div className="space-y-5 text-sm text-[#71717A] leading-relaxed">
                <p>Sovereign.os gives structure to what usually stays tangled.</p>
                <p className="text-[#52525B]">It helps you see:</p>
                <ul className="space-y-0 border-l border-white/[0.08]">
                  {[
                    "what is actually driving the situation",
                    "what part of it keeps repeating",
                    "how you tend to respond under pressure",
                    "where the pattern holds in place",
                    "what kind of next response could change it",
                  ].map((line, i) => (
                    <li key={i} className="px-4 py-2.5 text-xs text-[#71717A] border-b border-white/[0.04] last:border-0 font-mono">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#080808] p-10 lg:p-14 flex flex-col gap-8 border-l border-white/[0.05]">
              <Badge variant="outline" className="self-start rounded-none border-white/[0.1] bg-transparent text-[#52525B] font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1">
                Trust Block
              </Badge>
              <div className="flex flex-col gap-5 flex-1">
                {["No diagnosis.", "No compatibility score.", "No verdict."].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <p className="text-lg font-medium text-[#3F3F46] tracking-tight">{text}</p>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-white/[0.06]">
                <p className="text-base text-[#FAFAFA] leading-relaxed text-pretty">
                  Just a clearer understanding — and a better next move.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. Baseline Design */}
      <Section className="w-full border-b border-white/[0.06] bg-[#030303]">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center text-center gap-8 py-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-white/10" />
              <Badge className="rounded-none border border-white/[0.1] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
                Baseline Design
              </Badge>
              <div className="h-px w-6 bg-white/10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] text-balance">
              Your Baseline Design is the source.
            </h2>
            <p className="text-sm text-[#71717A] leading-relaxed max-w-md text-pretty">
              Your Baseline Design gives Sovereign.os context for how you process pressure, conflict, connection, repair, timing, and alignment.
            </p>
            <div className="w-full max-w-sm border border-white/[0.06] divide-y divide-white/[0.04]">
              <p className="py-3 px-4 text-xs font-mono text-[#3F3F46] line-through decoration-white/10">Not as a label.</p>
              <p className="py-3 px-4 text-xs font-mono text-[#3F3F46] line-through decoration-white/10">Not as an excuse.</p>
              <p className="py-3 px-4 text-xs font-mono text-[#FAFAFA]">As context.</p>
            </div>
            <Link href="/settings">
              <Button variant="secondary" className="rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-xs tracking-[0.15em] uppercase h-10 px-6 transition-colors">
                Start Baseline Design
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 5. Defrag */}
      <Section className="w-full border-b border-white/[0.06]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.05]">
            <div className="bg-[#080808] p-10 lg:p-14 flex flex-col gap-8 order-2 lg:order-1 border-r border-white/[0.05]">
              <Badge variant="defrag" className="self-start rounded-none border border-white/[0.1] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
                Defrag Space
              </Badge>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-[#FAFAFA] text-balance">
                Defrag is where the pattern becomes workable.
              </h2>
              <div className="space-y-4 text-sm text-[#71717A] leading-relaxed">
                <p>Defrag helps you make sense of conflict, family roles, grief, boundaries, communication breakdowns, parenting pressure, team dynamics, and relationship patterns.</p>
                <p>It separates what is happening right now from what has been repeating underneath — so you can choose a response with more clarity.</p>
              </div>
              <Link href="/apps/defrag" className="mt-2">
                <Button className="rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-xs tracking-[0.15em] uppercase h-10 px-6 transition-colors">
                  Explore Defrag
                </Button>
              </Link>
            </div>
            <div className="bg-[#050505] p-10 lg:p-14 order-1 lg:order-2">
              <div className="space-y-0 border border-white/[0.06]">
                {[
                  "See what is active.",
                  "Spot what is repeating.",
                  "Notice the role you step into under pressure.",
                  "Get a clearer next response.",
                  "Save what helped.",
                ].map((val, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-white/[0.05] last:border-0">
                    <span className="text-[10px] font-mono text-[#3F3F46] mt-0.5 shrink-0 w-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm text-[#FAFAFA] leading-snug">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. Covenant */}
      <Section className="w-full border-b border-white/[0.06] bg-[#030303]">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center text-center gap-8 py-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-white/10" />
              <Badge variant="covenant" className="rounded-none border border-white/[0.1] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
                Covenant Space
              </Badge>
              <div className="h-px w-6 bg-white/10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] text-balance">
              Faith connected to repair, responsibility, and the next honest step.
            </h2>
            <p className="text-sm text-[#71717A] leading-relaxed max-w-md text-pretty">
              Covenant is for users who want faith connected to the work.
            </p>
            <div className="w-full max-w-sm border border-white/[0.06] divide-y divide-white/[0.04]">
              <p className="py-3 px-4 text-xs font-mono text-[#3F3F46] line-through decoration-white/10">Not as certainty.</p>
              <p className="py-3 px-4 text-xs font-mono text-[#3F3F46] line-through decoration-white/10">Not as performance.</p>
              <p className="py-3 px-4 text-xs font-mono text-[#FAFAFA]">Not as a shortcut around responsibility.</p>
            </div>
            <Link href="/apps/covenant">
              <Button variant="secondary" className="rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-xs tracking-[0.15em] uppercase h-10 px-6 transition-colors">
                Explore Covenant
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 7. When both sides matter */}
      <Section className="w-full border-b border-white/[0.06]">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center text-center gap-8 py-4">
            <p className="text-[10px] font-mono text-[#52525B] tracking-[0.2em] uppercase">03 / SHARED CONTEXT</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] text-balance">
              Some patterns need both sides.
            </h2>
            <div className="space-y-4 max-w-lg">
              <p className="text-sm text-[#71717A] leading-relaxed text-pretty">
                With consent, Sovereign.os can compare two Baseline Designs — not to decide who is right, not to score the relationship, and not to diagnose anyone.
              </p>
              <p className="text-sm text-[#FAFAFA] leading-relaxed">
                It helps show how the same dynamic may be experienced differently from each side.
              </p>
            </div>
            <Button variant="secondary" className="rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-xs tracking-[0.15em] uppercase h-10 px-6 transition-colors">
              Invite Privately
            </Button>
          </div>
        </Container>
      </Section>

      {/* 8. Library */}
      <Section className="w-full border-b border-white/[0.06] bg-[#030303]">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center text-center gap-8 py-4">
            <p className="text-[10px] font-mono text-[#52525B] tracking-[0.2em] uppercase">04 / LIBRARY</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[#FAFAFA] text-balance">
              Your Library keeps the work worth returning to.
            </h2>
            <p className="text-sm text-[#71717A] leading-relaxed max-w-md text-pretty">
              Save Results, reflections, next responses, Covenant Briefs, and the patterns you do not want to lose once the pressure passes.
            </p>
            <Link href="/app">
              <Button variant="secondary" className="rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-xs tracking-[0.15em] uppercase h-10 px-6 transition-colors">
                Open Library
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 9. Pro Pricing */}
      <Section className="w-full border-b border-white/[0.06]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.05]">
            <div className="bg-[#050505] p-10 lg:p-14 flex flex-col gap-8">
              <Badge variant="pro" className="self-start rounded-none border border-white/[0.1] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
                Pro Plan
              </Badge>
              <div>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight text-[#FAFAFA]">
                  Free helps you begin.
                </h2>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight text-[#3F3F46]">
                  Pro helps you stay with it.
                </h2>
              </div>
              <p className="text-sm text-[#FAFAFA] leading-relaxed">
                Pro is for the patterns that need continuity.
              </p>
              <Link href="/pricing" className="mt-2">
                <Button variant="premium" className="rounded-none border border-white bg-white text-black hover:bg-white/90 font-mono text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
            <div className="bg-[#080808] p-10 lg:p-14 border-l border-white/[0.05]">
              <div className="border border-white/[0.06] divide-y divide-white/[0.05]">
                {[
                  "Save Results",
                  "Return to your Library",
                  "Use deeper context",
                  "Invite privately",
                  "Work across Defrag and Covenant",
                  "Keep continuity instead of starting over every time something repeats",
                ].map((val, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-4">
                    <svg className="w-3.5 h-3.5 text-[#FAFAFA] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[#A1A1AA] leading-snug">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 10. Final CTA */}
      <Section className="w-full py-36 bg-[#030303]">
        <Container className="text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="h-px w-8 bg-white/10" />
            <Badge variant="outline" className="rounded-none border-white/[0.1] bg-transparent text-[#52525B] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
              SOVEREIGN.OS
            </Badge>
            <div className="h-px w-8 bg-white/10" />
          </div>
          <h2 className="text-5xl font-semibold tracking-[-0.03em] text-[#FAFAFA] leading-tight text-balance mb-4">
            Healing isn&apos;t optional.
          </h2>
          <h2 className="text-5xl font-semibold tracking-[-0.03em] text-[#3F3F46] leading-tight text-balance mb-12">
            Holding the pain is.
          </h2>
          <div className="w-full max-w-xs mx-auto border border-white/[0.06] divide-y divide-white/[0.04] mb-12 text-left">
            <p className="text-xs text-[#71717A] px-4 py-3 font-mono">See what is shaping the pattern.</p>
            <p className="text-xs text-[#FAFAFA] px-4 py-3 font-mono">Choose what changes next.</p>
          </div>
          <Link href="/login">
            <Button size="lg" className="rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-xs tracking-[0.15em] uppercase h-12 px-10 transition-colors">
              Enter Sovereign.os
            </Button>
          </Link>
        </Container>
      </Section>

    </main>
  )
}
