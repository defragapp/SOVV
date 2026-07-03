"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type Stage = "verifying" | "success" | "already" | "error"

export default function VerifyEmailPage() {
  const [stage, setStage] = useState<Stage>("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token") || ""
    if (!token) {
      setStage("error")
      setMessage("No verification token found.")
      return
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json() as Promise<{ success?: boolean; message?: string; error?: string }>)
      .then((data) => {
        if (data.success) {
          if (data.message?.includes("already")) {
            setStage("already")
          } else {
            setStage("success")
          }
          setMessage(data.message ?? "")
        } else {
          setStage("error")
          setMessage(data.error ?? "Verification failed.")
        }
      })
      .catch(() => {
        setStage("error")
        setMessage("Connection failed. Please try again.")
      })
  }, [])

  const content = {
    verifying: {
      title: "Verifying your email…",
      body: "One moment.",
      cta: null,
    },
    success: {
      title: "Email verified.",
      body: "Your space is ready.",
      cta: { label: "Enter your space", href: "/apps/defrag" },
    },
    already: {
      title: "Already verified.",
      body: "Your email is confirmed. Sign in to continue.",
      cta: { label: "Sign In", href: "/app/login" },
    },
    error: {
      title: "Verification failed.",
      body: message || "This link may have expired. Request a new one from your account settings.",
      cta: { label: "Back to sign in", href: "/app/login" },
    },
  }[stage]

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#08070a] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span className="font-mono text-xs tracking-[0.28em] text-[#f4efe9] uppercase font-medium">
              SOVEREIGN.OS
            </span>
          </Link>
        </div>

        <div className="border border-white/[0.08] bg-[#08070a]/80 backdrop-blur-xl p-8 text-center" style={{ borderRadius: "var(--radius-container)" }}>
          {stage === "verifying" && (
            <div className="flex justify-center mb-6">
              <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}

          <h1 className="text-[14px] text-[#f4efe9] mb-3">{content.title}</h1>
          <p className="text-sm text-[#76716b] leading-relaxed mb-6">{content.body}</p>

          {content.cta && (
            <Link
              href={content.cta.href}
              className="inline-block border border-white/[0.15] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#f4efe9] hover:bg-white/[0.04] transition-colors"
              style={{ borderRadius: 10 }}
            >
              {content.cta.label}
            </Link>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link href="/app/login" className="text-sm text-[#76716b] hover:text-[#a8a29a] transition-colors duration-200">
            ← Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}