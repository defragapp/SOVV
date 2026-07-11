"use client"

import { useState } from "react"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const FAQS = [
  {
    q: "What is Baseline Design?",
    a: "Your Baseline Design is a starting map — built from your date, time, and place of birth — that shows how you tend to process, respond, connect, protect, communicate, and return to center. It's private, never shown in outputs, and active beneath every session. It's not a personality test. It's a map.",
  },
  {
    q: "How is this different from journaling or therapy?",
    a: "Journaling captures what happened. Therapy works through why. Sovereign.os shows you what's active in the moment — the pattern, the pressure, the best next move. It's not a replacement for either. It's a different tool for a different purpose: making the moment legible before the old response takes over.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your Baseline Design is never exposed in outputs. Your sessions are stored securely and are only accessible to you. We don't train on your data. You can export or delete your account at any time from Settings.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes full access to the Defrag space — 15 sessions per day, pattern recognition, Best Next Response, and your Baseline Design. Covenant, Alignment, your Library, Audio Overview, and Invite Privately require Pro.",
  },
  {
    q: "What does Pro include?",
    a: "Pro includes everything in Free plus: unlimited sessions, Covenant (faith-context reflection), Alignment (timing and readiness), your full Library, Audio Overview, and Invite Privately. Pro is $20/month or $99/year.",
  },
  {
    q: "What is the 7-day free trial?",
    a: "When you upgrade to Pro, you get 7 days free. No charge until the trial ends. Cancel before the trial ends and you won't be billed. A card is required to start.",
  },
  {
    q: "What is Covenant?",
    a: "Covenant is the faith-context reflection space. It translates the moment into repair, discernment, and a grounded next step — without preaching or spiritual shortcuts. It's for users who want faith connected to the work of understanding what's happening.",
  },
  {
    q: "What is Alignment?",
    a: "Alignment reads the current sky against your Baseline Design to surface what's active in the larger cycle — timing, readiness, and what the moment is asking for. It's not prediction. It's context.",
  },
  {
    q: "What is Invite Privately?",
    a: "Invite Privately lets you share your Baseline Design with someone you trust — a partner, family member, or colleague — and receive a comparison of how your designs interact. It's private, consent-based, and only visible to both parties.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from Settings → Subscription at any time. Your Pro access continues until the end of the billing period. No questions asked.",
  },
]

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`text-[0.9375rem] leading-snug transition-colors duration-200 ${isOpen ? "text-[#f4efe9]" : "text-[#a8a29a] group-hover:text-[#f4efe9]"}`}>
          {q}
        </span>
        <span
          className="shrink-0 w-5 h-5 flex items-center justify-center mt-0.5 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke={isOpen ? "#e0743a" : "#4f4b47"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-[#76716b] text-sm leading-relaxed pb-6 max-w-2xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <SiteShell>

      {/* ── HERO ── */}
      <section className="relative w-full pt-36 pb-20 md:pt-48 md:pb-24 bg-[#08070a] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(224,116,58,0.06) 0%, transparent 60%)" }}
          aria-hidden
        />

        <Container className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#e0743a]/50" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b]">FAQ</span>
          </div>
          <h1 className="font-serif text-[clamp(2.8rem,6vw,5rem)] text-[#f4efe9] leading-[0.97] tracking-[-0.03em] text-balance mb-6">
            Questions.
          </h1>
          <p className="text-[#76716b] text-base leading-relaxed max-w-md">
            If something isn't answered here, reach us at{" "}
            <a href="mailto:info@defrag.app" className="text-[#a8a29a] hover:text-[#f4efe9] transition-colors">
              info@defrag.app
            </a>
          </p>
        </Container>
      </section>

      {/* ── FAQ LIST ── */}
      <section className="w-full py-12 md:py-16 bg-[#08070a]">
        <Container className="max-w-3xl">
          <div className="border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
            <div className="px-8">
              {FAQS.map((item, i) => (
                <FAQItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  isOpen={open === i}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="w-full py-24 md:py-32 bg-[#0c0a0d] border-t border-white/[0.04] text-center">
        <Container className="max-w-xl">
          <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-[#f4efe9] tracking-[-0.02em] leading-tight mb-4 text-balance">
            Still have questions?
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-8">
            We respond to every message.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
            <Link href="/app/login" className="btn-primary">
              Start free
            </Link>
          </div>
        </Container>
      </section>

    </SiteShell>
  )
}
