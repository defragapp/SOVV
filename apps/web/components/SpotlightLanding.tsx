"use client"

import { useRef, useState, useEffect, type MouseEvent } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import styles from "../hero.module.css"

const PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://app.defrag.app"

const APP_ENTRY_ROUTE = `${PUBLIC_APP_URL}/login`

/* ── Animated section wrapper using existing easing tokens ── */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.0, 0.0, 0.2, 1], // --easing-reveal from tokens
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Animated counter ── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = to / 40
    const t = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(t) }
      else setVal(Math.floor(start))
    }, 30)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{val}{suffix}</span>
}

export default function SpotlightLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [haloFired, setHaloFired] = useState(false)

  // Parallax scroll for hero
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 120])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  // Spotlight mouse tracking
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }
  const resetSpotlight = () => setPosition({ x: 50, y: 50 })

  // Fire halo animation after mount (matches hero.module.css body class pattern)
  useEffect(() => {
    const t = setTimeout(() => {
      document.body.classList.add("sov-hero-halo")
      setHaloFired(true)
    }, 1200)
    return () => {
      clearTimeout(t)
      document.body.classList.remove("sov-hero-halo")
    }
  }, [])

  return (
    <div
      className="bg-black text-[#F6F5F3] selection:bg-white/20 selection:text-white overflow-x-hidden"
      style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >

      {/* ══════════════════════════════════════════
          HERO — spotlight + CSS module animations
      ══════════════════════════════════════════ */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetSpotlight}
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden border-b border-[#F6F5F3]/10"
      >
        {/* Abstract dark water ripple background with parallax */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.pexels.com/photos/23232486/pexels-photo-23232486/free-photo-of-dark-water-with-reflections-and-ripples.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-25 grayscale scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </motion.div>

        {/* Spotlight radial gradient — tracks mouse */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-all duration-75"
          style={{
            backgroundImage: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 45%)`,
          }}
        />

        {/* Hero centeredFrame — uses hero.module.css animation */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 flex max-w-3xl flex-col items-center px-6 text-center"
        >
          {/* Eyebrow — uses tableFadeIn timing */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.0, 0.0, 0.2, 1] }}
            className="mb-10 font-mono text-[10px] uppercase tracking-[0.35em] text-white/25"
          >
            Sovereign OS — Relational Intelligence
          </motion.p>

          {/* Main headline — centerHeroFade from hero.module.css */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
            className="mb-6 text-5xl font-light tracking-tight text-[#F6F5F3] md:text-7xl leading-[1.04]"
            style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
          >
            Healing isn&apos;t optional.
            <br />
            <span className="text-white/40">Holding onto the pain is.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.0, 0.0, 0.2, 1] }}
            className="mb-6 text-lg font-light text-white/55 md:text-xl max-w-2xl leading-relaxed"
          >
            See what&apos;s really happening — in you, in them, and in the space between.
          </motion.p>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.0, 0.0, 0.2, 1] }}
            className="mb-12 max-w-xl text-sm font-light leading-relaxed text-white/30 md:text-base"
          >
            A quiet moment in the chaos. The breath you didn&apos;t know you were
            holding. The shift that changes everything.
          </motion.p>

          {/* CTAs — haloSnapIn timing */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <a
              href={APP_ENTRY_ROUTE}
              className="group relative overflow-hidden bg-[#F6F5F3] px-10 py-4 text-sm font-medium uppercase tracking-widest text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              <span className="relative z-10">Get Clarity Now</span>
            </a>
            <a
              href="#demo"
              className="border border-[#F6F5F3]/20 bg-transparent px-10 py-4 text-sm font-medium uppercase tracking-widest text-[#F6F5F3] opacity-70 transition-colors hover:bg-white/5 text-center"
            >
              Watch Trailer
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">Scroll</span>
          <motion.div
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-8 w-px bg-white/20 origin-top"
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          PULL QUOTE — atmospheric image break
      ══════════════════════════════════════════ */}
      <section className="relative h-[45vh] min-h-[280px] overflow-hidden border-b border-[#F6F5F3]/10">
        <img
          src="https://images.pexels.com/photos/18820283/pexels-photo-18820283/free-photo-of-sunlight-streaming-into-a-dark-room-through-a-lone-window.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Light through a window"
          className="h-full w-full object-cover opacity-30 grayscale scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <RevealSection>
            <blockquote
              className="max-w-2xl text-center text-2xl font-light italic text-white/75 md:text-3xl leading-relaxed"
              style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
            >
              &ldquo;Most of what hurts isn&apos;t the moment itself.<br className="hidden md:block" />
              It&apos;s the way we hold it.&rdquo;
            </blockquote>
          </RevealSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY SOVEREIGN
      ══════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 py-32">
        <RevealSection>
          <div className="flex items-center gap-4 mb-20">
            <div className="h-px flex-1 bg-[#F6F5F3]/10" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25">Why Sovereign?</p>
            <div className="h-px flex-1 bg-[#F6F5F3]/10" />
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-20 md:grid-cols-2 items-start">
          <RevealSection delay={0.1}>
            <p
              className="text-4xl font-light leading-[1.15] text-[#F6F5F3] md:text-5xl"
              style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
            >
              We brace.<br />
              We replay.<br />
              We grip the<br />
              story too tight.
            </p>
          </RevealSection>

          <RevealSection delay={0.25}>
            <div className="space-y-7 text-base leading-8 text-white/55 pt-2">
              <p>
                Sovereign shows you the part you couldn&apos;t see from inside the
                moment — the shift that makes your whole system go:
              </p>
              <blockquote className="border-l-2 border-white/20 pl-6 text-white/80 text-lg font-light italic">
                &ldquo;Oh… damn. I didn&apos;t see it like that before.<br />
                But I feel it. So I know it&apos;s true.&rdquo;
              </blockquote>
              <p>
                This is clarity that lands. Perspective that steadies.
                A move that brings you back to yourself.
              </p>
              <p className="text-white/35 text-sm">
                Not therapy. Not journaling. Not another app asking you to rate
                your mood. A map of what actually happened — and a move that
                breaks the cycle.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="border-t border-b border-[#F6F5F3]/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { n: 94, suffix: "%", label: "report clarity after first session" },
              { n: 3, suffix: "min", label: "average time to first insight" },
              { n: 12, suffix: "k+", label: "conflict loops broken" },
              { n: 0, suffix: " jargon", label: "no therapy-speak, ever" },
            ].map((stat) => (
              <RevealSection key={stat.label} className="text-center">
                <p className="text-4xl font-light text-[#F6F5F3] mb-2 tabular-nums">
                  <Counter to={stat.n} suffix={stat.suffix} />
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 leading-relaxed">
                  {stat.label}
                </p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — animated cards
      ══════════════════════════════════════════ */}
      <section className="border-b border-[#F6F5F3]/10">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <RevealSection className="mb-20 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25 mb-4">How it works</p>
            <h2
              className="text-3xl font-light text-[#F6F5F3] md:text-4xl"
              style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
            >
              Three moves. One shift.
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Widen the Frame",
                body: "See what's happening in you, in them, and in the space between — without blame or judgment. The full picture, finally.",
                img: "https://as1.ftcdn.net/jpg/11/24/52/72/1000_F_1124527257_TJznQNEfbsRAIp7e2b2SOulJ7TLyi2kk.jpg",
                delay: 0,
              },
              {
                num: "02",
                title: "Feel the Shift",
                body: "Experience the moment where tension softens and the story opens. Not analysis — recognition. The kind that lands in the body.",
                img: "https://images.pexels.com/photos/18820283/pexels-photo-18820283/free-photo-of-sunlight-streaming-into-a-dark-room-through-a-lone-window.jpeg?auto=compress&cs=tinysrgb&w=400",
                delay: 0.15,
              },
              {
                num: "03",
                title: "Make Your Move",
                body: "Take the next clean step that brings you back to your center. Concrete. Specific. No more circling the same wound.",
                img: "https://astrologyinquirer.com/wp-content/uploads/2023/11/benefits-of-darkness-meditation.jpg",
                delay: 0.3,
              },
            ].map((step, i) => (
              <RevealSection key={step.num} delay={step.delay}>
                <motion.div
                  whileHover={{ backgroundColor: "rgba(246,245,243,0.03)" }}
                  transition={{ duration: 0.2 }}
                  className={`relative overflow-hidden border border-[#F6F5F3]/10 p-8 h-full ${
                    i === 1 ? "md:border-x-0" : ""
                  }`}
                >
                  {/* Image header */}
                  <div className="relative h-44 mb-8 overflow-hidden -mx-8 -mt-8">
                    <img
                      src={step.img}
                      alt={step.title}
                      className="h-full w-full object-cover opacity-25 grayscale transition-all duration-700 group-hover:opacity-35 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
                  </div>

                  <span className="font-mono text-[10px] text-white/20 tracking-[0.3em]">{step.num}</span>
                  <h3 className="mt-3 mb-3 text-xl font-light text-[#F6F5F3]">{step.title}</h3>
                  <p className="text-sm leading-7 text-white/45">{step.body}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — two column
      ══════════════════════════════════════════ */}
      <section className="border-b border-[#F6F5F3]/10 bg-[#050505]">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <div className="grid grid-cols-1 gap-20 md:grid-cols-2 items-center">
            <RevealSection>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25 mb-10">What you get</p>
              <ul className="space-y-8">
                {[
                  {
                    label: "Real-time emotional clarity",
                    desc: "Understand what's actually driving the conflict as it unfolds — not hours later.",
                  },
                  {
                    label: "Interactive perspective shifts",
                    desc: "Step outside your own frame and see the full dynamic without losing yourself.",
                  },
                  {
                    label: "Guided moves to release tension",
                    desc: "Concrete next steps — not vague advice or breathing exercises.",
                  },
                  {
                    label: "No jargon, no stigma, just truth",
                    desc: "Built for people who want clarity, not therapy-speak or self-help clichés.",
                  },
                  {
                    label: "Pattern memory across sessions",
                    desc: "Sovereign learns your recurring dynamics over time and surfaces them when it matters.",
                  },
                ].map((f, i) => (
                  <motion.li
                    key={f.label}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.0, 0.0, 0.2, 1] }}
                    className="flex gap-5"
                  >
                    <span className="mt-2 block h-1.5 w-1.5 shrink-0 bg-[#F6F5F3]" />
                    <div>
                      <p className="text-base text-[#F6F5F3] font-light mb-1">{f.label}</p>
                      <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </RevealSection>

            <RevealSection delay={0.2}>
              <div className="relative overflow-hidden border border-[#F6F5F3]/10 aspect-[4/5]">
                <img
                  src="https://c.wallhere.com/photos/47/58/reflection_water_fog_foggy_abstract_minimal_minimalism_contrast-569115.jpg!d"
                  alt="Clarity through stillness"
                  className="h-full w-full object-cover opacity-20 grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                {/* Animated text overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 mb-3">
                      Live session
                    </p>
                    <div className="space-y-2">
                      {["Trigger identified", "Escalation point mapped", "Clean move available"].map((line, i) => (
                        <motion.div
                          key={line}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.3 + 0.5, duration: 0.5 }}
                          className="flex items-center gap-3"
                        >
                          <span className="block h-px w-4 bg-white/30" />
                          <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">{line}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="border-b border-[#F6F5F3]/10">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <RevealSection className="mb-20 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25">
              What people say
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                quote: "I could see exactly where I lost the thread — and what I could have said instead. That's never happened before.",
                name: "Early access user",
                delay: 0,
              },
              {
                quote: "We've had the same fight for three years. After one session I understood what it was actually about. We haven't had it since.",
                name: "Beta participant",
                delay: 0.15,
              },
              {
                quote: "It doesn't tell you what to feel. It shows you what's happening. That's the difference.",
                name: "Founding member",
                delay: 0.3,
              },
            ].map((t) => (
              <RevealSection key={t.name} delay={t.delay}>
                <motion.div
                  whileHover={{ borderColor: "rgba(246,245,243,0.25)" }}
                  className="border border-[#F6F5F3]/10 p-8 h-full flex flex-col justify-between transition-colors duration-300"
                >
                  <blockquote
                    className="text-base font-light italic text-white/65 leading-relaxed mb-8"
                    style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/25">{t.name}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      <section className="border-b border-[#F6F5F3]/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-6 py-32">
          <RevealSection className="mb-20 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/25 mb-4">Access</p>
            <h2
              className="text-3xl font-light text-[#F6F5F3]"
              style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
            >
              Simple. No surprises.
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {/* Free */}
            <RevealSection delay={0.1}>
              <div className="border border-[#F6F5F3]/10 p-10 h-full flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-8">Free</p>
                <div className="mb-8">
                  <span className="text-5xl font-light text-[#F6F5F3]">$0</span>
                  <span className="text-white/30 text-sm ml-2">always</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "5 sessions per day",
                    "Self-only threads",
                    "Core Map + Shift + Move",
                    "No credit card required",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-sm text-white/50">
                      <span className="block h-px w-4 bg-white/20 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={APP_ENTRY_ROUTE}
                  className="block border border-[#F6F5F3]/20 px-6 py-3.5 text-center font-mono text-xs uppercase tracking-widest text-[#F6F5F3] hover:bg-white/5 transition-colors"
                >
                  Start Free
                </a>
              </div>
            </RevealSection>

            {/* Pro */}
            <RevealSection delay={0.2}>
              <motion.div
                whileHover={{ boxShadow: "0 0 40px rgba(246,245,243,0.06)" }}
                className="border border-[#F6F5F3] p-10 h-full flex flex-col relative transition-shadow duration-500"
              >
                <div className="absolute top-5 right-5 font-mono text-[9px] uppercase tracking-widest text-black bg-[#F6F5F3] px-2.5 py-1">
                  Recommended
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-8">Pro</p>
                <div className="mb-8">
                  <span className="text-5xl font-light text-[#F6F5F3]">$12</span>
                  <span className="text-white/30 text-sm ml-2">/ month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Unlimited sessions",
                    "People + group threads",
                    "Pattern memory across sessions",
                    "Audio overview mode",
                    "Priority processing",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-sm text-white/75">
                      <span className="block h-px w-4 bg-white/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={APP_ENTRY_ROUTE}
                  className="block bg-[#F6F5F3] px-6 py-3.5 text-center font-mono text-xs uppercase tracking-widest text-black hover:bg-white transition-colors"
                >
                  Unlock Pro
                </a>
              </motion.div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[#F6F5F3]/10">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/9358948/pexels-photo-9358948.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-15 grayscale"
          />
          <div className="absolute inset-0 bg-black/90" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-40 text-center">
          <RevealSection>
            <h2
              className="mb-6 text-4xl font-light text-[#F6F5F3] md:text-6xl leading-tight"
              style={{ fontFamily: "'GT Sectra Display', Georgia, serif" }}
            >
              Ready to stop holding<br />onto the pain?
            </h2>
            <p className="mb-12 text-white/35 text-base font-light max-w-md mx-auto leading-relaxed">
              No jargon. No stigma. Just the shift you&apos;ve been waiting for.
            </p>
            <motion.a
              href={APP_ENTRY_ROUTE}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(246,245,243,0.12)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="inline-block bg-[#F6F5F3] px-14 py-5 text-sm font-medium uppercase tracking-widest text-black hover:bg-white transition-colors"
            >
              Start Your Shift Today
            </motion.a>
          </RevealSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="px-6 py-12">
        <div className="mx-auto max-w-5xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20 mb-1">
              Sovereign OS
            </p>
            <p className="font-mono text-[9px] text-white/15">
              Relational intelligence for the moments that matter
            </p>
          </div>
          <div className="flex gap-8 flex-wrap">
            {[
              { label: "Enter App", href: APP_ENTRY_ROUTE },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}