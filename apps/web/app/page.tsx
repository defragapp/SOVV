"use client";

import Link from "next/link";
import { lenses, pricingTiers } from "../data/marketing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-border px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-xl font-medium tracking-tighter">Sovereign.os</div>
        <div className="space-x-6 flex items-center">
          <Link href="https://app.defrag.app/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="https://app.defrag.app/login" className="btn-premium">Enter your space</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {/* Hero Section */}
        <section className="space-y-8 text-center max-w-4xl mx-auto">
          <span className="meta-label mx-auto">The Platform</span>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-tight">
            Your sovereign space for <br className="hidden md:block" /> relational intelligence.
          </h1>
          <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
            Before you repeat this again, understand why it keeps happening. Bring the moment here. Work through what is happening now.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="https://app.defrag.app/login" className="btn-premium py-3 px-8 text-lg bg-white text-black hover:bg-zinc-200">
              Start Free
            </Link>
            <Link href="/covenant" className="btn-premium py-3 px-8 text-lg">
              Explore Covenant
            </Link>
          </div>
        </section>

        {/* Spaces */}
        <section className="space-y-8">
          <div className="text-center space-y-2 mb-12">
            <span className="meta-label mx-auto">The Spaces</span>
            <h2 className="text-3xl font-light tracking-tight">Two guided spaces. One platform.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="premium-card space-y-4 hover:border-zinc-700 transition-colors">
              <h3 className="text-xl font-medium tracking-tight">Defrag</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The relational intelligence space. Defrag shows what got lit up, where the loop is forming, and what response gives the moment a better chance.
              </p>
              <Link href="https://app.defrag.app/apps/defrag" className="inline-block text-xs text-zinc-500 hover:text-white transition-colors">
                Enter Defrag space →
              </Link>
            </div>
            <div className="premium-card space-y-4 hover:border-zinc-700 transition-colors">
              <h3 className="text-xl font-medium tracking-tight">Covenant</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                An optional faith-context reflection space. User-initiated, plain-language, and private by design. Uses the same Baseline Design and Library as Defrag.
              </p>
              <Link href="/covenant" className="inline-block text-xs text-zinc-500 hover:text-white transition-colors">
                Learn about Covenant →
              </Link>
            </div>
          </div>
        </section>

        {/* Architecture / Lenses */}
        <section className="space-y-8">
          <div className="text-center space-y-2 mb-12">
            <span className="meta-label mx-auto">The Architecture</span>
            <h2 className="text-3xl font-light tracking-tight">How it interprets the moment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lenses.map((lens) => (
              <div key={lens.title} className="premium-card space-y-4 hover:border-zinc-700 transition-colors">
                <h3 className="text-xl font-medium tracking-tight">{lens.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{lens.summary}</p>
                <div className="pt-4 mt-auto">
                  <span className="text-xs text-zinc-500 italic block">{lens.useCase}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscriptions */}
        <section className="space-y-8 border-t border-border pt-24">
          <div className="text-center space-y-2 mb-12">
            <span className="meta-label mx-auto">Access</span>
            <h2 className="text-3xl font-light tracking-tight">Select your access tier</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className={`premium-card flex flex-col space-y-6 ${tier.highlight ? 'border-zinc-400' : ''}`}>
                <div>
                  <h3 className="text-2xl font-light">{tier.name}</h3>
                  <div className="mt-2 text-4xl font-light">{tier.price} <span className="text-sm text-zinc-500 font-normal">{tier.period}</span></div>
                </div>
                <p className="text-zinc-400">{tier.description}</p>
                <ul className="space-y-3 text-sm text-zinc-300 flex-grow">
                  {tier.features.map(f => (
                    <li key={f} className="flex gap-3 items-start">
                      <span className="text-zinc-600 mt-0.5">―</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Link href={tier.href} className={`block text-center w-full ${tier.highlight ? 'bg-white text-black py-3 font-medium hover:bg-zinc-200 transition-colors' : 'btn-premium'}`}>
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}