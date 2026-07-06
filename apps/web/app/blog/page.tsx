import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Writing — Sovereign.os",
  description: "Perspectives on pattern awareness, relational dynamics, and the moments that shape us.",
}

const POSTS = [
  {
    slug: "what-is-pattern-awareness",
    title: "What is pattern awareness — and why does it matter?",
    date: "July 2026",
    readTime: "4 min",
    excerpt: "Most of us can describe what happened. Fewer of us can see what keeps happening. Pattern awareness is the difference between reacting to a moment and understanding what's driving it.",
    tag: "Foundation",
  },
  {
    slug: "baseline-design-explained",
    title: "Baseline Design: the map beneath every conversation",
    date: "July 2026",
    readTime: "5 min",
    excerpt: "Your Baseline Design isn't a personality test. It's a starting map — how you tend to process, respond, connect, protect, and return to center. Here's what it is and why it matters.",
    tag: "Platform",
  },
  {
    slug: "defrag-vs-journaling",
    title: "Defrag vs journaling: what's the difference?",
    date: "July 2026",
    readTime: "3 min",
    excerpt: "Journaling captures what happened. Defrag shows you what's active beneath it — the pattern, the pressure, the best next move. They're not the same thing.",
    tag: "Clarity",
  },
]

export default function BlogPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-16 md:pt-48 md:pb-20 bg-[#08070a] overflow-hidden border-b border-white/[0.04]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(224,116,58,0.05) 0%, transparent 60%)" }}
          aria-hidden
        />
        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">Writing</span>
          </div>
          <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-5">
            Perspectives.
          </h1>
          <p className="text-[#76716b] text-base leading-relaxed max-w-md">
            On pattern awareness, relational dynamics, and the moments that are hard to read while you're inside them.
          </p>
        </Container>
      </section>

      {/* ── POSTS ── */}
      <section className="w-full py-8 bg-[#08070a]">
        <Container className="max-w-3xl">
          {POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group flex flex-col gap-4 py-10 ${i < POSTS.length - 1 ? "border-b border-white/[0.05]" : ""} transition-opacity hover:opacity-80`}
            >
              {/* Meta row */}
              <div className="flex items-center gap-4">
                <span
                  className="font-mono text-[8px] uppercase tracking-[0.2em] px-2 py-1 border border-white/[0.06] text-[#4f4b47]"
                  style={{ borderRadius: "var(--radius-minimal)" }}
                >
                  {post.tag}
                </span>
                <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em]">{post.date}</span>
                <span className="text-[#4f4b47]">·</span>
                <span className="font-mono text-[9px] text-[#4f4b47] tracking-[0.1em]">{post.readTime} read</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-[1.4rem] md:text-[1.6rem] text-[#f4efe9] leading-snug tracking-[-0.01em] group-hover:text-white transition-colors text-balance">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-sm text-[#76716b] leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>

              {/* Read indicator */}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 group-hover:text-[#e0743a]/80 transition-colors">
                  Read
                </span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-[#e0743a]/40 group-hover:text-[#e0743a]/60 transition-colors translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                  <path d="M1 4h10M7 1l4 3-4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="w-full py-20 bg-[#0c0a0d] border-t border-white/[0.04] text-center">
        <Container className="max-w-md">
          <p className="text-[#76716b] text-sm leading-relaxed mb-6">
            Pattern awareness starts with a single session.
          </p>
          <Link href="/app/login" className="btn-primary">
            Try Sovereign.os free
          </Link>
        </Container>
      </section>

    </SiteShell>
  )
}
