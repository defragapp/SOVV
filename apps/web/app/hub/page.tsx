import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sovereign.os — Pattern-aware AI for the moments that matter",
  description: "Pattern-aware AI for the moments that are hard to read while you're inside them.",
}

export default function HubLanding() {
  return (
    <main className="relative min-h-screen bg-[#08070a] text-[#f4efe9] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">

      {/* Ambient light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(224,116,58,0.07) 0%, transparent 65%)" }}
        aria-hidden
      />
      <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.06]" />
      <div className="alignment-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-14">

        {/* Wordmark */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f4efe9]/40">Sovereign.os</span>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] text-[#f4efe9] leading-[1.06] tracking-[-0.02em] text-balance">
            Pattern-aware AI for the moments that matter.
          </h1>
          <p className="text-[15px] text-[#76716b] leading-relaxed max-w-sm">
            Understand what&rsquo;s active, what may be repeating, and what next move gives the situation a better chance.
          </p>
        </div>

        {/* Entry */}
        <div className="flex flex-col gap-3">
          <a
            href="/app/login"
            className="btn-primary w-full text-center"
          >
            Enter Sovereign.os
          </a>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/about"
              className="btn-secondary text-center text-[12px]"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="btn-secondary text-center text-[12px]"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Spaces */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1">Spaces</p>
          {[
            { href: "https://app.defrag.app/apps/defrag", name: "Defrag", desc: "Separate the moment from the pattern.", tier: "Free" },
            { href: "https://app.defrag.app/apps/covenant", name: "Covenant", desc: "Reflect through faith without performance.", tier: "Pro" },
            { href: "https://app.defrag.app/apps/alignment", name: "Alignment", desc: "Turn recognition into practice.", tier: "Pro" },
          ].map((space) => (
            <a
              key={space.name}
              href={space.href}
              className="flex items-center justify-between px-5 py-4 border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all group"
              style={{ borderRadius: "var(--radius-container)" }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-[#f4efe9] group-hover:text-white transition-colors">{space.name}</span>
                <span className="text-[12px] text-[#4f4b47]">{space.desc}</span>
              </div>
              <span
                className="font-mono text-[8px] uppercase tracking-[0.14em] border px-2 py-0.5 shrink-0"
                style={{
                  borderRadius: "var(--radius-minimal)",
                  color: space.tier === "Free" ? "rgba(168,162,154,0.55)" : "rgba(224,116,58,0.65)",
                  borderColor: space.tier === "Free" ? "rgba(255,255,255,0.08)" : "rgba(224,116,58,0.22)",
                }}
              >
                {space.tier}
              </span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Sovereign.os</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">Privacy</Link>
            <Link href="/terms" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">Terms</Link>
          </div>
        </div>

      </div>
    </main>
  )
}
