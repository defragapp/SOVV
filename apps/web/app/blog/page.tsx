import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog — Sovereign.os",
  description: "Perspectives on pattern awareness, relational dynamics, and the moments that shape us.",
}

const POSTS = [
  {
    slug: "what-is-pattern-awareness",
    title: "What is pattern awareness — and why does it matter?",
    date: "July 2026",
    readTime: "4 min",
    excerpt: "Most of us can describe what happened. Fewer of us can see what keeps happening. Pattern awareness is the difference between reacting to a moment and understanding what's driving it.",
  },
  {
    slug: "baseline-design-explained",
    title: "Baseline Design: the map beneath every conversation",
    date: "July 2026",
    readTime: "5 min",
    excerpt: "Your Baseline Design isn't a personality test. It's a starting map — how you tend to process, respond, connect, protect, and return to center. Here's what it is and why it matters.",
  },
  {
    slug: "defrag-vs-journaling",
    title: "Defrag vs journaling: what's the difference?",
    date: "July 2026",
    readTime: "3 min",
    excerpt: "Journaling captures what happened. Defrag shows you what's active beneath it — the pattern, the pressure, the best next move. They're not the same thing.",
  },
]

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

export default function BlogPage() {
  return (
    <SiteShell>
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-20 bg-[#08070a]">
        <Container className="max-w-3xl">
          <MetaLabel>Writing</MetaLabel>
          <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em] text-[#f4efe9] mb-4">
            Perspectives
          </h1>
          <p className="text-[#a8a29a] text-base leading-relaxed max-w-xl">
            On pattern awareness, relational dynamics, and the moments that are hard to read while you're inside them.
          </p>
        </Container>
      </section>

      <section className="w-full py-12 bg-[#08070a]">
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-0">
            {POSTS.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group flex flex-col gap-3 py-8 ${i < POSTS.length - 1 ? "border-b border-white/[0.06]" : ""} hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">{post.date}</span>
                  <span className="text-[#4f4b47]">·</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">{post.readTime} read</span>
                </div>
                <h2 className="text-xl text-[#f4efe9] font-light leading-snug group-hover:text-white transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-[#a8a29a] leading-relaxed max-w-xl">
                  {post.excerpt}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#e0743a]/70 mt-1">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </SiteShell>
  )
}
