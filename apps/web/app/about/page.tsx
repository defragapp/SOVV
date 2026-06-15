import type { Metadata } from "next";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Sovereign.os",
  description: "Sovereign.os is a private place to work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries.",
};

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[55svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <MetaLabel>About</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            Before you explain yourself again,
            <br />
            return to yourself first.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[560px] text-balance leading-relaxed">
            Not for abstract self-improvement. For the specific, real, sometimes difficult moments of actual life.
          </p>
        </Container>
      </Section>

      {/* Body */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="space-y-8 text-base text-[#a8a29a] leading-relaxed">
            <p>
              Sovereign.os is a private place to work through the patterns that keep showing up in your life. The message that unsettled you. The family role you keep falling back into. The boundary you keep negotiating with yourself. The grief that changes the room. The relational dynamic you can feel but cannot fully name.
            </p>
            <p>
              It gives those moments structure — without turning them into a diagnosis, a score, or a verdict.
            </p>
            <p>
              The platform is designed to be private, direct, and useful. Your Baseline Design is the starting map. Defrag, Covenant, and Alignment are the spaces where the work happens. The Sovereign.os Library is where you save what helped before the moment disappears.
            </p>
            <p>
              Sovereign.os does not diagnose, predict, or guarantee outcomes. It is not a replacement for therapy or professional support. It is the space between sessions — the moment before you send the message, the conversation that keeps repeating, the pattern you are finally ready to see.
            </p>
            <div className="border-t border-white/[0.06] pt-8 mt-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#4f4b47]">
                The wound is real. So is the choice after it.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="w-full py-24 bg-[#08070a] border-t border-white/5 relative overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] leading-tight mb-8 text-balance">
            The way through is already here.
          </h2>
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}