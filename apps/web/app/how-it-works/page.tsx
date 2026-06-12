import type { Metadata } from "next";
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";

export const metadata: Metadata = {
  title: "How it works — Sovereign.os",
  description: "Set your Baseline Design. Work through what is active. Find the response that changes the pattern. Save what you learn.",
};

const STEPS = [
  {
    num: "01",
    title: "Set your Baseline Design",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. It gives the system context so the work does not begin with “what is wrong with me?” It begins with “what pattern is active?”",
  },
  {
    num: "02",
    title: "Work through what is active",
    body: "Enter the Defrag space. Tell it what is happening. A message you haven't sent. A conversation that keeps repeating. A family role that still runs. Defrag helps slow the moment down, separating what happened from what repeated.",
  },
  {
    num: "03",
    title: "Find the response that changes the pattern",
    body: "Understand what is driving the dynamic before it takes over. See the Best Next Response. You are not overreacting, you may be repeating. See where the pattern twists, and how to bring it back.",
  },
  {
    num: "04",
    title: "Save what you learn",
    body: "Save the result or the reflection to your Sovereign.os Library before the pressure of the moment erases it. Build continuity instead of starting over every time something hurts.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-none border-border bg-transparent text-[#71717A] font-sans font-medium text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit"
    >
      {children}
    </Badge>
  )
}

export default function HowItWorksPage() {
  return (
    <SiteShell>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[70svh] pt-32 pb-24 overflow-hidden border-b border-border bg-surface">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>HOW IT WORKS</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance mb-8">
            Start with what is happening now.
          </h1>

          <p className="text-[#A1A1AA] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[560px] text-balance leading-[1.65]">
            Put the moment into context. Understand the pattern underneath it. Find the next response that changes it.
          </p>
        </Container>
      </Section>

      {/* ── Steps ─────────────────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-border bg-surface">
        <Container className="max-w-4xl">
          <div className="space-y-0 border border-border">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={[
                  "flex flex-col md:flex-row gap-8 items-start p-8 md:p-12 bg-surface",
                  i < STEPS.length - 1 ? "border-b border-border" : "",
                ].join(" ")}
              >
                <div className="w-full md:w-[120px] shrink-0">
                  <span className="text-[#3F3F46] font-sans font-medium text-3xl tracking-tighter">
                    {step.num}
                  </span>
                </div>
                <div className="flex-1 space-y-4 pt-1">
                  <h3 className="text-[#FAFAFA] text-[22px] font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[#A1A1AA] text-[15px] leading-relaxed max-w-xl">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <Section className="w-full py-32 md:py-48 bg-surface relative overflow-hidden">
        <Container className="relative z-10 text-center max-w-[780px]">
          <h2 className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance mb-12">
            The wound is real. So is the choice after it.
          </h2>
          <Link href="/login" className="inline-block">
            <Button
              size="lg"
              className="rounded-none bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-12 px-10 font-sans font-medium text-[11px] tracking-[0.1em] uppercase transition-colors"
            >
              Enter Sovereign.os
            </Button>
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}
