import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How It Works — Sovereign.os",
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
    body: "Seven outputs: the active pattern, what keeps happening, your default mode, what shaped it, how it behaves under pressure, what is working, and the clearest next response.",
    note: null,
  },
  {
    num: "04",
    title: "Save to your Library",
    body: "Save the result before the moment disappears. Your Library holds what helped.",
    note: null,
  },
  {
    num: "05",
    title: "Return before the pattern takes over",
    body: "The next time the loop tries to form, you do not start from zero. Return to your Library, interrupt the old role, and respond differently.",
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
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>The process</MetaLabel>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-8">
            How Sovereign.os works.
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
              <div key={step.num}>
                <div className="flex items-start gap-8 py-8">
                  {/* Number + connector line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-10 h-10 flex items-center justify-center border border-white/[0.08] bg-[#0c0a0d]"
                      style={{ borderRadius: 8 }}
                    >
                      <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.2em]">{step.num}</span>
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
          <Link href="https://app.defrag.app/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
