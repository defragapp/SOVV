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

export default function PricingPage() {
  return (
    <SiteShell>
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-24 overflow-hidden bg-[#08070a] border-b border-white/5">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-[800px]">
          <SectionLabel>PRICING</SectionLabel>
          <h1 className="text-[clamp(3rem,6vw,5rem)] font-medium tracking-[-0.04em] text-[#f4efe9] leading-[0.95] text-balance mb-8">
            Simple, monetizable progression.
          </h1>
          <p className="text-[#a8a29a] text-lg font-normal tracking-[-0.01em] max-w-[600px] text-balance leading-[1.6]">
            We do not sell "AI features." We sell progression: the ability to return, remember, compare, and interrupt the pattern.
          </p>
        </Container>
      </Section>

      <Section className="w-full py-24 md:py-32 bg-[#0c0a0d]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
             
             {/* Free Tier */}
             <div className="border border-white/10 bg-[#08070a] p-10 md:p-14 flex flex-col">
                <h3 className="text-3xl font-medium text-white mb-2">Free</h3>
                <p className="text-[#a8a29a] text-lg mb-10">Helps you begin. Understand a moment before it takes over.</p>
                <div className="text-5xl font-medium text-white mb-10">$0 <span className="text-xl text-[#76716b] font-normal">/ forever</span></div>
                
                <ul className="space-y-5 mb-14 flex-1">
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Baseline Design:</strong> Setup your starting map.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Defrag space:</strong> Surface the active pattern.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Best Next Response:</strong> Get actionable steering.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Basic History:</strong> Limited continuity and saves.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Usage Limits:</strong> 5 sessions per day.</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white/5 hover:bg-white/10 text-white rounded-full h-14 text-[13px] tracking-wide">Start for Free</Button>
                </Link>
             </div>
             
             {/* Pro Tier */}
             <div className="border border-white/20 bg-[#131015] p-10 md:p-14 flex flex-col relative shadow-2xl">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-black text-[10px] uppercase tracking-widest px-4 py-1.5 font-medium">
                  Recommended
                </div>
                <h3 className="text-3xl font-medium text-white mb-2">Pro</h3>
                <p className="text-[#a8a29a] text-lg mb-10">Helps you stay with it. Deeper continuity, all spaces, no limits.</p>
                <div className="text-5xl font-medium text-white mb-10">$20 <span className="text-xl text-[#76716b] font-normal">/ month</span></div>
                
                <ul className="space-y-5 mb-14 flex-1">
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Everything in Free</strong></span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Unlimited Sessions:</strong> No daily caps.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Covenant Space:</strong> Faith-context reflection.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Sovereign.os Library:</strong> Full depth of your saved results.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Invite Privately:</strong> Secure overlays when both sides matter.</span>
                  </li>
                  <li className="flex items-start gap-4 text-[#a8a29a]">
                    <span className="text-white mt-1">✓</span> <span><strong>Audio Overview:</strong> Generated context summaries.</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full h-14 text-[13px] tracking-wide transition-transform hover:scale-[1.02]">Upgrade to Pro</Button>
                </Link>
             </div>

          </div>
        </Container>
      </Section>

      <Section className="w-full py-24 bg-[#08070a] border-t border-white/5 text-center">
        <Container className="max-w-2xl">
          <h2 className="text-2xl font-medium text-white mb-6">A note on monetization</h2>
          <p className="text-[#a8a29a] leading-relaxed">
            We preserve all Stripe checkout and webhook entitlement logic. Upgrades happen through secure payment gateways, not frontend query parameters. Your Pro status unlocks backend continuity and priority access.
          </p>
        </Container>
      </Section>
    </SiteShell>
  )
}
