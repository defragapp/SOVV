import { SiteShell } from "@/components/marketing/site-shell"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-none border-border bg-transparent text-[#76716b] font-sans font-medium text-[10px] tracking-[0.2em] uppercase px-3 py-1 w-fit mb-6"
    >
      {children}
    </Badge>
  )
}

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[60svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <SectionLabel>THE PROCESS</SectionLabel>
          <h1 className="text-[clamp(3rem,6vw,5rem)] font-medium tracking-[-0.04em] text-[#f4efe9] leading-[0.95] text-balance mb-8">
            How Sovereign.os works.
          </h1>
          <p className="text-[#a8a29a] text-lg font-normal tracking-[-0.01em] max-w-[600px] text-balance leading-[1.6]">
            The system must feel like it understands your pattern context before you even type. Here is the product loop.
          </p>
        </Container>
      </Section>

      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container>
          <div className="max-w-4xl mx-auto space-y-24">
            
            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono shrink-0 w-24 pt-2">Step 01</div>
               <div>
                  <h3 className="text-3xl font-medium text-white mb-4">Baseline Design</h3>
                  <p className="text-lg text-[#a8a29a] leading-relaxed mb-6">
                    Before you input any active situation, you define your Baseline Design. This is the starting map: how you tend to process, respond, connect, protect, communicate, and return to center.
                  </p>
                  <p className="text-sm text-[#76716b] leading-relaxed">
                    This context is always active. It means you don't have to explain who you are every time a moment happens.
                  </p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono shrink-0 w-24 pt-2">Step 02</div>
               <div>
                  <h3 className="text-3xl font-medium text-white mb-4">Current Situation</h3>
                  <p className="text-lg text-[#a8a29a] leading-relaxed mb-6">
                    You bring what feels active, unresolved, or repeating into the Defrag space (or Covenant/Alignment spaces). You describe the pressure, the message, or the dynamic.
                  </p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono shrink-0 w-24 pt-2">Step 03</div>
               <div>
                  <h3 className="text-3xl font-medium text-white mb-4">Structured Result</h3>
                  <p className="text-lg text-[#a8a29a] leading-relaxed mb-6">
                    The platform does not output a paragraph blob. You receive a structured Result surfacing the active pattern, the old role, the strain, and a clear Best Next Response.
                  </p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono shrink-0 w-24 pt-2">Step 04</div>
               <div>
                  <h3 className="text-3xl font-medium text-white mb-4">Save to Sovereign</h3>
                  <p className="text-lg text-[#a8a29a] leading-relaxed mb-6">
                    The platform succeeds when you can use the output in a real moment. Save the structured Result to your Sovereign.os Library so it is preserved.
                  </p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono shrink-0 w-24 pt-2">Step 05</div>
               <div>
                  <h3 className="text-3xl font-medium text-white mb-4">Library Return</h3>
                  <p className="text-lg text-[#a8a29a] leading-relaxed mb-6">
                    The next time the loop tries to form, you don't start from zero. You return to your Library, interrupt the old pattern, and respond differently.
                  </p>
               </div>
            </div>

          </div>
        </Container>
      </Section>

      <Section className="w-full py-32 bg-[#08070a] border-t border-white/5 text-center">
        <Container>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-10">Ready to break the loop?</h2>
          <Link href="/login">
            <Button
              size="lg"
              className="rounded-full bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] h-14 px-10 font-sans font-medium text-[13px] tracking-wide"
            >
              Start your Baseline Design
            </Button>
          </Link>
        </Container>
      </Section>
    </SiteShell>
  )
}
