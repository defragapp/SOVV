"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface OnboardingModalProps {
  onDismiss: () => void
  hasBaseline: boolean
}

const STEPS = [
  {
    step: 1,
    label: "Baseline Design",
    title: "Your Baseline Design is set.",
    body: "It's the starting map — how you tend to process, respond, connect, and protect. It's private, never shown in outputs, and active beneath every session.",
    cta: "Next",
    href: null,
  },
  {
    step: 2,
    label: "Defrag",
    title: "Start with Defrag.",
    body: "Describe what's happening — a conversation that didn't land, a decision you keep circling, a dynamic that keeps repeating. Defrag shows you what's active beneath it.",
    cta: "Open Defrag",
    href: "/apps/defrag",
  },
  {
    step: 3,
    label: "Invite",
    title: "Invite someone you trust.",
    body: "Sovereign.os can compare your Baseline Designs privately. Invite a partner, family member, or colleague to see what's shaping the dynamic between you.",
    cta: "Got it",
    href: null,
  },
]

const STORAGE_KEY = "sovv_onboarding_dismissed"

export default function OnboardingModal({ onDismiss, hasBaseline }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show once, after baseline is set
    if (!hasBaseline) return
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      // Small delay so the workspace renders first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [hasBaseline])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm border border-white/[0.10] bg-[#0c0a0d] p-8 shadow-2xl"
              style={{ borderRadius: "var(--radius-container)" }}
            >
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                {STEPS.map((s, i) => (
                  <div
                    key={s.step}
                    className={`h-px flex-1 transition-colors duration-300 ${i <= step ? "bg-[#e0743a]/60" : "bg-white/[0.08]"}`}
                  />
                ))}
              </div>

              {/* Label */}
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70 mb-3">
                {current.label}
              </p>

              {/* Title */}
              <h2 className="text-xl text-[#f4efe9] font-light leading-snug mb-3">
                {current.title}
              </h2>

              {/* Body */}
              <p className="text-sm text-[#a8a29a] leading-relaxed mb-8">
                {current.body}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={dismiss}
                  className="text-xs text-[#76716b] hover:text-[#a8a29a] transition-colors"
                >
                  Skip
                </button>

                {current.href ? (
                  <Link
                    href={current.href}
                    onClick={next}
                    className="btn-primary text-sm px-5 py-2"
                  >
                    {current.cta}
                  </Link>
                ) : (
                  <button
                    onClick={next}
                    className="btn-primary text-sm px-5 py-2"
                  >
                    {current.cta}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
