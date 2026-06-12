import { SiteShell } from "@/components/marketing/site-shell"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-none border-border bg-transparent text-[#71717A] font-sans font-medium text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit mb-6"
    >
      {children}
    </Badge>
  )
}

export default function Home() {
  return (
    <SiteShell>
      {/* 1. Hero */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[90svh] pt-32 pb-24 overflow-hidden bg-black">
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <Container className="relative z-10 flex flex-col items-center text-center max-w-[900px]">
          <h1 className="text-[clamp(3.5rem,8vw,7rem)] font-medium tracking-[-0.04em] text-[#FAFAFA] leading-[0.95] text-balance mb-8 animate-fade-up">
            Healing isn&apos;t optional.<br/>
            Holding the pain is.
          </h1>

          <p className="text-[#A1A1AA] text-lg md:text-xl font-normal tracking-[-0.01em] max-w-[680px] mb-12 text-balance leading-[1.6] animate-fade-up delay-100">
            Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center animate-fade-up delay-200">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-14 px-10 font-sans font-medium text-[13px] tracking-wide transition-transform hover:scale-[1.02]"
              >
                Enter Sovereign.os
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full border border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white h-14 px-10 font-sans font-medium text-[13px] tracking-wide transition-colors"
              >
                Start Baseline Design
              </Button>
            </Link>
          </div>
          
          <div className="flex gap-6 mt-12 animate-fade-up delay-300">
            <Link href="/product" className="text-[13px] text-white/40 hover:text-white transition-colors">Explore Defrag →</Link>
            <Link href="/covenant" className="text-[13px] text-white/40 hover:text-white transition-colors">Explore Covenant →</Link>
          </div>
        </Container>
      </Section>

      {/* 2. What this helps with & 3. What Sovereign.os does */}
      <Section className="w-full py-24 md:py-32 border-t border-border bg-[#0A0A0A]">
        <Container>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
              <div>
                 <SectionLabel>THE PROBLEM</SectionLabel>
                 <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6 leading-tight">See what is actually happening.</h2>
                 <p className="text-[#A1A1AA] text-base leading-relaxed max-w-md">
                   The conversation ended, but your body did not. The pattern keeps repeating in your family, your relationship, or your grief. The real problem isn&apos;t the argument; it&apos;s the unseen active pattern beneath it.
                 </p>
              </div>
              <div>
                 <SectionLabel>THE PLATFORM</SectionLabel>
                 <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6 leading-tight">Understand your role in it.<br/>Respond differently.</h2>
                 <p className="text-[#A1A1AA] text-base leading-relaxed max-w-md">
                   Sovereign.os helps you slow the moment down, separate what happened from what repeated, and find the next response that does not keep feeding the same loop. You don&apos;t need a verdict. You need a way through.
                 </p>
              </div>
           </div>
        </Container>
      </Section>

      {/* 4. Baseline Design */}
      <Section className="w-full py-24 md:py-32 border-t border-border bg-black">
        <Container className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 w-full">
             <div className="ui-fragment flex items-center justify-center bg-[#050505]">
                <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center">
                   <div className="w-32 h-32 rounded-full border border-white/20"></div>
                </div>
                <span className="absolute bottom-6 left-6 text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Core Context Engine</span>
             </div>
          </div>
          <div className="flex-1 space-y-6">
            <SectionLabel>01 // BASELINE DESIGN</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              The starting map.
            </h2>
            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-md">
              How you tend to process, respond, connect, protect, communicate, and return to center. Every thread is grounded here. Private, never exposed in outputs, always active before you type.
            </p>
          </div>
        </Container>
      </Section>

      {/* 5. Defrag space */}
      <Section className="w-full py-24 md:py-32 border-t border-border bg-[#0A0A0A]">
        <Container className="flex flex-col lg:flex-row-reverse gap-16 items-center">
          <div className="flex-1 w-full">
             <div className="ui-fragment p-8 flex flex-col justify-end bg-[#050505]">
                <div className="space-y-4 w-full">
                  <div className="h-4 bg-white/10 w-1/3 rounded"></div>
                  <div className="h-4 bg-white/5 w-3/4 rounded"></div>
                  <div className="h-4 bg-white/5 w-2/3 rounded"></div>
                </div>
                <span className="absolute top-6 left-6 text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Structured Result</span>
             </div>
          </div>
          <div className="flex-1 space-y-6">
            <SectionLabel>02 // DEFRAG SPACE</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Separate the moment from the pattern.
            </h2>
            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-md">
              For the moment that will not leave you alone. Defrag helps you understand what is active in the moment. Defrag supports relational dynamics, family dynamics, boundaries, messages, grief, and team dynamics.
            </p>
          </div>
        </Container>
      </Section>

      {/* 6. Covenant space */}
      <Section className="w-full py-24 md:py-32 border-t border-border bg-black">
        <Container className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 w-full">
             <div className="ui-fragment flex items-center justify-center bg-[#050505]">
                <div className="w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
                   <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-1 space-y-6">
            <SectionLabel>03 // COVENANT SPACE</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Reflection anchored in responsibility.
            </h2>
            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-md">
              For the user who wants faith to stay connected to the work. Covenant brings plain-language reflection, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
            </p>
          </div>
        </Container>
      </Section>

      {/* 7. Alignment space */}
      <Section className="w-full py-24 md:py-32 border-t border-border bg-[#0A0A0A]">
        <Container className="flex flex-col lg:flex-row-reverse gap-16 items-center">
          <div className="flex-1 w-full">
             <div className="ui-fragment p-8 flex flex-col justify-between bg-[#050505]">
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] text-white/50 uppercase">What is Yours</span>
                  <span className="text-[10px] text-white/50 uppercase">What is Not Yours</span>
                </div>
                <span className="absolute bottom-6 left-6 text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Response Integration</span>
             </div>
          </div>
          <div className="flex-1 space-y-6">
            <SectionLabel>04 // ALIGNMENT SPACE</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Turn insight into a usable response.
            </h2>
            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-md">
              Integration and action choice. It helps turn insights into actionable responses, showing you what is yours to carry and what belongs to the other side.
            </p>
          </div>
        </Container>
      </Section>

      {/* 8. When both sides matter */}
      <Section className="w-full py-24 md:py-32 border-t border-border bg-black">
        <Container className="text-center max-w-3xl space-y-8 flex flex-col items-center">
           <SectionLabel>05 // INVITE PRIVATELY</SectionLabel>
           <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white leading-tight">When both sides matter.</h2>
           <p className="text-lg text-[#A1A1AA] leading-relaxed">
              Two people can live through the same conversation and leave with completely different truths. The other side is not always the enemy. Sometimes it is another nervous system, another history, another map. When both sides matter, invite privately to understand the shared loop without keeping score.
           </p>
        </Container>
      </Section>

      {/* 9. Sovereign.os Library */}
      <Section className="w-full py-32 border-t border-border bg-[#0A0A0A]">
        <Container>
          <div className="mb-20 text-center flex flex-col items-center">
            <SectionLabel>06 // THE LIBRARY</SectionLabel>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] leading-tight text-white">The private record <br/>of what helped.</h2>
          </div>
          
          <div className="w-full max-w-4xl mx-auto flex flex-col border-t border-white/10">
            <div className="flex items-center justify-between py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors cursor-pointer px-6 -mx-6 rounded-xl">
              <div className="flex items-center gap-12">
                <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-mono w-32 hidden sm:block">Defrag</span>
                <span className="text-lg tracking-tight text-white/90">The boundary setting conversation</span>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white transition-colors">→</span>
            </div>
            <div className="flex items-center justify-between py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors cursor-pointer px-6 -mx-6 rounded-xl">
              <div className="flex items-center gap-12">
                <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-mono w-32 hidden sm:block">Alignment</span>
                <span className="text-lg tracking-tight text-white/90">What is mine vs what is theirs</span>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white transition-colors">→</span>
            </div>
            <div className="flex items-center justify-between py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors cursor-pointer px-6 -mx-6 rounded-xl">
              <div className="flex items-center gap-12">
                <span className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-mono w-32 hidden sm:block">Covenant</span>
                <span className="text-lg tracking-tight text-white/90">Responsibility in family conflict</span>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white transition-colors">→</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* 10. Free vs Pro */}
      <Section className="w-full py-32 border-t border-border bg-black">
        <Container>
          <div className="mb-20 text-center flex flex-col items-center">
            <SectionLabel>PRICING</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">Choose your progression.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             <div className="border border-white/10 bg-[#0A0A0A] p-10 flex flex-col">
                <h3 className="text-2xl font-medium text-white mb-2">Free</h3>
                <p className="text-[#A1A1AA] mb-8">Begin the work and understand a moment.</p>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Baseline Design setup
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Defrag space access
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Basic session history
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Limited daily sessions
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white/5 hover:bg-white/10 text-white rounded-full h-12">Start for Free</Button>
                </Link>
             </div>
             
             <div className="border border-white/20 bg-[#111] p-10 flex flex-col relative">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-black text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                  Recommended
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">Pro</h3>
                <p className="text-[#A1A1AA] mb-8">Stay with it. Deep continuity and all spaces.</p>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Everything in Free
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Covenant space
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Unlimited sessions
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Full Sovereign.os Library depth
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Invite Privately
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                    <span className="text-white">✓</span> Audio Overview
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full h-12">Upgrade to Pro</Button>
                </Link>
             </div>
          </div>
        </Container>
      </Section>

      {/* 11. Final CTA */}
      <Section className="w-full py-40 border-t border-border bg-[#0A0A0A] relative overflow-hidden flex justify-center items-center text-center">
        <div className="ambient-glow bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"></div>
        <Container className="z-10 flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-medium tracking-[-0.04em] mb-12 text-white">Return before the <br/>pattern takes over.</h2>
          <Link href="/login">
             <Button
                size="lg"
                className="rounded-full bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-14 px-12 font-sans font-medium text-[13px] tracking-wide transition-transform hover:scale-[1.02]"
              >
                Enter Sovereign.os
              </Button>
          </Link>
        </Container>
      </Section>
    </SiteShell>
  )
}
