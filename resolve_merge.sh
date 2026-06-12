#!/bin/bash

# We are resolving the merge conflicts by favoring our stashed changes (the new Vercel-style UI).
# Because the stash applying generated merge markers (<<<<<<<, =======, >>>>>>>), we will simply overwrite the files with our clean versions.

# Restore the clean page.tsx
cat << 'PAGE_EOF' > apps/web/app/page.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Background Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[800px] opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)"
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-6 mix-blend-difference">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-sm font-medium tracking-tight text-white hover:opacity-80 transition-opacity">
            Sovereign.os
          </Link>
          <div className="hidden md:flex gap-8 text-[13px] text-white/50">
            <Link href="/apps/defrag" className="hover:text-white transition-colors">Defrag</Link>
            <Link href="/apps/covenant" className="hover:text-white transition-colors">Covenant</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
        <div>
          <Link href="/login" className="text-[13px] px-5 py-2.5 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 z-10 px-6">
        <div className="text-center max-w-5xl flex flex-col items-center">
          <div className="animate-fade-up px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-10">
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/60">Platform 2.0 Live</span>
          </div>

          <h1 className="animate-fade-up delay-100 text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.04em] font-medium gradient-text mb-8 text-balance">
            Healing isn&apos;t optional.<br/>
            Holding the pain is.
          </h1>

          <p className="animate-fade-up delay-200 text-lg md:text-xl text-white/40 max-w-2xl leading-relaxed tracking-tight text-balance mb-12">
            Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/login" className="px-8 py-4 rounded-full bg-white text-black text-sm font-medium hover:scale-[1.02] transition-transform text-center">
              Enter Sovereign.os
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-full bg-transparent border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors text-center">
              Start Baseline Design
            </Link>
          </div>
        </div>
      </section>

      {/* Abstract Wireframe Divider */}
      <div className="w-full flex justify-center pb-32">
        <div className="w-px h-32 bg-gradient-to-b from-white/20 to-transparent"></div>
      </div>

      {/* Cinematic Row 1: Defrag */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="ui-fragment">
              <div className="ui-line top-1/4"></div>
              <div className="ui-line top-2/4"></div>
              <div className="ui-line top-3/4"></div>
              <div className="absolute inset-x-12 inset-y-12 border border-white/5 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[10px] text-white/20 tracking-widest uppercase font-mono">Active Pattern Detected</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex flex-col items-start">
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-6 font-mono">01 // The Defrag Space</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] mb-8 leading-tight text-white">Separate the moment <br/>from the pattern.</h2>
            <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-md">
              The conversation ended. Your body did not. Defrag slows the moment down, surfacing exactly what was activated so you can choose a response that doesn&apos;t feed the loop.
            </p>
            <Link href="/login" className="text-sm font-medium tracking-tight text-white/80 hover:text-white transition-colors flex items-center gap-2">
              Explore Defrag Space <span className="text-white/40">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cinematic Row 2: Covenant */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-6 font-mono">02 // The Covenant Space</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] mb-8 leading-tight text-white">Reflection anchored <br/>in responsibility.</h2>
            <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-md">
              For the user who wants faith to stay connected to the work. Covenant brings plain-language reflection, repair, and grounded discernment into what you are walking through.
            </p>
            <Link href="/login" className="text-sm font-medium tracking-tight text-white/80 hover:text-white transition-colors flex items-center gap-2">
              Explore Covenant Space <span className="text-white/40">→</span>
            </Link>
          </div>
          <div>
            <div className="ui-fragment flex justify-center items-center">
              <div className="w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typographic List: The Library */}
      <section className="relative py-40 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-8">
          <div className="mb-24 text-center flex flex-col items-center">
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/40 mb-6 block font-mono">03 // The Library</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] leading-tight text-white">The private record <br/>of what helped.</h2>
          </div>

          <div className="w-full flex flex-col border-t border-white/10">
            <div className="flex items-center justify-between py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors cursor-pointer px-4 -mx-4 rounded-lg">
              <div className="flex items-center gap-12">
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-mono w-24">Defrag</span>
                <span className="text-lg tracking-tight text-white/90">The boundary setting conversation</span>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white transition-colors">→</span>
            </div>
            <div className="flex items-center justify-between py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors cursor-pointer px-4 -mx-4 rounded-lg">
              <div className="flex items-center gap-12">
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-mono w-24">Alignment</span>
                <span className="text-lg tracking-tight text-white/90">What is mine vs what is theirs</span>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white transition-colors">→</span>
            </div>
            <div className="flex items-center justify-between py-8 border-b border-white/10 group hover:bg-white/[0.02] transition-colors cursor-pointer px-4 -mx-4 rounded-lg">
              <div className="flex items-center gap-12">
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-mono w-24">Covenant</span>
                <span className="text-lg tracking-tight text-white/90">Responsibility in family conflict</span>
              </div>
              <span className="text-sm text-white/40 group-hover:text-white transition-colors">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-40 border-t border-white/5 overflow-hidden flex justify-center items-center text-center">
        <div className="ambient-glow bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"></div>
        <div className="z-10 px-8 flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-medium tracking-[-0.04em] mb-12 text-white">Return before the <br/>pattern takes over.</h2>
          <Link href="/login" className="px-10 py-5 rounded-full bg-white text-black text-base font-medium hover:scale-[1.02] transition-transform">
            Start Baseline Design
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-medium tracking-tight text-white/80">Sovereign.os</span>
          <div className="flex gap-6 text-[13px] text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
PAGE_EOF

# Restore the clean pricing/page.tsx
cat << 'PRICING_EOF' > apps/web/app/pricing/page.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Background Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[800px] opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 70%)"
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-6 mix-blend-difference">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-sm font-medium tracking-tight text-white hover:opacity-80 transition-opacity">
            Sovereign.os
          </Link>
          <div className="hidden md:flex gap-8 text-[13px] text-white/50">
            <Link href="/apps/defrag" className="hover:text-white transition-colors">Defrag</Link>
            <Link href="/apps/covenant" className="hover:text-white transition-colors">Covenant</Link>
            <Link href="/pricing" className="text-white transition-colors">Pricing</Link>
          </div>
        </div>
        <div>
          <Link href="/login" className="text-[13px] px-5 py-2.5 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-48 pb-32 z-10 px-6 border-b border-white/5">
        <div className="text-center max-w-3xl flex flex-col items-center">
          <h1 className="animate-fade-up text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.04em] font-medium gradient-text mb-6 text-balance">
            Clear pricing.<br/>
            No surprises.
          </h1>
          <p className="animate-fade-up delay-100 text-lg md:text-xl text-white/40 max-w-xl leading-relaxed tracking-tight text-balance">
            Choose the plan that fits how you want to work through the patterns.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="relative py-32 z-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">

          {/* Free Tier */}
          <div className="bg-black p-12 lg:p-16 flex flex-col">
            <div className="mb-10">
              <h2 className="text-2xl font-medium tracking-[-0.02em] text-white mb-2">Free</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-medium tracking-[-0.04em] text-white">$0</span>
                <span className="text-white/40 font-mono text-[11px] tracking-widest uppercase">/ forever</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
                Understand a moment. The essentials to begin mapping your patterns.
              </p>
            </div>

            <div className="flex-1 mb-12">
              <ul className="space-y-6">
                {["Baseline Design setup", "Active pattern surface", "Best Next Response", "Basic session history"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-white/70 tracking-tight">
                    <span className="text-white/20 mt-0.5">✦</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/login" className="w-full">
              <Button variant="secondary" className="w-full rounded-full border border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white font-medium tracking-tight h-14">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-[#050505] p-12 lg:p-16 flex flex-col relative">
            <div className="absolute top-12 right-12">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80">Pro</span>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-medium tracking-[-0.02em] text-white mb-2">Sovereign Pro</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-medium tracking-[-0.04em] text-white">$20</span>
                <span className="text-white/40 font-mono text-[11px] tracking-widest uppercase">/ mo</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
                Return, remember, compare, and interrupt the pattern.
              </p>
            </div>

            <div className="flex-1 mb-12">
              <ul className="space-y-6">
                {["Unlimited sessions", "Your Story (full history)", "Compare With Someone", "Try It Out (Audio summaries)", "Covenant space access"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-white/90 tracking-tight font-medium">
                    <span className="text-white mt-0.5">✦</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/login" className="w-full">
              <Button className="w-full rounded-full bg-white text-black hover:bg-white/90 font-medium tracking-tight h-14">
                Start Sovereign Pro
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-medium tracking-tight text-white/80">Sovereign.os</span>
          <div className="flex gap-6 text-[13px] text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
PRICING_EOF

git add apps/web/app/page.tsx apps/web/app/pricing/page.tsx
git commit -m "feat(ui): resolve merge conflict and apply Vercel-style cinematic aesthetic"
