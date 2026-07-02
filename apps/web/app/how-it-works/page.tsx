import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How It Works",
  description: "Sovereign.os guides you from the moment that won't leave you alone toward a clearer way through.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

const STEPS = [
  {
    num: "01",
    title: "Set your Baseline Design",
    body: "Your date, time, and place of birth. Maps how you tend to process, respond, connect, protect, communicate, and return to center. Active beneath every thread. Private, never exposed in outputs.",
    note: "You do not have to explain who you are every time a moment happens.",
  },
  {
    num: "02",
    title: "Bring the moment",
    body: "Describe the pressure, the message, the dynamic, or the grief. Say it how it actually happened. No framework required.",
    note: null,
  },
  {
    num: "03",
    title: "Receive a structured result",
    body: "See what's active, the pattern beneath it, and the clearest next move — grounded in your Baseline Design, not a generic read. The result is specific to how you actually move through pressure.",
    note: null,
  },
  {
    num: "04",
    title: "Save to your Library",
    body: "Save the result before the moment disappears. Your Library holds what helped — so the next time the pattern shows up, you're not starting from scratch.",
    note: null,
  },
  {
    num: "05",
    title: "Return before the pattern takes over",
    body: "When the same moment comes back — and it will — your Library holds what you already worked through. Return to it before the old response takes over.",
    note: null,
  },
]

// Inline SVG flow connector
function FlowArrow() {
  return (
    <div className="flex justify-center py-2">
      <svg width="1" height="32" viewBox="0 0 1 32" fill="none">
        <line x1="0.5" y1="0" x2="0.5" y2="28" stroke="rgba(224,116,58,0.2)" strokeWidth="1"/>
        <path d="M-3 26l3.5 5 3.5-5" stroke="rgba(224,116,58,0.3)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <SiteShell>

      {/* Hero */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-50" aria-hidden />
        <div className="ambient-blob absolute -top-60 -right-60 w-[700px] h-[700px] opacity-[0.03]"
          style={{ background: "radial-gradient(circle, rgba(224,116,58,1) 0%, transparent 70%)" }} aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>The process</MetaLabel>
          <h1 className="reveal-up reveal-up-2 font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            <span className="text-glow">How Sovereign.os works.</span>
          </h1>
          <p className="text-[#a8a29a] text-lg max-w-lg leading-relaxed">
            The system understands your Baseline Design before you type. Here is the product loop.
          </p>
        </Container>
      </section>

      {/* Steps with visual flow */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d]">
        <Container>
          <div className="max-w-2xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step.num} className={`reveal-up reveal-up-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start gap-8 py-8">
                  {/* Number + connector line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-10 h-10 flex items-center justify-center border border-[#e0743a]/20 bg-[#e0743a]/[0.04]"
                      style={{ borderRadius: 8 }}
                    >
                      <span className="font-mono text-[10px] text-[#e0743a]/60 tracking-[0.2em]">{step.num}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 min-h-[32px] bg-white/[0.06] mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-[#f4efe9] font-medium text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-[#a8a29a] leading-relaxed mb-3">{step.body}</p>
                    {step.note && (
                      <p className="text-sm text-[#76716b] leading-relaxed border-l-2 border-[#e0743a]/20 pl-4">
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative w-full py-24 bg-[#08070a] border-t border-white/5 text-center overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-[#f4efe9] tracking-[-0.02em] mb-8 text-balance max-w-2xl mx-auto">
            Ready to interrupt the loop?
          </h2>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
