import type { Metadata } from "next";
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";

export const metadata: Metadata = {
  title: "Use Cases — Sovereign.os",
  description: "Work through the message, the family role, the boundary, the grief, and the relationship dynamic you can feel but cannot fully name.",
};

const CASES = [
  {
    title: "Before you send the message",
    body: "You have written it three times. Something still feels off. Defrag helps you understand what is active in the moment — and whether sending it will get you what you actually want.",
    tag: "Message",
  },
  {
    title: "When a conversation keeps repeating",
    body: "The same argument. The same dynamic. The same outcome. What happened matters. What repeats matters more. Defrag shows where the loop starts so you can choose a different response.",
    tag: "Relationship",
  },
  {
    title: "When someone pulls away",
    body: "They went quiet. You do not know why. Defrag helps you see what may be active in the dynamic — without assuming the worst or excusing the pattern.",
    tag: "Relationship",
  },
  {
    title: "When a family loop keeps running",
    body: "The same tension at every gathering. The same roles. The same pressure. Some pain becomes a role. Some roles can be put down. Defrag helps you see the structure beneath it.",
    tag: "Family",
  },
  {
    title: "When you need to hold a boundary",
    body: "A boundary is not a punishment. It is a return to alignment. Defrag helps you understand what the boundary is protecting and how to hold it without reacting.",
    tag: "Boundary",
  },
  {
    title: "When grief changes how everything lands",
    body: "Grief changes how everything lands. The same words hit differently. You are not overreacting, you are grieving. Sovereign.os helps you see where the pressure is coming from.",
    tag: "Grief",
  },
];

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

export default function UseCasesPage() {
  return (
    <SiteShell>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[70svh] pt-32 pb-24 overflow-hidden border-b border-white/[0.06] bg-[#050505]">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <div className="mb-12 flex items-center gap-3">
            <div className="h-px w-10 bg-white/[0.14]" />
            <SectionLabel>USE CASES</SectionLabel>
            <div className="h-px w-10 bg-white/[0.14]" />
          </div>

          <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance mb-8">
            Stop carrying what keeps repeating.
          </h1>

          <p className="text-[#A1A1AA] text-base md:text-lg font-normal tracking-[-0.01em] max-w-[560px] text-balance leading-[1.65]">
            Work through the message, the family role, the boundary, the grief, and the relationship dynamic you can feel but cannot fully name.
          </p>
        </Container>
      </Section>

      {/* ── Cases Grid ────────────────────────────────────────────────────── */}
      <Section className="w-full py-24 md:py-32 border-b border-white/[0.06] bg-[#080808]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/[0.07]">
            {CASES.map((c, i) => (
              <div
                key={i}
                className={[
                  "p-8 space-y-6 bg-[#050505]",
                  i % 3 !== 2 ? "lg:border-r border-white/[0.07]" : "",
                  i % 2 !== 1 ? "md:border-r lg:border-r-0 border-white/[0.07]" : "",
                  i < CASES.length - 3 ? "lg:border-b border-white/[0.07]" : "",
                  i < CASES.length - 2 ? "md:border-b lg:border-b-0 border-white/[0.07]" : "",
                  i < CASES.length - 1 ? "border-b md:border-b-0 border-white/[0.07]" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-white/30 rounded-full" />
                  <span className="text-[#71717A] font-mono text-[10px] tracking-[0.15em] uppercase">
                    {c.tag}
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[#FAFAFA] text-[17px] font-medium tracking-tight">
                    {c.title}
                  </h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <Section className="w-full py-32 md:py-48 bg-[#050505] relative overflow-hidden">
        <Container className="relative z-10 text-center max-w-[780px]">
          <div className="space-y-2 mb-12">
            <h2 className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold tracking-[-0.035em] text-[#FAFAFA] leading-[1.04] text-balance">
              Healing isn&apos;t optional.
            </h2>
            <h2 className="text-[clamp(2.4rem,5vw,3.5rem)] font-semibold tracking-[-0.035em] text-[#3F3F46] leading-[1.04] text-balance">
              Holding the pain is.
            </h2>
          </div>
          <Link href="/login" className="inline-block">
            <Button
              size="lg"
              className="rounded-none bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-12 px-10 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors"
            >
              Enter Sovereign.os
            </Button>
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}
