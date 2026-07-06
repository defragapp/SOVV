import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

const POSTS: Record<string, {
  title: string
  date: string
  readTime: string
  description: string
  content: string
}> = {
  "what-is-pattern-awareness": {
    title: "What is pattern awareness — and why does it matter?",
    date: "July 2026",
    readTime: "4 min",
    description: "Most of us can describe what happened. Fewer of us can see what keeps happening. Pattern awareness is the difference between reacting to a moment and understanding what's driving it.",
    content: `
Most of us can describe what happened. Fewer of us can see what keeps happening.

That gap — between the event and the pattern — is where most confusion lives. You know the conversation went sideways. You know the decision felt off. You know the dynamic with that person is exhausting. But you can't quite name why it keeps repeating.

Pattern awareness is the capacity to see what's active beneath a moment — not just the surface event, but the underlying structure that keeps producing it.

## Why it's hard to see from inside

When you're inside a moment, you're using most of your cognitive bandwidth to navigate it. There's no spare capacity to observe the pattern while you're living it. This is normal. It's not a failure of intelligence or self-awareness.

The problem is that most tools for self-reflection ask you to describe what happened — not what's driving it. Journaling, therapy notes, even conversations with trusted people tend to stay at the level of the event. "Here's what they said. Here's what I felt. Here's what I did."

That's useful. But it doesn't automatically surface the pattern.

## What pattern awareness actually looks like

Pattern awareness isn't about finding fault or assigning blame. It's about seeing the structure clearly enough to make a different choice.

It sounds like:
- "This is the third time I've felt this way in this kind of conversation."
- "I tend to go quiet when I feel unheard — and then the other person escalates."
- "I keep making this decision under pressure, and it keeps not working."

When you can see the pattern, you have options. When you can't, you're just reacting.

## How Sovereign.os approaches this

Sovereign.os is built around a simple premise: the moments that are hardest to read are the ones most worth understanding.

The Defrag space takes what you're experiencing — a conversation, a decision, a dynamic — and surfaces what's active beneath it. Not advice. Not judgment. Pattern recognition, applied to your specific situation, grounded in your Baseline Design.

The goal isn't to tell you what to do. It's to show you what's happening clearly enough that you can decide.
    `,
  },
  "baseline-design-explained": {
    title: "Baseline Design: the map beneath every conversation",
    date: "July 2026",
    readTime: "5 min",
    description: "Your Baseline Design isn't a personality test. It's a starting map — how you tend to process, respond, connect, protect, and return to center. Here's what it is and why it matters.",
    content: `
Your Baseline Design isn't a personality test.

Personality tests tell you what type you are. Baseline Design tells you how you tend to operate — how you process information, how you respond under pressure, how you connect with others, how you protect yourself, and how you return to center when you've been knocked off balance.

The distinction matters. Types are fixed. Tendencies are contextual. And context is everything.

## What goes into a Baseline Design

Baseline Design draws from multiple frameworks — Human Design, astrology, and AI-derived behavioral patterns — not because any one of them is complete, but because each illuminates a different dimension of how you tend to show up.

Human Design maps your energy type, authority, and decision-making strategy. Astrology surfaces timing patterns and relational dynamics. AI-derived traits identify behavioral tendencies from the patterns you've already shown.

Together, they produce a starting map. Not a verdict. Not a fixed identity. A map.

## What it's used for

Your Baseline Design is private. It's never shown in outputs. It operates beneath every session — informing how Sovereign.os interprets what you're experiencing and what it surfaces back to you.

When you describe a difficult conversation in Defrag, the response isn't generic. It's calibrated to how you tend to process conflict, what your pressure patterns look like, and what kind of next move is likely to work for someone with your particular wiring.

This is the difference between pattern recognition and advice. Advice is generic. Pattern recognition is specific.

## What it isn't

Baseline Design isn't a diagnosis. It isn't a limitation. It isn't a reason to explain away behavior or avoid accountability.

It's a starting point for understanding — not a destination.

The most useful thing a map can do is show you where you are. What you do with that information is still entirely up to you.
    `,
  },
  "defrag-vs-journaling": {
    title: "Defrag vs journaling: what's the difference?",
    date: "July 2026",
    readTime: "3 min",
    description: "Journaling captures what happened. Defrag shows you what's active beneath it — the pattern, the pressure, the best next move. They're not the same thing.",
    content: `
Journaling is one of the most consistently recommended practices for self-reflection. And for good reason — writing things down creates distance from the event, which makes it easier to see.

But journaling has a structural limitation: it captures what happened. It doesn't automatically surface what's driving it.

## The gap between description and pattern

When you journal, you're narrating. "This is what they said. This is what I felt. This is what I did." That narration is valuable. It creates a record. It externalizes the experience.

What it doesn't do, on its own, is identify the pattern beneath the event. That requires a different kind of processing — one that looks across multiple instances, identifies structural similarities, and names what's repeating.

Most people can't do that reliably in the moment. Not because they're not self-aware, but because they're too close to the material.

## What Defrag does differently

Defrag isn't a journal. You're not narrating — you're describing what's happening, and the system is surfacing what's active beneath it.

The output isn't a summary of what you said. It's a pattern read: what's driving the dynamic, what pressure you're under, what role you might be playing, and what next move gives the situation a better chance.

This is useful in a different way than journaling. Journaling helps you process. Defrag helps you see.

## They're not in competition

The most effective use of both is sequential. Journal to process the event. Use Defrag to understand the pattern. The two practices reinforce each other.

What Defrag adds is the layer that journaling can't provide on its own: a structured read of what's active, grounded in your specific Baseline Design, applied to the specific moment you're in.

That's not therapy. It's not advice. It's pattern recognition — applied to the moments that are hardest to read while you're inside them.
    `,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS[slug]
  if (!post) return { title: "Not Found" }
  return {
    title: `${post.title} — Sovereign.os`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://defrag.app/blog/${slug}`,
    },
  }
}

export function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }))
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS[slug]
  if (!post) notFound()

  const paragraphs = post.content.trim().split('\n\n')

  return (
    <SiteShell>
      <article className="w-full pt-32 pb-24 md:pt-40 bg-[#08070a]">
        <Container className="max-w-2xl">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] hover:text-[#a8a29a] transition-colors mb-12"
          >
            ← Writing
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">{post.date}</span>
              <span className="text-[#4f4b47]">·</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">{post.readTime} read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light tracking-[-0.02em] text-[#f4efe9] leading-snug">
              {post.title}
            </h1>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6">
            {paragraphs.map((para, i) => {
              if (para.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-xl text-[#f4efe9] font-light mt-4 leading-snug">
                    {para.replace('## ', '')}
                  </h2>
                )
              }
              if (para.startsWith('- ')) {
                const items = para.split('\n').filter(l => l.startsWith('- '))
                return (
                  <ul key={i} className="flex flex-col gap-2 pl-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-[#a8a29a] text-base leading-relaxed flex gap-3">
                        <span className="text-[#e0743a]/60 shrink-0">—</span>
                        <span>{item.replace('- ', '')}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={i} className="text-[#a8a29a] text-base leading-relaxed">
                  {para}
                </p>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-white/[0.06]">
            <p className="text-sm text-[#76716b] mb-4">Try Sovereign.os — free to start.</p>
            <Link href="/app/login" className="btn-primary inline-block px-6">
              Enter your space
            </Link>
          </div>
        </Container>
      </article>
    </SiteShell>
  )
}
