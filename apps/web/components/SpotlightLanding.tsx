"use client"

import { useRef, useState, type MouseEvent } from "react"

const PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://app.defrag.app"

const APP_ENTRY_ROUTE = `${PUBLIC_APP_URL}/settings`

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

  const resetSpotlight = () => {
    setPosition({ x: 50, y: 50 })
  }

  return (
    <div className="bg-black text-[#F6F5F3] font-light selection:bg-white/20 selection:text-white">
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetSpotlight}
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden border-b border-[#F6F5F3]/10 bg-black transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,1) 40%)`,
        }}
      >
        <div className="pointer-events-none z-10 flex max-w-3xl flex-col items-center px-6 text-center">
          <h1 className="mb-6 text-4xl font-light tracking-tight text-[#F6F5F3] md:text-6xl">
            Healing isn’t optional. <br className="hidden md:block" />
            Holding onto the pain is.
          </h1>

          <p className="mb-8 text-lg font-light text-white/60 md:text-xl">
            See what’s really happening — in you, in them, and in the space
            between.
          </p>

          <p className="mb-12 max-w-xl text-sm font-light leading-relaxed text-white/40 md:text-base">
            A quiet moment in the chaos. The breath you didn’t know you were
            holding. The shift that changes everything.
          </p>

          <div className="pointer-events-auto flex flex-col gap-6 sm:flex-row">
            <a
              href={APP_ENTRY_ROUTE}
              className="bg-[#F6F5F3] px-8 py-3 text-sm font-medium uppercase tracking-widest text-black transition-colors hover:bg-white"
            >
              Get Clarity Now
            </a>

            <button
              type="button"
              disabled
              className="border border-[#F6F5F3]/20 bg-transparent px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#F6F5F3] opacity-70 transition-colors hover:bg-white/5"
            >
              Watch Trailer
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="mb-24">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-white/40">
            Why Sovereign?
          </h2>

          <p className="text-2xl font-light leading-relaxed md:text-3xl">
            Most of what hurts isn’t the moment itself. It’s the way we hold it.
          </p>

          <div className="mt-8 space-y-6 text-lg leading-8 text-white/65">
            <p>We brace. We replay. We grip the story too tight.</p>

            <p>
              Sovereign shows you the part you couldn’t see from inside the
              moment — the shift that makes your whole system go:
            </p>

            <blockquote className="border-l border-white/20 pl-6 text-white/85">
              “Oh… damn. I didn’t see it like that before. But I feel it. So I
              know it’s true.”
            </blockquote>

            <p>
              This is clarity that lands. Perspective that steadies. A move
              that brings you back to yourself.
            </p>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="mb-8 text-sm uppercase tracking-widest text-white/40">
            How it works
          </h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <span className="mb-4 block text-2xl">1.</span>
              <h3 className="mb-2 text-lg">Widen the Frame</h3>
              <p className="text-sm leading-6 text-white/50">
                See what’s happening in you, in them, and in the space between
                — without blame or judgment.
              </p>
            </div>

            <div>
              <span className="mb-4 block text-2xl">2.</span>
              <h3 className="mb-2 text-lg">Feel the Shift</h3>
              <p className="text-sm leading-6 text-white/50">
                Experience the moment where tension softens and the story
                opens.
              </p>
            </div>

            <div>
              <span className="mb-4 block text-2xl">3.</span>
              <h3 className="mb-2 text-lg">Make Your Move</h3>
              <p className="text-sm leading-6 text-white/50">
                Take the next clean step that brings you back to your center.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="mb-8 text-sm uppercase tracking-widest text-white/40">
            Features
          </h2>

          <ul className="space-y-4 text-lg font-light text-white/80">
            {[
              "Real-time emotional clarity",
              "Interactive perspective shifts",
              "Guided moves to release tension",
              "No jargon, no stigma, just truth",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-4">
                <span className="block h-1.5 w-1.5 bg-[#F6F5F3]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#F6F5F3]/10 py-24 text-center">
          <h2 className="mb-8 text-3xl font-light">
            Ready to stop holding onto the pain?
          </h2>

          <a
            href={APP_ENTRY_ROUTE}
            className="inline-block bg-[#F6F5F3] px-8 py-3 text-sm font-medium uppercase tracking-widest text-black transition-colors hover:bg-white"
          >
            Start Your Shift Today
          </a>
        </div>
      </section>
    </div>
  )
}
