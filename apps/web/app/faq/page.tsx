import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";
import { Container, Section } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "FAQ — Sovereign.os",
  description: "Common questions about Sovereign.os, Baseline Design, Defrag, Covenant, and the Sovereign.os Library.",
};

const FAQ_ITEMS = [
  {
    q: "What is Sovereign.os?",
    a: "Sovereign.os is pattern-aware AI for the moments that are hard to read while you're inside them. It helps you understand what's active, what may be repeating, and what next move gives the situation a better chance — before pressure chooses for you.",
  },
  {
    q: "What is the Baseline Design?",
    a: "Your Baseline Design is the starting map. It shows how you tend to process, respond, connect, protect, communicate, and return to center. It is active beneath every thread and never exposed in outputs.",
  },
  {
    q: "What is the Defrag space?",
    a: "Defrag is the core space inside Sovereign.os. Describe the situation — a message, conflict, boundary, family dynamic, or grief point — and Defrag shows what's active, what may be repeating, and your Best Next Response. Free to use.",
  },
  {
    q: "What is the Covenant space?",
    a: "Covenant is the faith-context reflection space inside Sovereign.os. It is for users who want faith connected to the work — not as certainty, not as performance, but as faith connected to repair and the next honest step.",
  },
  {
    q: "What is the Alignment space?",
    a: "Alignment is the response integration and action choice space. It helps turn insights into actionable responses, showing you what is yours to carry and what belongs to the other side.",
  },
  {
    q: "What is the Sovereign.os Library?",
    a: "The Library is the private record of what helped. Save a Result to Sovereign before the moment disappears. Return to your Library before the old pattern takes over again.",
  },
  {
    q: "Is this a replacement for therapy?",
    a: "No. Sovereign.os is complementary — it gives you a personal way to understand your patterns and respond differently, including between sessions. It does not diagnose, predict, or replace professional judgment. If you are in crisis, please contact a qualified professional or emergency services.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your Baseline Design and everything you share are held privately, encrypted, and never sold or exposed in outputs. Private by design.",
  },
  {
    q: "What is Invite Privately?",
    a: "Two people can live through the same conversation and leave with completely different truths. Invite Privately lets you understand the shared loop without keeping score — when both sides matter.",
  },
  {
    q: "How do I get access?",
    a: "Create your space at defrag.app. The Free tier gives you access to the Defrag space and your Baseline Design. Pro unlocks all spaces, unlimited sessions, and full Library depth.",
  },
];

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">
        {children}
      </span>
    </div>
  );
}

export default function FaqPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[45svh] pt-32 pb-20 overflow-hidden bg-[#08070a] border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[700px]">
          <MetaLabel>FAQ</MetaLabel>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-6">
            Common questions.
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-[500px] text-balance leading-relaxed">
            Everything you need to know about Sovereign.os and how it works.
          </p>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container className="max-w-3xl">
          <div className="flex flex-col">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group border-b border-white/[0.06] py-6 cursor-pointer">
                <summary className="flex items-center justify-between gap-4 text-[#f4efe9] text-base md:text-lg font-normal list-none">
                  {item.q}
                  <span className="flex-none text-xl text-[#e0743a] transition-transform duration-200 group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm md:text-base text-[#a8a29a] leading-relaxed max-w-2xl">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </Section>
      {/* CTA */}
      <Section className="w-full py-16 md:py-20 bg-[#08070a] border-t border-white/[0.04] text-center">
        <Container className="relative z-10 flex flex-col items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">Start here</p>
          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] mb-5 text-balance max-w-xl leading-tight">
            Defrag is free. Start with one moment.
          </h2>
          <p className="text-[14px] text-[#76716b] leading-relaxed mb-8 max-w-sm">
            Add your birth data, describe what&rsquo;s happening, and see what&rsquo;s actually active beneath it.
          </p>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </Section>
    </SiteShell>
  );
}
