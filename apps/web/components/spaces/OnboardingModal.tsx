"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface OnboardingModalProps {
  onDismiss: () => void
  hasBaseline: boolean
}

interface OnboardingStep {
  step: number
  label: string
  title: string
  body: string
  signal: string
  details: string[]
}

const STORAGE_KEY = "sovv_onboarding_completed_v1"
const LEGACY_STORAGE_KEY = "sovv_onboarding_dismissed"
const FIRST_DEFRAG_PROMPT = "Tell me about something I am carrying right now."
const FIRST_DEFRAG_HREF = `/apps/defrag/workspace?prompt=${encodeURIComponent(FIRST_DEFRAG_PROMPT)}`
const ease = [0.16, 1, 0.3, 1] as const

const STEPS: OnboardingStep[] = [
  {
    step: 1,
    label: "Baseline Active",
    title: "Your Baseline Design is now underneath the system.",
    body: "Sovereign can now read the question through your private context: how pressure lands, where you loop, and what helps you return to center.",
    signal: "Private context layer online",
    details: ["Birth details stay private", "Raw systems are never exposed", "Every space can now ground its response"],
  },
  {
    step: 2,
    label: "Start With Defrag",
    title: "Bring the real moment, exactly as it happened.",
    body: "Start with the text, the silence, the argument, the choice, or the pattern you keep circling. Defrag turns the moment into a clear map of what is active.",
    signal: "Best first move",
    details: ["Name what happened", "Include what you felt", "Let the system find the pattern beneath it"],
  },
  {
    step: 3,
    label: "Save Clarity",
    title: "Your Library becomes the record of what helped.",
    body: "Save the results worth returning to. Over time, Sovereign can help you notice the patterns that repeat across conversations, decisions, and relationships.",
    signal: "Continuity builds signal",
    details: ["Save useful outputs", "Return before reacting", "Track recurring patterns over time"],
  },
  {
    step: 4,
    label: "Go Deeper",
    title: "Alignment and Covenant open when the stakes are higher.",
    body: "Defrag is free to start. Pro spaces extend the same context into relational vectors, values-based reflection, and clearer boundaries when the moment needs more than a quick answer.",
    signal: "Pro spaces available when ready",
    details: ["Alignment for relational vectors", "Covenant for values and boundaries", "Settings and billing stay under your control"],
  },
]

export default function OnboardingModal({ onDismiss, hasBaseline }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasBaseline) return

    const completed = localStorage.getItem(STORAGE_KEY)
    const legacyDismissed = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (completed || legacyDismissed) return

    const timer = window.setTimeout(() => setVisible(true), 700)
    return () => window.clearTimeout(timer)
  }, [hasBaseline])

  function complete() {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
    window.setTimeout(onDismiss, 260)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(currentStep => currentStep + 1)
      return
    }

    complete()
  }

  const current = STEPS[step]
  const isFinalStep = step === STEPS.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.button
            type="button"
            aria-label="Skip onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease }}
            className="fixed inset-0 z-50 cursor-default bg-black/55 backdrop-blur-md"
            onClick={complete}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-body"
            initial={{ opacity: 0, y: 26, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.42, ease }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-full max-w-xl overflow-hidden border border-white/[0.10] bg-[#0c0a0d]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
              style={{ borderRadius: "var(--radius-container)" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e0743a]/60 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#e0743a]/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl"
              />

              <div className="relative">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#e0743a]/70">
                      First run - {current.label}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
                      Step {current.step} of {STEPS.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={complete}
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4f4b47] transition-colors hover:text-[#a8a29a]"
                  >
                    Skip
                  </button>
                </div>

                <div className="mb-8 grid grid-cols-4 gap-2" aria-hidden>
                  {STEPS.map((item, index) => (
                    <div key={item.step} className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/[0.08]">
                        <motion.div
                          initial={false}
                          animate={{ width: index <= step ? "100%" : "0%" }}
                          transition={{ duration: 0.28, ease }}
                          className="h-px bg-[#e0743a]/70"
                        />
                      </div>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                          index <= step ? "bg-[#e0743a]/80" : "bg-white/[0.12]"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <div className="mb-5 inline-flex items-center gap-2 border border-[#e0743a]/20 bg-[#e0743a]/[0.05] px-3 py-1.5" style={{ borderRadius: 999 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e0743a]/70" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70">
                        {current.signal}
                      </span>
                    </div>

                    <h2 id="onboarding-title" className="max-w-md font-serif text-2xl leading-tight tracking-[-0.02em] text-[#f4efe9] sm:text-3xl">
                      {current.title}
                    </h2>
                    <p id="onboarding-body" className="mt-4 max-w-md text-sm leading-relaxed text-[#a8a29a]">
                      {current.body}
                    </p>

                    <div className="mt-7 grid gap-2 sm:grid-cols-3">
                      {current.details.map(detail => (
                        <div
                          key={detail}
                          className="border border-white/[0.07] bg-white/[0.03] px-3 py-3"
                          style={{ borderRadius: "var(--radius-container)" }}
                        >
                          <p className="text-[12px] leading-snug text-[#76716b]">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-9 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/settings"
                      onClick={complete}
                      className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] transition-colors hover:text-[#a8a29a]"
                    >
                      Settings
                    </Link>
                    <span className="h-1 w-1 rounded-full bg-white/[0.12]" aria-hidden />
                    <Link
                      href="/pricing"
                      onClick={complete}
                      className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] transition-colors hover:text-[#a8a29a]"
                    >
                      Pricing
                    </Link>
                  </div>

                  {isFinalStep ? (
                    <Link
                      href={FIRST_DEFRAG_HREF}
                      onClick={complete}
                      className="inline-flex h-10 items-center justify-center bg-[#f4efe9] px-5 text-sm font-medium text-[#08070a] transition-opacity hover:opacity-90"
                      style={{ borderRadius: "var(--radius-button)" }}
                    >
                      Start first Defrag
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={next}
                      className="inline-flex h-10 items-center justify-center bg-[#f4efe9] px-5 text-sm font-medium text-[#08070a] transition-opacity hover:opacity-90"
                      style={{ borderRadius: "var(--radius-button)" }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
