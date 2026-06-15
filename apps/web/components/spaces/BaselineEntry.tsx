"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiSaveBaseline } from "@/lib/api"

type Precision = "exact" | "approximate" | "unknown"
type Stage = "form" | "loading" | "success" | "error"

export default function BaselineEntry({ onComplete }: { onComplete: () => void }) {
  const [dob, setDob] = useState("")
  const [tob, setTob] = useState("")
  const [pob, setPob] = useState("")
  const [precision, setPrecision] = useState<Precision>("exact")
  const [stage, setStage] = useState<Stage>("form")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dob || !pob) return
    if (precision !== "unknown" && !tob) return

    setStage("loading")

    const tobValue = precision === "unknown" ? "12:00" : tob
    const tobType = precision === "exact" ? "exact" : "approx"

    try {
      const result = await apiSaveBaseline({
        dob,
        tob: { type: tobType, value: tobValue },
        pob,
      })

      if (!result.baseline) {
        setErrorMsg("Something went wrong. Check your details and try again.")
        setStage("error")
        return
      }

      setStage("success")
      setTimeout(() => onComplete(), 1800)
    } catch {
      setErrorMsg("Connection failed. Try again.")
      setStage("error")
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#08070a] text-[#f4efe9] relative overflow-hidden">

      {/* Warm ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(224,116,58,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        <AnimatePresence mode="wait">

          {/* Loading */}
          {stage === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-20"
            >
              <span className="w-5 h-5 border border-white/20 border-t-[#f4efe9]/60 rounded-full animate-spin" />
              <p className="text-sm text-[#76716b]">Setting your Baseline Design…</p>
            </motion.div>
          )}

          {/* Success */}
          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div className="w-10 h-10 rounded-full border border-[#e0743a]/30 bg-[#e0743a]/10 flex items-center justify-center">
                <span className="text-[#f0a06a] text-lg">✓</span>
              </div>
              <p className="font-serif text-xl text-[#f4efe9]">
                Your Baseline Design is ready.
              </p>
              <p className="text-sm text-[#76716b] leading-relaxed max-w-xs">
                Your space can now keep every thread grounded.
              </p>
            </motion.div>
          )}

          {/* Form */}
          {(stage === "form" || stage === "error") && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Header */}
              <div className="mb-10 text-center">
                <span className="font-mono text-xs tracking-[0.3em] text-[#f4efe9] uppercase font-medium">
                  SOVEREIGN.OS
                </span>
                <div className="h-px w-full bg-white/[0.06] mt-4 mb-8" />
                <h1 className="font-serif text-2xl text-[#f4efe9] mb-3">
                  Set your Baseline Design.
                </h1>
                <p className="text-sm text-[#a8a29a] leading-relaxed max-w-sm mx-auto">
                  Your Baseline Design is the starting map — how you tend to process, respond, connect, protect, communicate, and return to center. It is private and never exposed in outputs.
                </p>
                <p className="mt-3 text-sm text-[#76716b]">
                  Enter your date, time, and place of birth to begin.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Date of birth */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                    style={{ fontSize: "16px" }}
                  />
                </div>

                {/* Time of birth */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">
                    Time of birth
                  </label>
                  <div className="flex gap-2 mb-2">
                    {(["exact", "approximate", "unknown"] as Precision[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrecision(p)}
                        className={`flex-1 rounded-lg border py-2.5 text-xs font-mono uppercase tracking-wide transition-colors duration-200 ${
                          precision === p
                            ? "border-[#f4efe9]/40 text-[#f4efe9] bg-white/[0.05]"
                            : "border-white/[0.08] text-[#76716b] hover:text-[#a8a29a]"
                        }`}
                      >
                        {p === "exact" ? "Exact" : p === "approximate" ? "Approx" : "Unknown"}
                      </button>
                    ))}
                  </div>

                  {precision !== "unknown" && (
                    <input
                      type="time"
                      value={tob}
                      onChange={(e) => setTob(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                      style={{ fontSize: "16px" }}
                    />
                  )}

                  {precision === "unknown" && (
                    <p className="text-sm text-[#76716b] leading-relaxed">
                      If the exact time is unknown, we will mark the Baseline Design as partial and keep the thread grounded in what is available.
                    </p>
                  )}
                </div>

                {/* Place of birth */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">
                    Place of birth
                  </label>
                  <input
                    type="text"
                    value={pob}
                    onChange={(e) => setPob(e.target.value)}
                    required
                    placeholder="City, Country"
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07]"
                    style={{ fontSize: "16px" }}
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {stage === "error" && errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400/80 leading-relaxed"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!dob || !pob || (precision !== "unknown" && !tob)}
                  className="mt-2 w-full h-12 rounded-full bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Set Baseline Design
                </button>

              </form>

              {/* Privacy note */}
              <p className="mt-8 text-center text-sm text-[#76716b]">
                Private by design · Birth details are never shared or exposed in outputs.
              </p>

            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}