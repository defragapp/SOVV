"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.16, 1, 0.3, 1] as const

interface InviteModalProps {
  open: boolean
  onClose: () => void
  workspaceSource: "DEFRAG" | "ALIGNMENT" | "COVENANT"
  libraryId?: string
}

type Step = "idle" | "creating" | "ready" | "error"

export function InviteModal({ open, onClose, workspaceSource, libraryId }: InviteModalProps) {
  const [step, setStep] = React.useState<Step>("idle")
  const [inviteUrl, setInviteUrl] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (open) { setStep("idle"); setInviteUrl(""); setCopied(false); setError("") }
  }, [open])

  const createInvite = async () => {
    setStep("creating")
    setError("")
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workspace_source: workspaceSource,
          library_id: libraryId,
          invite_mode: "reflection",
        }),
      })
      const data = await res.json() as any
      if (!res.ok) { setError(data.error || "Failed to create invite"); setStep("error"); return }
      setInviteUrl(data.invite_url)
      setStep("ready")
    } catch {
      setError("Unable to connect. Try again.")
      setStep("error")
    }
  }

  const copyLink = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const emailInvite = () => {
    if (!inviteUrl) return
    const subject = encodeURIComponent("You've been invited into a private Sovereign.os reflection")
    const bodyText = "You've been invited to join a private reflection in Sovereign.os.\n\nOpen the link to choose whether to add your side.\nThe result only generates after you accept.\n\n" + inviteUrl
    const body = encodeURIComponent(bodyText)
    window.open("mailto:?subject=" + subject + "&body=" + body, "_blank")
  }

  const smsInvite = () => {
    if (!inviteUrl) return
    const bodyText = "You've been invited into a private Sovereign.os reflection: " + inviteUrl
    const body = encodeURIComponent(bodyText)
    window.open("sms:?body=" + body, "_blank")
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#08070a]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="border border-white/[0.10] bg-[#0c0a0d] shadow-2xl" style={{ borderRadius: "var(--radius-container)" }}>

              <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8a29a]">Invite privately</p>
                  <button onClick={onClose} className="text-[#4f4b47] hover:text-[#f4efe9] transition-colors p-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-5">

                {step === "idle" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    <p className="text-[14px] text-[#f4efe9] leading-relaxed mb-2">Invite someone into this moment.</p>
                    <p className="text-[13px] text-[#76716b] leading-relaxed mb-3">
                      They'll add their Baseline Design. You'll both see how your patterns interact — not who is right.
                    </p>
                    <p className="text-[11px] text-[#4f4b47] leading-relaxed mb-6">
                      Your raw Baseline Design stays private. The result only generates after they accept.
                    </p>
                    <button
                      onClick={createInvite}
                      className="w-full h-11 bg-[#f4efe9] text-[#08070a] text-[13px] font-medium hover:opacity-90 transition-opacity"
                      style={{ borderRadius: "var(--radius-button)" }}
                    >
                      Create private link
                    </button>
                  </motion.div>
                )}

                {step === "creating" && (
                  <div className="flex items-center justify-center py-8 gap-3">
                    <span className="w-4 h-4 border border-white/[0.15] border-t-white/40 rounded-full animate-spin" />
                    <p className="text-[13px] text-[#4f4b47]">Creating your private link...</p>
                  </div>
                )}

                {step === "ready" && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
                    <p className="text-[12px] text-[#4f4b47] mb-3">Your private link is ready.</p>

                    <div className="border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 mb-4 flex items-center gap-2" style={{ borderRadius: 8 }}>
                      <p className="text-[11px] text-[#76716b] font-mono flex-1 truncate">{inviteUrl}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={copyLink}
                        className="w-full h-10 border border-white/[0.10] text-[13px] text-[#f4efe9] hover:border-white/[0.22] transition-colors"
                        style={{ borderRadius: 8 }}
                      >
                        {copied ? "Copied" : "Copy link"}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={emailInvite}
                          className="h-10 border border-white/[0.08] text-[12px] text-[#76716b] hover:border-white/[0.16] hover:text-[#a8a29a] transition-colors"
                          style={{ borderRadius: 8 }}
                        >
                          Email invite
                        </button>
                        <button
                          onClick={smsInvite}
                          className="h-10 border border-white/[0.08] text-[12px] text-[#76716b] hover:border-white/[0.16] hover:text-[#a8a29a] transition-colors"
                          style={{ borderRadius: 8 }}
                        >
                          SMS invite
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#4f4b47] text-center mt-4 leading-relaxed">
                      Link expires in 7 days &middot; Private by design
                    </p>
                  </motion.div>
                )}

                {step === "error" && (
                  <div className="py-4">
                    <p className="text-[13px] text-[#a8a29a] mb-4">{error}</p>
                    <button onClick={() => setStep("idle")} className="text-[12px] text-[#76716b] hover:text-[#f4efe9] transition-colors">
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}