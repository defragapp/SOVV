import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"

const APP_URL = "/app/login"

const videos = [
  { title: "You Are Not Broken", purpose: "Emotional category hook", line: "See the loop. Name the pattern. Choose the repair." },
  { title: "Everyone Has an Operating System", purpose: "Category definition", line: "How you protect, love, avoid, and return." },
  { title: "Defrag the Loop", purpose: "Defrag product-space intro", line: "The loop becomes visible here." },
  { title: "Understand What Got Touched", purpose: "Core use case and emotional hook", line: "Understand what got touched before the reaction takes over." },
  { title: "Return to Alignment", purpose: "Alignment product-space intro", line: "Notice when you leave yourself and return before the pattern speaks." },
  { title: "Covenant", purpose: "Shared-pattern product-space intro", line: "Reveal what the relationship keeps repeating and where repair can begin." },
  { title: "Baseline", purpose: "Foundation explainer", line: "A starting point for pressure, choice, conflict, care, and repair." },
]

export const metadata: Metadata = {
  title: "Sovereign.os — Relational Intelligence for Real Life",
  description: "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
  alternates: { canonical: "https://defrag.app/campaign/sovereign-os" },
  openGraph: {
    title: "Sovereign.os — Relational Intelligence for Real Life",
    description: "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
    url: "/campaign/sovereign-os",
    images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "Sovereign.os — Relational Intelligence for Real Life" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sovereign.os — Relational Intelligence for Real Life",
    description: "Sovereign.os helps you see the loop, separate the pattern from the pressure, and start from your baseline.",
    images: ["/social-card.png"],
  },
}

export default function SovereignOsCampaignPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#08070a] py-24 md:py-32">
        <div className="light-beam opacity-70" aria-hidden />
        <Container className="relative z-10 text-center">
          <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#f4efe9]/30">Sovereign.os campaign</p>
          <h1 className="mx-auto max-w-5xl text-balance font-serif text-[clamp(3rem,8vw,7rem)] leading-[1.02] tracking-[-0.035em] text-[#f4efe9]">You are not broken. You are patterned.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[#a8a29a] md:text-lg">Sovereign.os is the personal operating system for relational intelligence: a grounded way to see the loop, separate the pattern from the pressure, and start from your baseline.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={APP_URL} className="btn-primary">Start with your baseline</Link>
            <Link href="/product/defrag" className="btn-secondary">Open Defrag</Link>
          </div>
        </Container>
      </section>
      <section className="bg-[#08070a] py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl tracking-tight text-[#f4efe9] md:text-5xl">Seven launch concepts, one clear path.</h2>
            <p className="mt-5 text-base leading-relaxed text-[#a8a29a]">Each short video points back to the same safe invitation: notice the pattern, name the pressure, and begin with your baseline.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <article key={video.title} className="border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/20" style={{ borderRadius: "var(--radius-container)" }}>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#e0743a]/60">Video {index + 1}</p>
                <h3 className="mt-4 font-serif text-2xl text-[#f4efe9]">{video.title}</h3>
                <p className="mt-3 text-sm font-medium text-[#f4efe9]/70">{video.purpose}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#a8a29a]">{video.line}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
