"use client";

import { useRef, useState, useEffect, type MouseEvent } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site-shell";
import { MotionSection } from "@/components/marketing/motion-section";
import { SectionHeader } from "@/components/marketing/section-header";
import { Card } from "@/components/marketing/card";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { valuePoints, lenses, faqItems, pricingTiers } from "@/data/marketing";

const APP_URL = "https://app.defrag.app";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  useEffect(() => {
    const t = setTimeout(() => document.body.classList.add("sov-hero-halo"), 1200);
    return () => { clearTimeout(t); document.body.classList.remove("sov-hero-halo"); };
  }, []);

  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setSpotlight({ x: 50, y: 50 })}
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden border-b border-white/8 grid-bg"
      >
        {/* Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-all duration-75"
          style={{
            backgroundImage: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(96,165,250,0.09) 0%, rgba(168,85,247,0.06) 25%, transparent 55%)`,
          }}
        />

        {/* Hero bg image — dark water ripple */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/23232486/pexels-photo-23232486/free-photo-of-dark-water-with-reflections-and-ripples.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-15 grayscale scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070B]/80 via-[#05070B]/40 to-[#05070B]" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 flex max-w-4xl flex-col items-center px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8 font-mono text-[10px] uppercase tracking-[0.35em] text-sky-300/50"
          >
            DEFRAG — Relational Intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
            className="hero-glow mb-6 text-5xl font-semibold tracking-tight text-white md:text-7xl leading-[1.04]"
          >
            Healing isn&apos;t optional.
            <br />
            <span className="text-white/35 font-light">But the pain is.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="mb-6 max-w-2xl text-lg font-light leading-relaxed text-white/50 md:text-xl"
          >
            Personal and relational clarity for understanding yourself, reading the moment,
            and navigating relationships with less confusion.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mb-12 max-w-xl text-sm font-light leading-relaxed text-white/25"
          >
            A quiet moment in the chaos. The breath you didn&apos;t know you were holding.
            The shift that changes everything.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href={`${APP_URL}/login`}
              className="gradient-border bg-white/8 px-10 py-4 text-sm font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/12 hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]"
            >
              Get Clarity Now
            </Link>
            <Link
              href="#how-it-works"
              className="border border-white/15 bg-transparent px-10 py-4 text-sm font-medium uppercase tracking-widest text-white/60 transition-colors hover:bg-white/5 hover:text-white/80 text-center"
            >
              How It Works
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/15">Scroll</span>
          <motion.div
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-8 w-px bg-white/15 origin-top"
          />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <MotionSection className="border-b border-white/8 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { n: 94, suffix: "%", label: "report clarity after first session" },
              { n: 3, suffix: "min", label: "average time to first insight" },
              { n: 12, suffix: "k+", label: "conflict loops broken" },
              { n: 0, suffix: " jargon", label: "no therapy-speak, ever" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-light text-white mb-2 tabular-nums">
                  <Counter to={s.n} suffix={s.suffix} />
                </p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 leading-relaxed">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ── VALUE POINTS ── */}
      <MotionSection className="border-b border-white/8 px-6 py-28" id="product">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
            <div>
              <SectionHeader
                eyebrow="What DEFRAG does"
                title="Clarity that lands in the body, not just the mind."
              />
            </div>
            <ul className="space-y-5">
              {valuePoints.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <span className="mt-2 block h-1.5 w-1.5 shrink-0 bg-sky-400/60" />
                  <span className="text-base font-light text-white/65 leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </MotionSection>

      {/* ── HOW IT WORKS ── */}
      <MotionSection className="border-b border-white/8 px-6 py-28" id="how-it-works">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            eyebrow="How it works"
            title="Three lenses. One shift."
            body="DEFRAG gives you three ways to see what's actually happening — in yourself, in the moment, and between you and others."
          />
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {lenses.map((lens, i) => (
              <Card key={lens.title} glow={i === 1}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-sky-300/50 mb-4">
                  0{i + 1}
                </p>
                <h3 className="text-xl font-light text-white mb-3">{lens.title}</h3>
                <p className="text-sm leading-7 text-white/45 mb-6">{lens.summary}</p>
                <p className="text-xs text-white/25 italic mb-6">{lens.useCase}</p>
                <Link
                  href={lens.href}
                  className="font-mono text-[9px] uppercase tracking-widest text-sky-300/60 hover:text-sky-300 transition-colors"
                >
                  {lens.cta} →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ── PULL QUOTE ── */}
      <MotionSection className="relative border-b border-white/8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/18820283/pexels-photo-18820283/free-photo-of-sunlight-streaming-into-a-dark-room-through-a-lone-window.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070B] via-[#05070B]/40 to-[#05070B]" />
        </div>
        <div className="relative px-6 py-32 text-center">
          <blockquote className="mx-auto max-w-2xl text-2xl font-light italic text-white/70 md:text-3xl leading-relaxed">
            &ldquo;Most of what hurts isn&apos;t the moment itself.<br className="hidden md:block" />
            It&apos;s the way we hold it.&rdquo;
          </blockquote>
        </div>
      </MotionSection>

      {/* ── PRICING ── */}
      <MotionSection className="border-b border-white/8 px-6 py-28" id="pricing">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="Access"
            title="Simple. No surprises."
          />
          <div className="mt-16 grid grid-cols-1 gap-0 md:grid-cols-2">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`p-10 flex flex-col ${
                  tier.highlight
                    ? "border border-white/25 shadow-[0_0_40px_rgba(96,165,250,0.06)]"
                    : "border border-white/8"
                } ${i === 1 ? "md:border-l-0" : ""}`}
              >
                {tier.highlight && (
                  <div className="mb-6 self-start font-mono text-[9px] uppercase tracking-widest text-black bg-white px-2.5 py-1">
                    Recommended
                  </div>
                )}
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-6">{tier.name}</p>
                <div className="mb-2">
                  <span className="text-5xl font-light text-white">{tier.price}</span>
                  <span className="text-white/30 text-sm ml-2">{tier.period}</span>
                </div>
                <p className="text-sm text-white/35 mb-8">{tier.description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/55">
                      <span className="block h-px w-4 bg-white/20 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block px-6 py-3.5 text-center font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    tier.highlight
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ── FAQ ── */}
      <MotionSection className="border-b border-white/8 px-6 py-28" id="faq">
        <div className="mx-auto max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Common questions." />
          <div className="mt-16">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </MotionSection>

      {/* ── FINAL CTA ── */}
      <MotionSection className="px-6 py-40 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="hero-glow mb-6 text-4xl font-semibold tracking-tight text-white md:text-5xl leading-tight">
            Ready to stop holding<br />onto the pain?
          </h2>
          <p className="mb-12 text-white/35 text-base font-light max-w-md mx-auto leading-relaxed">
            No jargon. No stigma. Just the shift you&apos;ve been waiting for.
          </p>
          <Link
            href={`${APP_URL}/login`}
            className="gradient-border inline-block bg-white/8 px-14 py-5 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-white/12 hover:shadow-[0_0_40px_rgba(96,165,250,0.12)]"
          >
            Start Your Shift Today
          </Link>
        </div>
      </MotionSection>

    </SiteShell>
  );
}