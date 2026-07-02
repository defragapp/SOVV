import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

const APP_URL = "/app/login"

const steps = [
  {
    n: "01",
    label: "Describe the moment",
    body: "Type what happened — the argument, the silence, the message you can't stop thinking about. Say it how it actually felt, not how you think it should sound.",
  },
  {
    n: "02",
    label: "Defrag reads the pattern",
    body: "Your Baseline Design is already active. Defrag uses it to separate what's yours from what's the situation, and names the loop that's running beneath the surface.",
  },
  {
    n: "03",
    label: "See the clearest next move",
    body: "Not a list of options. One specific, proportionate next step — grounded in how you actually move through pressure, not a generic response.",
  },
]

const useCases = [
  {
    input: "The conversation that keeps looping",
    output: "Name the pattern driving the loop before you re-enter it.",
  },
  {
    input: "The message I can't stop thinking about",
    output: "Separate what the message touched from what it actually said.",
  },
  {
    input: "The role I keep falling back into",
    output: "See what you learned to carry — and what you can set down.",
  },
  {
    input: "The silence after a hard moment",
    output: "Understand what the silence is protecting before you break it.",
  },
]

export default function DefragProductPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative min-h-[80vh] w-full overflow-hidden bg-[#08070a] border-b border-white/[0.06] flex items-center">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 pt-36 pb-28 md:pt-44 md:pb-36">
          <p className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/30 mb-6 text-[0.65rem]">
            Defrag · Free
          </p>
          <h1
            className="font-serif text-[#f4efe9] text-balance leading-[1.02] tracking-[-0.03em] max-w-4xl"
            style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)" }}
          >
            <span className="text-glow">See the loop</span> before it runs you again.
          </h1>
          <p className="mt-7 max-w-lg text-[#a8a29a] leading-relaxed text-base md:text-lg">
            Defrag separates the moment from the pattern, names the pressure, and gives you one clear next move — grounded in your Baseline Design.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start">
            <Link href={APP_URL} className="btn-primary">
              Start with your baseline
            </Link>
            <Link href="/pricing" className="btn-secondary" style={{ opacity: 0.75 }}>
              See plans
            </Link>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-b border-white/[0.06]">
        <Container>
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">How it works</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              Three steps. One clear result.
            </h2>
          </div>

          <div className="grid gap-px bg-white/[0.05] border border-white/[0.05] md:grid-cols-3 overflow-hidden" style={{ borderRadius: 14 }}>
            {steps.map((step) => (
              <div key={step.n} className="bg-[#0c0a0d] p-8 md:p-10 glow-card-hover cursor-default">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#4f4b47] block mb-8">{step.n}</span>
                <h3 className="font-serif text-[1.35rem] text-[#f4efe9] leading-snug mb-4">{step.label}</h3>
                <p className="text-[13px] text-[#76716b] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Use cases */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-b border-white/[0.06]">
        <Container className="max-w-3xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-6 bg-[#e0743a]/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">What you bring</span>
            </div>
            <h2
              className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight max-w-xl"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              Any moment that keeps repeating.
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-white/[0.05] border border-white/[0.06]" style={{ borderRadius: 14, overflow: "hidden" }}>
            {useCases.map((uc) => (
              <div key={uc.input} className="grid md:grid-cols-2 gap-0 bg-[#0c0a0d] glow-card-hover">
                <div className="px-6 py-5 border-b md:border-b-0 md:border-r border-white/[0.05]">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">You bring</p>
                  <p className="text-[14px] text-[#a8a29a] leading-relaxed">{uc.input}</p>
                </div>
                <div className="px-6 py-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50 mb-2">Defrag gives you</p>
                  <p className="text-[14px] text-[#f4efe9] leading-relaxed">{uc.output}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What makes it different */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-b border-white/[0.06]">
        <Container className="max-w-4xl">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="h-px w-6 bg-[#e0743a]/60" />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">What makes it different</span>
              </div>
              <h2
                className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-tight"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              >
                Not advice. Pattern recognition.
              </h2>
            </div>
            <div className="space-y-6 text-[#a8a29a] leading-relaxed">
              <p>
                Most tools give you a framework to apply. Defrag gives you a read on what&rsquo;s actually happening — using your Baseline Design as the lens, not a generic model.
              </p>
              <p>
                The result isn&rsquo;t a list of suggestions. It&rsquo;s a named pattern, the pressure beneath it, and one specific next move that fits how you actually work.
              </p>
              <p className="text-[#f4efe9]/70">
                Not a diagnosis. Not a prediction. A private place to see what&rsquo;s active and choose a clearer response before the old pattern speaks for you.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative w-full py-28 md:py-36 bg-[#08070a] overflow-hidden">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <h2
            className="font-serif text-[#f4efe9] tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Defrag is free. Start with one moment.
          </h2>
          <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
            Add your birth data, describe what&rsquo;s happening, and see what&rsquo;s actually active beneath it.
          </p>
          <div className="mt-9">
            <Link href={APP_URL} className="btn-primary">
              Start with your baseline
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
