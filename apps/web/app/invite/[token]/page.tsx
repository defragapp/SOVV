"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

const ease = [0.16, 1, 0.3, 1] as const

interface InviteData {
  token: string
  status: string
  invited_by: string
  requires_auth: boolean
  requires_baseline: boolean
  created_at: string
}

interface InviteResult {
  reflection?: string
  pattern?: string
  nextStep?: string
  invitation?: string
  needs_baseline?: boolean
}

type Step = "preview" | "accepting" | "accepted" | "result" | "needs_baseline" | "error"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invite, setInvite] = React.useState<InviteData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [step, setStep] = React.useState<Step>("preview")
  const [result, setResult] = React.useState<InviteResult | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    fetch("/api/invite/" + token)
      .then(r => r.ok ? r.json() : null)
      .then((d: InviteData | null) => {
        if (d) setInvite(d)
        else setError("This invite link is invalid or has expired.")
      })
      .catch(() => setError("Unable to load invite."))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    setStep("accepting")
    try {
      const res = await fetch("/api/invite/" + token + "/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ consent: true }),
      })
      const data = await res.json() as any

      if (res.status === 401) {
        router.push("/app/login?return=/invite/" + token)
        return
      }
      if (data.needs_baseline) { setStep("needs_baseline"); return }
      if (data.accepted) { setStep("accepted"); generateResult() }
      else { setError(data.error || "Failed to accept invite"); setStep("error") }
    } catch {
      setError("Unable to connect. Try again.")
      setStep("preview")
    }
  }

  const generateResult = async () => {
    try {
      const res = await fetch("/api/invite/" + token + "/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      })
      const data = await res.json() as InviteResult
      if (data.needs_baseline) { setStep("needs_baseline"); return }
      setResult(data)
      setStep("result")
    } catch {
      setError("Unable to generate result.")
      setStep("error")
    }
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      const title = "Invite reflection - " + new Date().toLocaleDateString()
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          content: result.reflection || result.pattern || "",
          payload: result,
          workspace_source: "DEFRAG",
        }),
      })
      if (res.ok) setSaved(true)
    } catch {} finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#08070a] text-[#f4efe9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <Link href="/" className="font-mono text-xs tracking-[0.28em] text-[#f4efe9] uppercase font-medium">
            SOVEREIGN.OS
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <span className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}

        {!loading && (error || step === "error") && (
          <div className="text-center">
            <p className="text-[14px] text-[#a8a29a] leading-relaxed mb-6">{error || "Something went wrong."}</p>
            <Link href="/" className="text-[12px] text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Back to Sovereign.os
            </Link>
          </div>
        )}

        {!loading && invite && step === "preview" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="border border-white/[0.08] bg-[#0c0a0d] p-8" style={{ borderRadius: "var(--radius-container)" }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">Private invitation</p>
              <h1 className="font-serif text-2xl text-[#f4efe9] leading-tight mb-4">
                You've been invited into a private Sovereign.os reflection.
              </h1>
              <p className="text-[13px] text-[#76716b] leading-relaxed mb-6">
                Accept the invite to add your side. The result only generates after you choose to continue.
              </p>
              <p className="text-[11px] text-[#76716b] leading-relaxed mb-8">
                Invited by {invite.invited_by} &middot; Your raw Baseline Design and private details stay hidden.
              </p>
              <button
                onClick={handleAccept}
                className="w-full h-11 bg-[#f4efe9] text-[#08070a] text-[13px] font-medium hover:opacity-90 transition-opacity"
                style={{ borderRadius: 10 }}
              >
                Accept invite
              </button>
              <p className="text-center text-[10px] text-[#4f4b47] mt-4">
                You'll need to sign in and set your Baseline Design to continue.
              </p>
            </div>
          </motion.div>
        )}

        {step === "accepting" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <span className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            <p className="text-[13px] text-[#4f4b47]">Accepting invite...</p>
          </div>
        )}

        {step === "needs_baseline" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="border border-white/[0.08] bg-[#0c0a0d] p-8" style={{ borderRadius: "var(--radius-container)" }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">One more step</p>
              <h2 className="font-serif text-xl text-[#f4efe9] mb-3">Set your Baseline Design first.</h2>
              <p className="text-[13px] text-[#76716b] leading-relaxed mb-6">
                Your Baseline Design is needed to generate the reflection. It takes about 30 seconds and stays private.
              </p>
              <Link
                href={"/settings?return=/invite/" + token}
                className="flex items-center justify-center w-full h-11 bg-[#f4efe9] text-[#08070a] text-[13px] font-medium hover:opacity-90 transition-opacity"
                style={{ borderRadius: 10 }}
              >
                Set Baseline Design
              </Link>
            </div>
          </motion.div>
        )}

        {step === "accepted" && !result && (
          <div className="flex flex-col items-center gap-4 py-12">
            <span className="w-5 h-5 border border-white/20 border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-[13px] text-[#4f4b47]">Generating your reflection...</p>
          </div>
        )}

        {step === "result" && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="border border-white/[0.08] bg-[#0c0a0d] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
              <div className="px-6 py-5 border-b border-white/[0.06]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Your reflection</p>
              </div>
              <div className="px-6 py-6 flex flex-col gap-5">
                {result.reflection && (
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e0743a]/50 mb-2">What this moment is asking</p>
                    <p className="text-[14px] text-[#f4efe9] leading-[1.7]">{result.reflection}</p>
                  </div>
                )}
                {result.pattern && (
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">What's active</p>
                    <p className="text-[13px] text-[#a8a29a] leading-[1.65]">{result.pattern}</p>
                  </div>
                )}
                {result.nextStep && (
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">One next step</p>
                    <p className="text-[14px] text-[#f4efe9] leading-[1.65]">{result.nextStep}</p>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="w-full h-10 border border-white/[0.10] text-[12px] text-[#f4efe9] hover:border-white/[0.22] transition-colors disabled:opacity-40"
                  style={{ borderRadius: 8 }}
                >
                  {saving ? "Saving..." : saved ? "Saved to Library" : "Save to Sovereign"}
                </button>
                <Link
                  href="/apps/defrag"
                  className="flex items-center justify-center w-full h-10 text-[12px] text-[#76716b] hover:text-[#f4efe9] transition-colors"
                >
                  Invite someone else privately
                </Link>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}