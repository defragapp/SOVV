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
    if (precision !== ("unknown" as any) && !tob) return

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
    <div
      className="flex min-h-screen w-full items-center justify-center bg-background text-[#F6F5F3]"
      style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.0, 0.0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <AnimatePresence mode="wait">

          {/* Loading */}
          {stage === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-16"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="font-sans font-medium text-xs uppercase tracking-widest text-white/40"
              >
                Building your Baseline Design...
              </motion.span>
            </motion.div>
          )}

          {/* Success */}
          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <p className="font-sans font-medium text-xs uppercase tracking-widest text-white/60">
                Your Baseline Design is ready.
              </p>
              <p className="text-sm font-light text-white/40">
                Now your space can keep the thread grounded.
              </p>
            </motion.div>
          )}

          {/* Form */}
          {(stage === "form" || stage === "error") && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Header */}
              <div className="mb-10 text-center">
                <p className="font-sans font-medium text-[10px] uppercase tracking-[0.4em] text-white/20 mb-3">
                  Sovereign OS
                </p>
                <div className="h-px w-full bg-[#F6F5F3]/10 mb-8" />
                <h1 className="text-lg font-light text-[#F6F5F3] mb-3">
                  Start Your Baseline Design
                </h1>
                <p className="text-sm font-light leading-6 text-white/40">
                  Your Baseline Design is the starting map. It helps your space understand how you tend
                  to process, respond, connect, protect, communicate, and return to center.
                </p>
                <p className="mt-3 text-sm font-light text-white/30">
                  Enter your date, time, and place of birth to begin.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Date of birth */}
                <div>
                  <label className="mb-1.5 block font-sans font-medium text-[9px] uppercase tracking-[0.3em] text-white/25">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full border border-[#F6F5F3]/10 bg-transparent px-4 py-3 text-sm font-light text-[#F6F5F3] focus:border-[#F6F5F3]/30 focus:outline-none transition-colors duration-200"
                  />
                </div>

                {/* Time precision */}
                <div>
                  <label className="mb-2 block font-sans font-medium text-[9px] uppercase tracking-[0.3em] text-white/25">
                    Birth time
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(["exact", "approximate", "unknown"] as Precision[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrecision(p)}
                        className={`flex-1 border py-2 font-sans font-medium text-[9px] uppercase tracking-widest transition-colors duration-200 ${
                          precision === p
                            ? "border-[#F6F5F3]/40 text-[#F6F5F3]"
                            : "border-[#F6F5F3]/10 text-white/25 hover:text-white/50"
                        }`}
                      >
                        {p === "exact" ? "Exact" : p === "approximate" ? "Approx" : "Unknown"}
                      </button>
                    ))}
                  </div>

                  {precision !== ("unknown" as any) && (
                    <input
                      type="time"
                      value={tob}
                      onChange={(e) => setTob(e.target.value)}
                      required={precision !== ("unknown" as any)}
                      className="w-full border border-[#F6F5F3]/10 bg-transparent px-4 py-3 text-sm font-light text-[#F6F5F3] focus:border-[#F6F5F3]/30 focus:outline-none transition-colors duration-200"
                    />
                  )}

                  {precision === "unknown" && (
                    <p className="text-sm font-light leading-6 text-white/30">
                      Not sure of the exact time? That&apos;s okay. We&apos;ll mark the Baseline Design as
                      partial and keep the thread grounded in what we can verify.
                    </p>
                  )}
                </div>

                {/* Place of birth */}
                <div>
                  <label className="mb-1.5 block font-sans font-medium text-[9px] uppercase tracking-[0.3em] text-white/25">
                    Place of birth
                  </label>
                  <input
                    type="text"
                    value={pob}
                    onChange={(e) => setPob(e.target.value)}
                    required
                    placeholder="City, Country"
                    className="w-full border border-[#F6F5F3]/10 bg-transparent px-4 py-3 text-sm font-light text-[#F6F5F3] placeholder-white/15 focus:border-[#F6F5F3]/30 focus:outline-none transition-colors duration-200"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {stage === "error" && errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="font-sans font-medium text-[9px] uppercase tracking-widest text-red-400/70"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={
                    !dob ||
                    !pob ||
                    (precision !== ("unknown" as any) && !tob)
                  }
                  whileHover={{ backgroundColor: "rgba(246,245,243,0.08)" }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 border border-[#F6F5F3]/20 px-4 py-3.5 font-sans font-medium text-[10px] uppercase tracking-widest text-[#F6F5F3] transition-colors duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  Set Baseline Design
                </motion.button>

              </form>

              {/* Privacy note */}
              <p className="mt-8 text-center font-sans font-medium text-[9px] uppercase tracking-widest text-white/15">
                Private by design · Birth details are never shared
              </p>

            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  )
}