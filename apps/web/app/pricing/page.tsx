import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Badge } from "@/components/ui/badge"
import { PRICING_CONFIG } from "@/data/marketing"
import { CheckoutButton } from "@/components/marketing/checkout-button"
import Link from "next/link"

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center selection:bg-white/10 selection:text-white bg-[#050505]">
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[50svh] pt-32 pb-24 overflow-hidden border-b border-white/[0.06]">
        <Container className="relative z-10 flex flex-col items-center text-center max-w-4xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-px w-8 bg-white/20" />
            <Badge variant="outline" className="rounded-none border-white/[0.12] bg-transparent text-[#71717A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">
              PRICING
            </Badge>
            <div className="h-px w-8 bg-white/20" />
          </div>

          <div className="space-y-5 mb-10">
            <h1 className="text-4xl md:text-[56px] font-semibold tracking-[-0.03em] text-[#FAFAFA] leading-[1.05] text-balance">
              Clear pricing.<br className="hidden md:block" />
              <span className="text-[#3F3F46]">No surprises.</span>
            </h1>
          </div>

          <p className="text-base md:text-lg text-[#71717A] max-w-xl leading-relaxed text-pretty">
            Choose the plan that fits how you want to work through the patterns.
          </p>
        </Container>
      </Section>

      <Section className="w-full border-b border-white/[0.06]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05]">
            {/* Free Plan */}
            <div className="bg-[#050505] p-10 lg:p-14 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">{PRICING_CONFIG.free.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#FAFAFA]">{PRICING_CONFIG.free.price}</span>
                  <span className="text-[#71717A] font-mono text-[10px] tracking-wide uppercase">/{PRICING_CONFIG.free.interval}</span>
                </div>
                <p className="text-sm text-[#71717A] mt-2 leading-relaxed">{PRICING_CONFIG.free.description}</p>
              </div>

              <div className="flex-1">
                <ul className="space-y-0 border border-white/[0.06] divide-y divide-white/[0.04]">
                  {PRICING_CONFIG.free.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 px-4 py-3 font-mono text-xs text-[#71717A]">
                      <svg className="w-4 h-4 text-[#52525B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link href={PRICING_CONFIG.free.href} className="w-full block">
                  <Button variant="secondary" className="w-full rounded-none border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 font-mono text-xs tracking-[0.15em] uppercase h-12 px-8 transition-colors">
                    {PRICING_CONFIG.free.cta}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#080808] p-10 lg:p-14 flex flex-col gap-8 border-l border-white/[0.05] relative">
              <div className="absolute top-0 right-10 -translate-y-1/2">
                 <Badge className="rounded-none border border-white/[0.12] bg-white text-black font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1">Recommended</Badge>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">{PRICING_CONFIG.pro.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#FAFAFA]">{PRICING_CONFIG.pro.price}</span>
                  <span className="text-[#71717A] font-mono text-[10px] tracking-wide uppercase">/{PRICING_CONFIG.pro.interval}</span>
                </div>
                <p className="text-sm text-[#FAFAFA] mt-2 leading-relaxed">{PRICING_CONFIG.pro.description}</p>
              </div>

              <div className="flex-1">
                <ul className="space-y-0 border border-white/[0.06] divide-y divide-white/[0.04]">
                  {PRICING_CONFIG.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 px-4 py-3 font-mono text-xs text-[#FAFAFA]">
                      <svg className="w-4 h-4 text-[#FAFAFA] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <CheckoutButton priceId={PRICING_CONFIG.pro.priceId} cta={PRICING_CONFIG.pro.cta} />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
