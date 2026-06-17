import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { AnimatedHeading, TextReveal } from "@/components/marketing/animated-elements"

export const metadata: Metadata = {
  title: "Covenant — Sovereign.os",
  description: "A simple way to understand your life through the wisdom of Scripture. Covenant connects what you're going through to the real human stories found in the Bible.",
}

const APP_URL = "https://app.defrag.app/app/login"

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

// Inline SVG — no Lucide
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const BIBLICAL_PATTERNS = [
  { feeling: "Feeling misunderstood", figure: "Joseph", ref: "Genesis 37–50" },
  { feeling: "Feeling betrayed", figure: "David", ref: "Psalms of lament" },
  { feeling: "Feeling overwhelmed", figure: "Moses", ref: "Exodus 18" },
  { feeling: "Feeling tested", figure: "Job", ref: "Job 1–42" },
  { feeling: "Feeling called to rebuild", figure: "Nehemiah", ref: "Nehemiah 1–6" },
  { feeling: "Feeling unseen", figure: "Hagar", ref: "Genesis 16, 21" },
  { feeling: "Feeling loyal but tired", figure: "Ruth", ref: "Ruth 1–4" },
  { feeling: "Feeling stuck or lost", figure: "Abraham", ref: "Genesis 12–22" },
]

const WHAT_IT_GIVES = [
  { label: "Clarity", body: "You finally understand what's happening inside you and around you." },
  { label: "Language", body: "You can name the moment without shame or confusion." },
  { label: "Perspective", body: "You see your situation through the wisdom of Scripture." },
  { label: "Direction", body: "You get grounded next steps that actually help." },
  { label: "Connection", body: "You feel closer to God because the story becomes personal." },
  { label: "Strength", body: "You realize you're not the first person to walk this path — and you won't walk it alone." },
]

export default function CovenantProductPage() {
  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-60" aria-hidden />
        <Container className="relative z-10 max-w-4xl">
          <MetaLabel>Covenant</MetaLabel>
          <h1 className="font-serif text-[#f4efe9] text-4xl md:text-6xl lg:text-7xl tracking-[-0.02em] leading-[1.05] max-w-3xl animate-fade-up">
            A simple way to understand your life through the wisdom of Scripture.
          </h1>
          <p className="mt-7 max-w-xl text-base md:text-lg text-[#c8c2ba] leading-relaxed animate-fade-up delay-100">
            Covenant connects what you're going through to the real human stories, struggles, and breakthroughs found in the Bible. It doesn't preach at you. It doesn't judge you. It simply shows you you're not alone — and this has been walked before.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
            <Link href={APP_URL} className="btn-primary">Open Covenant</Link>
            <Link href="/pricing" className="btn-secondary">Pro required</Link>
          </div>
        </Container>
      </section>

      {/* ── THE CORE PROMISE ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <div className="border border-white/[0.08] p-8 md:p-12" style={{ borderRadius: 16 }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-6">What Covenant says</p>
            <blockquote className="font-serif text-xl md:text-2xl text-[#f4efe9] leading-relaxed">
              "Here's a moment in Scripture that looks a lot like what you're facing.
              <br className="hidden md:block" />
              Here's what they learned.
              <br className="hidden md:block" />
              Here's how God met them in it.
              <br className="hidden md:block" />
              Here's what that might mean for you today."
            </blockquote>
          </div>
        </Container>
      </section>

      {/* ── WHAT IT DOES ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What Covenant does</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            Five things. In plain language.
          </AnimatedHeading>

          <div className="flex flex-col gap-0">
            {[
              {
                num: "01",
                title: "Identifies the pattern you're in",
                body: "Every moment has a shape. Covenant recognizes which biblical pattern matches your situation — not as a label, but as a map.",
              },
              {
                num: "02",
                title: "Shows you the story in simple language",
                body: "No heavy theology. No complicated metaphors. Just what happened, what broke, what hurt, what changed, what God did, and what the person learned.",
              },
              {
                num: "03",
                title: "Connects the story to your life",
                body: "How your moment mirrors theirs. What the deeper theme is. What God revealed in that story. What that wisdom might mean for you today.",
              },
              {
                num: "04",
                title: "Gives you one grounded next step",
                body: "Not a lecture. Not a list. Not a moral command. Just one real, human, doable next step that fits the story you're in.",
              },
              {
                num: "05",
                title: "Provides scripture and resources to go deeper",
                body: "Curated passages, reflection prompts, and optional books and teachings — for when you want to keep going.",
              },
            ].map((item, i) => (
              <TextReveal key={item.num} delay={i * 60}>
                <div className="flex items-start gap-8 py-7 border-b border-white/[0.06] last:border-0">
                  <span className="font-mono text-[10px] text-[#4f4b47] tracking-[0.2em] shrink-0 w-6 mt-1">{item.num}</span>
                  <div>
                    <h3 className="text-[#f4efe9] font-medium text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-[#a8a29a] leading-relaxed max-w-lg">{item.body}</p>
                  </div>
                </div>
              </TextReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── BIBLICAL PATTERNS ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>Biblical patterns</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-5">
            Your moment has been walked before.
          </AnimatedHeading>
          <TextReveal delay={150}>
            <p className="text-base text-[#a8a29a] leading-relaxed mb-14 max-w-lg">
              Covenant matches what you're feeling to the real human stories in Scripture — not as metaphor, but as lived experience.
            </p>
          </TextReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {BIBLICAL_PATTERNS.map((item, i) => (
              <TextReveal key={i} delay={i * 50}>
                <div className="flex items-start gap-5 py-5 border-b border-white/[0.06] pr-6">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm text-[#76716b] leading-relaxed italic">"{item.feeling}"</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#e0743a]/60 text-sm">→</span>
                      <span className="text-[#f4efe9] font-medium text-sm">{item.figure}</span>
                      <span className="font-mono text-[8px] text-[#4f4b47] tracking-[0.1em]">{item.ref}</span>
                    </div>
                  </div>
                </div>
              </TextReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── HOW IT UNDERSTANDS YOU ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>How Covenant understands your moment</MetaLabel>
          <AnimatedHeading className="text-3xl md:text-5xl tracking-[-0.02em] max-w-2xl leading-tight mb-14">
            Two things working together.
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "Your Baseline Design",
                body: "Your personal wiring — how you tend to think, feel, and respond under pressure or peace. It helps Covenant understand what overwhelms you, what strengthens you, what patterns you repeat, and what you need to feel grounded.",
              },
              {
                num: "02",
                title: "The live sky at your location",
                body: "Not fortune-telling. Simply a way of understanding the tone of the moment — the emotional weather you're in. Together with your Baseline Design, it helps Covenant understand the weight, the tension, and the type of story you're standing inside.",
              },
            ].map((item) => (
              <div key={item.num} className="border border-white/[0.08] p-6" style={{ borderRadius: 14 }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">{item.num}</p>
                <h3 className="text-[#f4efe9] font-medium text-base mb-3">{item.title}</h3>
                <p className="text-sm text-[#a8a29a] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── WHAT IT GIVES YOU ── */}
      <section className="w-full py-20 md:py-28 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>What Covenant gives you</MetaLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {WHAT_IT_GIVES.map((item, i) => (
              <div key={i} className="py-7 pr-8 border-b border-white/[0.06] md:border-r md:even:border-r-0">
                <h3 className="text-[#f4efe9] font-medium text-base mb-2">{item.label}</h3>
                <p className="text-sm text-[#a8a29a] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── RESOURCES ── */}
      <section className="w-full py-20 md:py-28 bg-[#08070a] border-t border-white/5">
        <Container className="max-w-3xl">
          <MetaLabel>Resources Covenant provides</MetaLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Scripture",
                items: ["Stories", "Psalms", "Teachings", "Letters", "Themes", "Chapters to explore"],
              },
              {
                title: "Reflection prompts",
                items: [
                  "What is this moment asking of me?",
                  "What wound is being touched?",
                  "What truth am I avoiding?",
                  "What is God revealing here?",
                ],
              },
              {
                title: "Recommended reading",
                items: [
                  "Emotionally Healthy Spirituality — Scazzero",
                  "The Wounded Healer — Nouwen",
                  "Sacred Rhythms — Barton",
                  "A Long Obedience — Peterson",
                ],
              },
            ].map((col) => (
              <div key={col.title} className="border border-white/[0.08] p-6" style={{ borderRadius: 14 }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-5">{col.title}</p>
                <div className="flex flex-col gap-2.5">
                  {col.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[#e0743a]/40 text-xs shrink-0 mt-0.5">—</span>
                      <p className="text-sm text-[#a8a29a] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── PRO NOTE ── */}
      <section className="w-full py-16 bg-[#0c0a0d] border-t border-white/5">
        <Container className="max-w-2xl">
          <div className="border border-white/[0.08] p-8" style={{ borderRadius: 16 }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-4">Pro space</p>
            <h3 className="font-serif text-2xl text-[#f4efe9] mb-3">Covenant requires Pro.</h3>
            <p className="text-sm text-[#a8a29a] leading-relaxed mb-6">
              Covenant is available on the Pro plan alongside Alignment, unlimited sessions, full Library depth, and Audio Overview.
            </p>
            <Link href="/pricing" className="btn-primary inline-flex">See Pro plan</Link>
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 md:py-32 bg-[#08070a] border-t border-white/5 overflow-hidden">
        <div className="light-beam" aria-hidden />
        <Container className="relative z-10 flex flex-col items-center text-center">
          <AnimatedHeading className="text-4xl md:text-6xl tracking-[-0.02em] leading-[1.05] max-w-2xl text-balance">
            You're not the first person to walk this path.
          </AnimatedHeading>
          <TextReveal delay={200}>
            <p className="mt-6 max-w-md text-base text-[#a8a29a] leading-relaxed">
              Open Covenant and describe what you're walking through. Scripture has been here before.
            </p>
          </TextReveal>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href={APP_URL} className="btn-primary">Open Covenant</Link>
            <Link href="/pricing" className="btn-secondary">See plans</Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
