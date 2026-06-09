import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PRICING_CONFIG } from "@/data/marketing"
import Link from "next/link"

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center selection:bg-white/20 selection:text-white pt-32 pb-20">
      <Section className="w-full">
        <Container className="max-w-4xl text-center space-y-8">
          <Badge>Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Clear pricing.<br />
            <span className="text-[#A1A1AA]">No surprises.</span>
          </h1>
          <p className="text-lg text-[#A1A1AA] leading-relaxed mx-auto max-w-2xl">
            Choose the plan that fits how you want to work through the patterns.
          </p>
        </Container>
      </Section>

      <Section className="w-full pt-8">
        <Container className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card variant="elevated" className="flex flex-col">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{PRICING_CONFIG.free.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{PRICING_CONFIG.free.price}</span>
                  <span className="text-[#A1A1AA]">/{PRICING_CONFIG.free.interval}</span>
                </div>
                <CardDescription className="text-base">{PRICING_CONFIG.free.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <ul className="space-y-4">
                  {PRICING_CONFIG.free.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#A1A1AA]">
                      <svg className="w-5 h-5 text-[#FDFDFD] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Link href={PRICING_CONFIG.free.href} className="w-full block">
                  <Button variant="secondary" className="w-full">{PRICING_CONFIG.free.cta}</Button>
                </Link>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card variant="premium" className="flex flex-col relative border-white/20">
              <div className="absolute top-0 right-6 -translate-y-1/2">
                 <Badge variant="pro">Recommended</Badge>
              </div>
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">{PRICING_CONFIG.pro.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{PRICING_CONFIG.pro.price}</span>
                  <span className="text-[#A1A1AA]">/{PRICING_CONFIG.pro.interval}</span>
                </div>
                <CardDescription className="text-base text-[#FDFDFD]">{PRICING_CONFIG.pro.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <ul className="space-y-4">
                  {PRICING_CONFIG.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#FDFDFD]">
                      <svg className="w-5 h-5 text-[#FDFDFD] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <form action="/api/checkout" method="POST">
                   <input type="hidden" name="priceId" value={PRICING_CONFIG.pro.priceId} />
                   <Button variant="primary" className="w-full" type="submit">{PRICING_CONFIG.pro.cta}</Button>
                </form>
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  )
}
