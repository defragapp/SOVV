import type { Metadata } from "next";
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";

export const metadata: Metadata = {
  title: "Product — Sovereign.os",
  description: "Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries. Your Baseline Design is the source.",
  openGraph: {
    title: "Product — Sovereign.os",
    description: "Sovereign.os helps you work through the patterns that keep showing up. Your Baseline Design is the source.",
  },
};

const SURFACES = [
  {
    title: "Baseline Design",
    body: "The starting map. How you tend to process, respond, connect, protect, communicate, and return to center. Every thread is grounded here. Private, never exposed in outputs.",
    tag: "01",
  },
  {
    title: "Defrag",
    body: "For the moment that will not leave you alone. Defrag helps you slow the moment down, separate what happened from what repeated, and find the next response that does not keep feeding the same pattern.",
    tag: "02",
  },
  {
    title: "Covenant",
    body: "For the user who wants faith to stay connected to the work. Covenant helps bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.",
    tag: "03",
  },
  {
    title: "The Library",
    body: "Your Library keeps what the moment taught you. The response you found. The pattern you finally saw. The boundary that became clear. Save to Sovereign before the moment disappears.",
    tag: "04",
  },
  {
    title: "Invite Privately",
    body: "Two people can live through the same conversation and leave with completely different truths. The other side is not always the enemy. Sometimes it is another nervous system, another history, another map. When both sides matter, invite privately.",
    tag: "05",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-none border-border bg-transparent text-[#76716b] font-sans font-medium text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit"
    >
      {children}
    </Badge>
  )
}

export default function ProductPage() {
  return (
    <SiteShell>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[80svh] pt-32 pb-24 overflow-hidden border-b border-border bg-surface">
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
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>THE SYSTEM</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-semibold tracking-[-0.035em] text-[#f4efe9] leading-[1.04] text-balance mb-8">
            Turn charged conversations into something you can work with.
          </h1>

          <p className="text-[#a8a29a] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[640px] mb-12 text-balance leading-[1.65]">
            Sovereign.os helps you work through the moments that keep replaying — the message, the conflict, the family role, the grief, the boundary — and save what you learn before the pattern takes over again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-none bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] h-12 px-8 font-sans font-medium text-[11px] tracking-[0.1em] uppercase transition-colors"
              >
                Enter Sovereign.os
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── Product Surfaces ──────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-border bg-surface">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
            
            <div className="lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-32">
              <SectionLabel>The Architecture</SectionLabel>
              <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-semibold tracking-[-0.025em] text-[#f4efe9] leading-tight">
                You do not need a verdict.<br/>
                <span className="text-[#a8a29a]">You need a way through.</span>
              </h2>
              <p className="text-[#76716b] text-sm leading-relaxed">
                The conversation ended. Your body did not. Some messages do not need a reply yet. They need context. 
                Sovereign.os gives those moments structure — without turning them into a diagnosis, a score, or a verdict.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-0 border border-border">
              {SURFACES.map((s, i) => (
                <div
                  key={i}
                  className={[
                    "flex items-start gap-6 p-7 md:p-10 group bg-surface",
                    i < SURFACES.length - 1 ? "border-b border-border" : "",
                  ].join(" ")}
                >
                  <span className="text-[#4f4b47] font-sans font-medium text-xs mt-1 shrink-0 w-6">
                    {s.tag}
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-[#f4efe9] text-[17px] font-medium tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-[#a8a29a] text-[15px] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Container>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <Section className="w-full py-32 md:py-48 bg-surface relative overflow-hidden">
        <Container className="relative z-10 text-center max-w-[780px]">
          <h2 className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold tracking-[-0.035em] text-[#f4efe9] leading-[1.04] text-balance mb-12">
            Your next response can change the pattern.
          </h2>
          <Link href="/login" className="inline-block">
            <Button
              size="lg"
              className="rounded-none bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] h-12 px-10 font-sans font-medium text-[11px] tracking-[0.1em] uppercase transition-colors"
            >
              Start Baseline Design
            </Button>
          </Link>
        </Container>
      </Section>

    </SiteShell>
  );
}
