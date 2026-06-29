import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

const APP_URL = "/app/login"

export default function Home() {
  return (
    <SiteShell>
      <section className="relative min-h-screen w-full overflow-hidden bg-[#08070a] border-b border-white/[0.06]">
        <div className="light-beam opacity-70" aria-hidden />
        <Container className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center py-24">
          <p className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/30 mb-6 text-[0.65rem]">
            Sovereign.os
          </p>
          <h1 className="font-serif text-[#f4efe9] text-balance leading-[1.02] tracking-[-0.035em] text-[clamp(3rem,8vw,7.5rem)] max-w-5xl">
            You are not broken. You are patterned.
          </h1>
          <p className="mt-7 max-w-xl text-[#a8a29a] leading-relaxed text-base md:text-lg">
            Sovereign.os helps you see the loop, separate the pattern from the pressure, and choose the next move with more clarity and less harm.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center">
            <Link href={APP_URL} className="btn-primary">
              Start with your baseline
            </Link>
            <Link href="/campaign/sovereign-os" className="btn-secondary">
              Explore the campaign
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
