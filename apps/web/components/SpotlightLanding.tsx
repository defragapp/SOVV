"use client"

import { useRef, useState, type MouseEvent } from "react"

const PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://app.defrag.app"

const APP_ENTRY_ROUTE = `${PUBLIC_APP_URL}/app`

export default function SpotlightLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setPosition({ x, y })
  }

  const resetSpotlight = () => setPosition({ x: 50, y: 50 })

  return (
    <div className="bg-black text-[#F6F5F3] font-light selection:bg-white/20 selection:text-white">

      {/* ── HERO ── */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetSpotlight}
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden border-b border-[#F6F5F3]/10"
        style={{
          backgroundImage: `
            radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 50%),
            url('https://images.pexels.com/photos/9358948/pexels-photo-9358948.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 flex max-w-3xl flex-col items-center px-6 text-center">
          {/* Eyebrow */}
          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
            Sovereign OS — Relational Intelligence
          </p>

          <h1 className="mb-6 text-5xl font-light tracking-tight text-[#F6F5F3] md:text-7xl leading-[1.05]">
            Healing isn&apos;t optional.<br className="hidden md:block" />
            <span className="text-white/50"> Holding onto the pain is.</span>
          </h1>

          <p className="mb-8 text-lg font-light text-white/60 md:text-xl max-w-2xl leading-relaxed">
            See what&apos;s really happening — in you, in them, and in the space between.
          </p>

          <p className="mb-12 max-w-xl text-sm font-light leading-relaxed text-white/35 md:text-base">
            A quiet moment in the chaos. The breath you didn&apos;t know you were
            holding. The shift that changes everything.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={APP_ENTRY_ROUTE}
              className="bg-[#F6F5F3] px-10 py-4 text-sm font-medium uppercase tracking-widest text-black transition-colors hover:bg-white"
            >
              Get Clarity Now
            </a>
            <button
              type="button"
              disabled
              className="border border-[#F6F5F3]/20 bg-transparent px-10 py-4 text-sm font-medium uppercase tracking-widest text-[#F6F5F3] opacity-60 hover:bg-white/5"
            >
              Watch Trailer
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="font-mono text-[9px] uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-px bg-white/40" />
        </div>
      </section>

      {/* ── VISUAL BREAK — atmospheric image ── */}
      <section className="relative h-[40vh] overflow-hidden border-b border-[#F6F5F3]/10">
        <img
          src="https://images.pexels.com/photos/18820283/pexels-photo-18820283/free-photo-of-sunlight-streaming-into-a-dark-room-through-a-lone-window.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Light through a window — a moment of clarity"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="max-w-2xl px-8 text-center text-2xl font-light italic text-white/80 md:text-3xl leading-relaxed">
            &ldquo;Most of what hurts isn&apos;t the moment itself.<br />
            It&apos;s the way we hold it.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── WHY SOVEREIGN ── */}
      <section className="mx-auto max-w-4xl px-6 py-28">
        <div className="mb-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#F6F5F3]/10" />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
            Why Sovereign?
          </h2>
          <div className="h-px flex-1 bg-[#F6F5F3]/10" />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
          <div>
            <p className="text-3xl font-light leading-relaxed md:text-4xl text-[#F6F5F3]">
              We brace.<br />We replay.<br />We grip the story too tight.
            </p>
          </div>
          <div className="space-y-6 text-base leading-8 text-white/60">
            <p>
              Sovereign shows you the part you couldn&apos;t see from inside the
              moment — the shift that makes your whole system go:
            </p>
            <blockquote className="border-l-2 border-white/20 pl-6 text-white/85 text-lg font-light italic">
              &ldquo;Oh… damn. I didn&apos;t see it like that before.<br />
              But I feel it. So I know it&apos;s true.&rdquo;
            </blockquote>
            <p>
              This is clarity that lands. Perspective that steadies.
              A move that brings you back to yourself.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — visual cards ── */}
      <section className="border-t border-[#F6F5F3]/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-6 py-28">
          <div className="mb-16 text-center">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
              How it works
            </h2>
            <p className="text-2xl font-light text-[#F6F5F3]">
              Three moves. One shift.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Widen the Frame",
                body: "See what's happening in you, in them, and in the space between — without blame or judgment. The full picture, finally.",
                img: "https://as1.ftcdn.net/jpg/11/24/52/72/1000_F_1124527257_TJznQNEfbsRAIp7e2b2SOulJ7TLyi2kk.jpg",
              },
              {
                num: "02",
                title: "Feel the Shift",
                body: "Experience the moment where tension softens and the story opens. Not analysis — recognition. The kind that lands in the body.",
                img: "https://images.pexels.com/photos/18820283/pexels-photo-18820283/free-photo-of-sunlight-streaming-into-a-dark-room-through-a-lone-window.jpeg?auto=compress&cs=tinysrgb&w=400",
              },
              {
                num: "03",
                title: "Make Your Move",
                body: "Take the next clean step that brings you back to your center. Concrete. Specific. No more circling the same wound.",
                img: "https://astrologyinquirer.com/wp-content/uploads/2023/11/benefits-of-darkness-meditation.jpg",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`relative overflow-hidden border border-[#F6F5F3]/10 p-8 ${
                  i === 1 ? "md:border-x-0" : ""
                }`}
              >
                <div className="relative h-40 mb-8 overflow-hidden">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="h-full w-full object-cover opacity-30 grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                </div>
                <span className="font-mono text-[10px] text-white/20 tracking-widest">{step.num}</span>
                <h3 className="mt-2 mb-3 text-xl font-light text-[#F6F5F3]">{step.title}</h3>
                <p className="text-sm leading-6 text-white/50">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-[#F6F5F3]/10">
        <div className="mx-auto max-w-4xl px-6 py-28">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-8">
                What you get
              </h2>
              <ul className="space-y-6">
                {[
                  { label: "Real-time emotional clarity", desc: "Understand what's actually driving the conflict as it unfolds." },
                  { label: "Interactive perspective shifts", desc: "Step outside your own frame and see the full dynamic." },
                  { label: "Guided moves to release tension", desc: "Concrete next steps — not vague advice." },
                  { label: "No jargon, no stigma, just truth", desc: "Built for people who want clarity, not therapy-speak." },
                  { label: "Pattern memory across sessions", desc: "Sovereign learns your recurring dynamics over time." },
                ].map((f) => (
                  <li key={f.label} className="flex gap-4">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-[#F6F5F3]" />
                    <div>
                      <p className="text-base text-[#F6F5F3] font-light">{f.label}</p>
                      <p className="text-sm text-white/40 mt-0.5">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative h-80 overflow-hidden border border-[#F6F5F3]/10">
              <img
                src="https://c.wallhere.com/photos/47/58/reflection_water_fog_foggy_abstract_minimal_minimalism_contrast-569115.jpg!d"
                alt="Clarity through stillness"
                className="h-full w-full object-cover opacity-25 grayscale"
              />
              <div className="absolute inset-0 flex items-end p-8">
                <p className="font-mono text-xs uppercase tracking-widest text-white/30">
                  Clarity that lands
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="border-t border-[#F6F5F3]/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-6 py-28">
          <div className="mb-16 text-center">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
              Access
            </h2>
            <p className="text-2xl font-light text-[#F6F5F3]">Simple. No surprises.</p>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {/* Free */}
            <div className="border border-[#F6F5F3]/10 p-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-6">Free</p>
              <p className="text-4xl font-light text-[#F6F5F3] mb-2">$0</p>
              <p className="text-sm text-white/30 mb-8">Always</p>
              <ul className="space-y-3 mb-10">
                {[
                  "5 sessions per day",
                  "Self-only threads",
                  "Core Map + Shift + Move",
                  "No credit card required",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="block h-px w-3 bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={APP_ENTRY_ROUTE}
                className="block border border-[#F6F5F3]/20 px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-[#F6F5F3] hover:bg-white/5 transition-colors"
              >
                Start Free
              </a>
            </div>

            {/* Pro */}
            <div className="border border-[#F6F5F3] p-10 relative">
              <div className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest text-black bg-[#F6F5F3] px-2 py-1">
                Recommended
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-6">Pro</p>
              <p className="text-4xl font-light text-[#F6F5F3] mb-2">$12</p>
              <p className="text-sm text-white/30 mb-8">per month</p>
              <ul className="space-y-3 mb-10">
                {[
                  "Unlimited sessions",
                  "People + group threads",
                  "Pattern memory across sessions",
                  "Audio overview mode",
                  "Priority processing",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="block h-px w-3 bg-white/60" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={APP_ENTRY_ROUTE}
                className="block bg-[#F6F5F3] px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-black hover:bg-white transition-colors"
              >
                Unlock Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="relative border-t border-[#F6F5F3]/10 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/9358948/pexels-photo-9358948.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/88" />
        <div className="relative mx-auto max-w-2xl px-6 py-36 text-center">
          <h2 className="mb-6 text-4xl font-light text-[#F6F5F3] md:text-5xl leading-tight">
            Ready to stop holding<br />onto the pain?
          </h2>
          <p className="mb-12 text-white/40 text-base font-light max-w-md mx-auto leading-relaxed">
            No jargon. No stigma. Just the shift you&apos;ve been waiting for.
          </p>
          <a
            href={APP_ENTRY_ROUTE}
            className="inline-block bg-[#F6F5F3] px-12 py-4 text-sm font-medium uppercase tracking-widest text-black transition-colors hover:bg-white"
          >
            Start Your Shift Today
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#F6F5F3]/10 px-6 py-10">
        <div className="mx-auto max-w-4xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/20">
            Sovereign OS — defrag.app
          </p>
          <div className="flex gap-8">
            <a href="/privacy" className="font-mono text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors">Privacy</a>
            <a href="/terms" className="font-mono text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors">Terms</a>
            <a href={APP_ENTRY_ROUTE} className="font-mono text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors">Enter App</a>
          </div>
        </div>
      </footer>

    </div>
  )
}