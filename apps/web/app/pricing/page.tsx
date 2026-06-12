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
