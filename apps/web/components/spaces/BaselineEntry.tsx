"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiSaveBaseline } from "@/lib/api"

// Birth time knowledge modes — ask what the user knows, not what they can guess
type TimeMode = "exact" | "approximate" | "window" | "unknown"
type DayWindow = "early_morning" | "morning" | "noon" | "afternoon" | "evening" | "night"
type Stage = "form" | "loading" | "success" | "error"

const ease = [0.16, 1, 0.3, 1] as const

// Map day windows to approximate times for the compiler
const WINDOW_TIMES: Record<DayWindow, { time: string; uncertaintyMinutes: number }> = {
  early_morning: { time: "05:00", uncertaintyMinutes: 120 },
  morning:       { time: "09:00", uncertaintyMinutes: 180 },
  noon:          { time: "12:00", uncertaintyMinutes: 90 },
  afternoon:     { time: "15:00", uncertaintyMinutes: 180 },
  evening:       { time: "19:00", uncertaintyMinutes: 120 },
  night:         { time: "22:00", uncertaintyMinutes: 120 },
}

const WINDOW_LABELS: Record<DayWindow, string> = {
  early_morning: "Early morning",
  morning:       "Morning",
  noon:          "Around noon",
  afternoon:     "Afternoon",
  evening:       "Evening",
  night:         "Night",
}

export default function BaselineEntry({ onComplete }: { onComplete: () => void }) {
  const [dob, setDob] = useState("")
  const [tob, setTob] = useState("")
  const [tobApprox, setTobApprox] = useState("")
  const [approxRange, setApproxRange] = useState<"15" | "30" | "60" | "unsure">("30")
  const [dayWindow, setDayWindow] = useState<DayWindow>("morning")
  const [timeMode, setTimeMode] = useState<TimeMode | null>(null)
  const [pob, setPob] = useState("")
  const [stage, setStage] = useState<Stage>("form")
  const [errorMsg, setErrorMsg] = useState("")

  const canSubmit = dob && pob && timeMode !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setStage("loading")

    // Build the tob value and type based on what the user knows
    let tobValue = "12:00"
    let tobType: "exact" | "approx" = "approx"

    if (timeMode === "exact" && tob) {
      tobValue = tob
      tobType = "exact"
    } else if (timeMode === "approximate" && tobApprox) {
      tobValue = tobApprox
      tobType = "approx"
    } else if (timeMode === "window") {
      tobValue = WINDOW_TIMES[dayWindow].time
      tobType = "approx"
    } else {
      // unknown — use noon as neutral midpoint, marked approx
      tobValue = "12:00"
      tobType = "approx"
    }

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
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#08070a] text-[#f4efe9]">

      {/* Background image */}
      <Image
        src="/hero-light.png"
        alt="Warm light"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-50"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#08070a] via-[#08070a]/80 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08070a] via-transparent to-[#08070a]/40" />

      <div className="relative z-10 flex w-full items-center justify-center px-6 py-12 safe-bottom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="w-full max-w-md"
        >

          {/* Wordmark */}
          <div className="mb-8 text-center">
            <span className="font-mono text-xs tracking-[0.3em] text-[#f4efe9] uppercase font-medium">
              SOVEREIGN.OS
            </span>
          </div>

          {/* Glass panel */}
          <div className="border border-white/[0.08] bg-[#08070a]/80 backdrop-blur-xl p-8" style={{ borderRadius: 20 }}>

            <AnimatePresence mode="wait">

              {/* Loading */}
              {stage === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 py-12"
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
                  className="flex flex-col items-center gap-4 py-12 text-center"
                >
                  <div
                    className="w-10 h-10 border border-[#e0743a]/30 bg-[#e0743a]/10 flex items-center justify-center"
                    style={{ borderRadius: 10 }}
                  >
                    <span className="text-[#f0a06a] text-lg">✓</span>
                  </div>
                  <p className="font-serif text-xl text-[#f4efe9]">Your Baseline Design is ready.</p>
                  <p className="text-sm text-[#76716b] leading-relaxed max-w-xs">
                    Your space can now keep every thread grounded.
                  </p>
                </motion.div>
              )}

              {/* Form */}
              {(stage === "form" || stage === "error") && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  <div className="mb-8 text-center">
                    <h1 className="font-serif text-2xl text-[#f4efe9] mb-3">Set your Baseline Design.</h1>
                    <p className="text-sm text-[#a8a29a] leading-relaxed max-w-sm mx-auto">
                      The starting map — how you tend to process, respond, connect, protect, communicate, and return to center. Private, never exposed in outputs.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Date of birth */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">Date of birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                        style={{ borderRadius: 12, fontSize: "16px" }}
                      />
                    </div>

                    {/* Time of birth — ask what they know */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">Time of birth</label>
                      <p className="text-sm text-[#76716b]">How much do you know?</p>

                      <div className="flex flex-col gap-2">
                        {([
                          { mode: "exact" as TimeMode,       label: "I know the exact time" },
                          { mode: "approximate" as TimeMode, label: "I know roughly when" },
                          { mode: "window" as TimeMode,      label: "I only know the part of day" },
                          { mode: "unknown" as TimeMode,     label: "I don't know" },
                        ]).map(({ mode, label }) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setTimeMode(mode)}
                            className={`flex items-center gap-3 px-4 py-3 border text-left text-sm transition-all duration-200 ${
                              timeMode === mode
                                ? "border-[#f4efe9]/30 bg-white/[0.05] text-[#f4efe9]"
                                : "border-white/[0.08] text-[#76716b] hover:border-white/[0.16] hover:text-[#a8a29a]"
                            }`}
                            style={{ borderRadius: 10 }}
                          >
                            <span
                              className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-colors ${
                                timeMode === mode ? "border-[#f4efe9]/60 bg-[#f4efe9]/10" : "border-white/[0.2]"
                              }`}
                              style={{ borderRadius: "50%" }}
                            >
                              {timeMode === mode && (
                                <span className="w-1.5 h-1.5 bg-[#f4efe9]" style={{ borderRadius: "50%" }} />
                              )}
                            </span>
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Conditional fields based on selection */}
                      <AnimatePresence mode="wait">

                        {/* Exact time */}
                        {timeMode === "exact" && (
                          <motion.div
                            key="exact"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25, ease }}
                            className="flex flex-col gap-2"
                          >
                            <input
                              type="time"
                              value={tob}
                              onChange={(e) => setTob(e.target.value)}
                              required
                              className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                              style={{ borderRadius: 12, fontSize: "16px" }}
                            />
                          </motion.div>
                        )}

                        {/* Approximate time */}
                        {timeMode === "approximate" && (
                          <motion.div
                            key="approximate"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25, ease }}
                            className="flex flex-col gap-3"
                          >
                            <input
                              type="time"
                              value={tobApprox}
                              onChange={(e) => setTobApprox(e.target.value)}
                              placeholder="About what time?"
                              className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                              style={{ borderRadius: 12, fontSize: "16px" }}
                            />
                            <div>
                              <p className="text-xs text-[#4f4b47] mb-2">How close is that?</p>
                              <div className="grid grid-cols-2 gap-2">
                                {([
                                  { val: "15" as const,     label: "Within 15 min" },
                                  { val: "30" as const,     label: "Within 30 min" },
                                  { val: "60" as const,     label: "Within 1 hour" },
                                  { val: "unsure" as const, label: "Not sure" },
                                ]).map(({ val, label }) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setApproxRange(val)}
                                    className={`px-3 py-2 border text-xs text-left transition-all duration-200 ${
                                      approxRange === val
                                        ? "border-[#f4efe9]/30 bg-white/[0.05] text-[#f4efe9]"
                                        : "border-white/[0.08] text-[#76716b] hover:text-[#a8a29a]"
                                    }`}
                                    style={{ borderRadius: 8 }}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Part of day */}
                        {timeMode === "window" && (
                          <motion.div
                            key="window"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25, ease }}
                            className="grid grid-cols-2 gap-2"
                          >
                            {(Object.entries(WINDOW_LABELS) as [DayWindow, string][]).map(([w, label]) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => setDayWindow(w)}
                                className={`px-3 py-2.5 border text-sm text-left transition-all duration-200 ${
                                  dayWindow === w
                                    ? "border-[#f4efe9]/30 bg-white/[0.05] text-[#f4efe9]"
                                    : "border-white/[0.08] text-[#76716b] hover:text-[#a8a29a]"
                                }`}
                                style={{ borderRadius: 8 }}
                              >
                                {label}
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {/* Unknown */}
                        {timeMode === "unknown" && (
                          <motion.div
                            key="unknown"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25, ease }}
                          >
                            <p className="text-sm text-[#76716b] leading-relaxed">
                              The system will hold this lightly. Some time-sensitive details will be kept approximate — everything else will still be grounded in what is available.
                            </p>
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>

                    {/* Place of birth */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono uppercase tracking-[0.15em] text-[#76716b]">Place of birth</label>
                      <input
                        type="text"
                        value={pob}
                        onChange={(e) => setPob(e.target.value)}
                        required
                        placeholder="City, Country"
                        className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07]"
                        style={{ borderRadius: 12, fontSize: "16px" }}
                      />
                    </div>

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

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="mt-2 w-full h-12 bg-[#f4efe9] text-[#08070a] text-sm font-medium tracking-tight transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderRadius: 12 }}
                    >
                      Set Baseline Design
                    </button>

                  </form>

                  <p className="mt-6 text-center text-sm text-[#76716b]">
                    If you don't know the exact time, choose what you know.
                    The system will hold uncertain details lightly.
                  </p>

                  <p className="mt-2 text-center text-xs text-[#4f4b47]">
                    Private by design · Birth details are never shared or exposed in outputs.
                  </p>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </div>
  )
}