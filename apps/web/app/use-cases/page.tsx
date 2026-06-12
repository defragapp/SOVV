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

export default function UseCasesPage() {
  return (
    <SiteShell>
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[60svh] pt-32 pb-24 overflow-hidden bg-black border-b border-white/5">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <SectionLabel>USE CASES</SectionLabel>
          <h1 className="text-[clamp(3rem,6vw,5rem)] font-medium tracking-[-0.04em] text-[#FAFAFA] leading-[0.95] text-balance mb-8">
            When to use Sovereign.os
          </h1>
          <p className="text-[#A1A1AA] text-lg font-normal tracking-[-0.01em] max-w-[600px] text-balance leading-[1.6]">
            This is a broad relational intelligence space. Use it when the moment requires a grounded response instead of a reactive loop.
          </p>
        </Container>
      </Section>

      <Section className="w-full py-24 md:py-32 bg-[#0A0A0A]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            
            <div className="border border-white/10 bg-black p-10 flex flex-col items-start gap-4 hover:border-white/20 transition-colors">
               <h3 className="text-2xl font-medium text-white">Relational Dynamics</h3>
               <p className="text-[#A1A1AA] leading-relaxed">
                 When a conversation keeps looping into the same argument. Use the Defrag space to see the active pattern, identify your old role, and find the conversational steering needed to respond differently.
               </p>
            </div>

            <div className="border border-white/10 bg-black p-10 flex flex-col items-start gap-4 hover:border-white/20 transition-colors">
               <h3 className="text-2xl font-medium text-white">Family Dynamics</h3>
               <p className="text-[#A1A1AA] leading-relaxed">
                 When you are drawn back into a role you learned to carry under pressure. Understand the strain pattern and the gift underneath it, so you can engage without losing yourself.
               </p>
            </div>

            <div className="border border-white/10 bg-black p-10 flex flex-col items-start gap-4 hover:border-white/20 transition-colors">
               <h3 className="text-2xl font-medium text-white">Boundaries</h3>
               <p className="text-[#A1A1AA] leading-relaxed">
                 When you need to know what is yours to carry and what belongs to the other side. The Alignment space helps turn this insight into an actionable, concrete boundary.
               </p>
            </div>

            <div className="border border-white/10 bg-black p-10 flex flex-col items-start gap-4 hover:border-white/20 transition-colors">
               <h3 className="text-2xl font-medium text-white">High-Stakes Messages</h3>
               <p className="text-[#A1A1AA] leading-relaxed">
                 When a message lights up your nervous system. Don't reply immediately. Run it through Defrag to separate the moment from the pattern, then find your best next response.
               </p>
            </div>

            <div className="border border-white/10 bg-black p-10 flex flex-col items-start gap-4 hover:border-white/20 transition-colors">
               <h3 className="text-2xl font-medium text-white">Grief</h3>
               <p className="text-[#A1A1AA] leading-relaxed">
                 Grief has its own loops. Use Sovereign.os to map what is active, find grounded reflection (often through the Covenant space), and return to center without trying to just "fix" it.
               </p>
            </div>

            <div className="border border-white/10 bg-black p-10 flex flex-col items-start gap-4 hover:border-white/20 transition-colors">
               <h3 className="text-2xl font-medium text-white">Team Dynamics</h3>
               <p className="text-[#A1A1AA] leading-relaxed">
                 Professional spaces are filled with unstated active patterns. When both sides matter, you can even use Invite Privately to understand the shared loop without keeping score.
               </p>
            </div>

          </div>
        </Container>
      </Section>

      <Section className="w-full py-32 bg-black border-t border-white/5 text-center">
        <Container>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-10">Start with your Baseline Design</h2>
          <Link href="/login">
            <Button
              size="lg"
              className="rounded-full bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] h-14 px-10 font-sans font-medium text-[13px] tracking-wide"
            >
              Enter Sovereign.os
            </Button>
          </Link>
        </Container>
      </Section>
    </SiteShell>
  )
}
