"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiSaveBaseline } from "@/lib/api"

type TimeMode = "exact" | "approximate" | "window" | "unknown"
type DayWindow = "early_morning" | "morning" | "noon" | "afternoon" | "evening" | "night"
type ApproxRange = "15" | "30" | "60" | "unsure"
type Stage = "form" | "loading" | "success" | "error"
type StepId = "welcome" | "birthDate" | "birthTime" | "birthPlace" | "review"

interface BaselineDraft {
  dob: string
  tob: string
  tobApprox: string
  approxRange: ApproxRange
  dayWindow: DayWindow
  timeMode: TimeMode | null
  pob: string
  step: StepId
}

interface WizardStep {
  id: StepId
  eyebrow: string
  title: string
  body: string
}

const STORAGE_KEY = "sovv_baseline_draft_v1"
const ease = [0.16, 1, 0.3, 1] as const

const WINDOW_TIMES: Record<DayWindow, { time: string; uncertaintyMinutes: number }> = {
  early_morning: { time: "05:00", uncertaintyMinutes: 120 },
  morning: { time: "09:00", uncertaintyMinutes: 180 },
  noon: { time: "12:00", uncertaintyMinutes: 90 },
  afternoon: { time: "15:00", uncertaintyMinutes: 180 },
  evening: { time: "19:00", uncertaintyMinutes: 120 },
  night: { time: "22:00", uncertaintyMinutes: 120 },
}

const WINDOW_LABELS: Record<DayWindow, string> = {
  early_morning: "Early morning",
  morning: "Morning",
  noon: "Around noon",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
}

const STEPS: WizardStep[] = [
  {
    id: "welcome",
    eyebrow: "Baseline Design",
    title: "Start with the map underneath the moment.",
    body: "Your Baseline Design gives Sovereign the private context it needs before Defrag, Alignment, or Covenant reads anything personal.",
  },
  {
    id: "birthDate",
    eyebrow: "Birth date",
    title: "First, anchor the day you arrived.",
    body: "This becomes the stable reference point for the pattern layer. It is private and never exposed in outputs.",
  },
  {
    id: "birthTime",
    eyebrow: "Birth time",
    title: "Use what you know. Do not guess.",
    body: "Exact time helps. A rough window still works. Unknown is acceptable; the system will hold time-sensitive details lightly.",
  },
  {
    id: "birthPlace",
    eyebrow: "Birth place",
    title: "Add the place your chart begins from.",
    body: "City and country are enough for now. Keep it simple and accurate.",
  },
  {
    id: "review",
    eyebrow: "Review",
    title: "Confirm the details before the system builds.",
    body: "You can step back and edit anything before saving your Baseline Design.",
  },
]

const DEFAULT_DRAFT: BaselineDraft = {
  dob: "",
  tob: "",
  tobApprox: "",
  approxRange: "30",
  dayWindow: "morning",
  timeMode: null,
  pob: "",
  step: "welcome",
}

const LOADING_MESSAGES = [
  "Validating your birth details",
  "Building your Baseline Design",
  "Preparing your first Defrag workspace",
]

function getStoredDraft(): BaselineDraft | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<BaselineDraft>

    return {
      ...DEFAULT_DRAFT,
      ...parsed,
      approxRange: parsed.approxRange ?? DEFAULT_DRAFT.approxRange,
      dayWindow: parsed.dayWindow ?? DEFAULT_DRAFT.dayWindow,
      timeMode: parsed.timeMode ?? DEFAULT_DRAFT.timeMode,
      step: parsed.step ?? DEFAULT_DRAFT.step,
    }
  } catch {
    return null
  }
}

function getTimeSummary(draft: BaselineDraft) {
  if (draft.timeMode === "exact" && draft.tob) return `Exact time: ${draft.tob}`
  if (draft.timeMode === "approximate" && draft.tobApprox) return `Approximate time: ${draft.tobApprox}`
  if (draft.timeMode === "window") return `Part of day: ${WINDOW_LABELS[draft.dayWindow]}`
  if (draft.timeMode === "unknown") return "Unknown birth time"
  return "Not set"
}

function ProgressRail({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
          Step {currentIndex + 1} of {STEPS.length}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">
          Autosaved
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2" aria-hidden>
        {STEPS.map((item, index) => (
          <div key={item.id} className="h-px bg-white/[0.08]">
            <motion.div
              initial={false}
              animate={{ width: index <= currentIndex ? "100%" : "0%" }}
              transition={{ duration: 0.28, ease }}
              className="h-px bg-[#e0743a]/70"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-4 last:border-0">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#4f4b47]">{label}</p>
        <p className="mt-1 text-sm text-[#f4efe9]">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] transition-colors hover:text-[#f4efe9]"
      >
        Edit
      </button>
    </div>
  )
}

export default function BaselineEntry({ onComplete }: { onComplete: () => void }) {
  const [draft, setDraft] = useState<BaselineDraft>(DEFAULT_DRAFT)
  const [hydrated, setHydrated] = useState(false)
  const [stage, setStage] = useState<Stage>("form")
  const [errorMsg, setErrorMsg] = useState("")
  const [loadingIndex, setLoadingIndex] = useState(0)

  const currentIndex = Math.max(0, STEPS.findIndex(step => step.id === draft.step))
  const current = STEPS[currentIndex]

  useEffect(() => {
    const stored = getStoredDraft()
    if (stored) setDraft(stored)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || stage !== "form") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [draft, hydrated, stage])

  useEffect(() => {
    if (stage !== "loading") return
    const timer = window.setInterval(() => {
      setLoadingIndex(index => Math.min(index + 1, LOADING_MESSAGES.length - 1))
    }, 900)
    return () => window.clearInterval(timer)
  }, [stage])

  const canContinue = useMemo(() => {
    if (current.id === "welcome") return true
    if (current.id === "birthDate") return Boolean(draft.dob)
    if (current.id === "birthTime") {
      if (draft.timeMode === "exact") return Boolean(draft.tob)
      if (draft.timeMode === "approximate") return Boolean(draft.tobApprox)
      return draft.timeMode !== null
    }
    if (current.id === "birthPlace") return Boolean(draft.pob.trim())
    return Boolean(draft.dob && draft.pob.trim() && draft.timeMode !== null)
  }, [current.id, draft])

  function updateDraft(update: Partial<BaselineDraft>) {
    setDraft(previous => ({ ...previous, ...update }))
    if (stage === "error") {
      setStage("form")
      setErrorMsg("")
    }
  }

  function goToStep(step: StepId) {
    updateDraft({ step })
  }

  function next() {
    if (!canContinue) return
    const nextStep = STEPS[currentIndex + 1]
    if (nextStep) updateDraft({ step: nextStep.id })
  }

  function back() {
    const previousStep = STEPS[currentIndex - 1]
    if (previousStep) updateDraft({ step: previousStep.id })
  }

  async function handleSubmit() {
    if (!canContinue) return

    setStage("loading")
    setLoadingIndex(0)
    setErrorMsg("")

    let tobValue = "12:00"
    let tobType: "exact" | "approx" = "approx"

    if (draft.timeMode === "exact" && draft.tob) {
      tobValue = draft.tob
      tobType = "exact"
    } else if (draft.timeMode === "approximate" && draft.tobApprox) {
      tobValue = draft.tobApprox
    } else if (draft.timeMode === "window") {
      tobValue = WINDOW_TIMES[draft.dayWindow].time
    }

    try {
      const result = await apiSaveBaseline({
        dob: draft.dob,
        tob: { type: tobType, value: tobValue },
        pob: draft.pob.trim(),
      })

      if (!result.baseline) {
        setErrorMsg("Something went wrong. Check your details and try again.")
        setStage("error")
        return
      }

      window.localStorage.removeItem(STORAGE_KEY)
      setStage("success")
      window.setTimeout(() => onComplete(), 1500)
    } catch {
      setErrorMsg("Connection failed. Try again.")
      setStage("error")
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#08070a] text-[#f4efe9]">
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
          <div className="mb-8 text-center">
            <span className="font-mono text-xs tracking-[0.28em] text-[#f4efe9] uppercase">
              SOVEREIGN.OS
            </span>
          </div>

          <div className="border border-white/[0.08] bg-[#08070a]/80 p-8 backdrop-blur-xl" style={{ borderRadius: "var(--radius-container)" }}>
            <AnimatePresence mode="wait">
              {stage === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 py-12 text-center"
                >
                  <span className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-[#f4efe9]/60" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/70">
                      Building baseline
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#a8a29a]">
                      {LOADING_MESSAGES[loadingIndex]}
                    </p>
                  </div>
                  <div className="mt-2 grid w-full grid-cols-3 gap-2" aria-hidden>
                    {LOADING_MESSAGES.map((message, index) => (
                      <div key={message} className="h-px bg-white/[0.08]">
                        <motion.div
                          initial={false}
                          animate={{ width: index <= loadingIndex ? "100%" : "0%" }}
                          transition={{ duration: 0.28, ease }}
                          className="h-px bg-[#e0743a]/70"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {stage === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-12 text-center"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center border border-[#e0743a]/30 bg-[#e0743a]/10"
                    style={{ borderRadius: 10 }}
                  >
                    <span className="text-lg text-[#f0a06a]">✓</span>
                  </div>
                  <p className="font-serif text-xl text-[#f4efe9]">Your Baseline Design is ready.</p>
                  <p className="max-w-xs text-sm leading-relaxed text-[#76716b]">
                    Your first Defrag workspace is opening.
                  </p>
                </motion.div>
              )}

              {(stage === "form" || stage === "error") && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProgressRail currentIndex={currentIndex} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <div className="mb-8 text-center">
                        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70">
                          {current.eyebrow}
                        </p>
                        <h1 className="mb-3 font-serif text-2xl text-[#f4efe9]">{current.title}</h1>
                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#a8a29a]">
                          {current.body}
                        </p>
                      </div>

                      {current.id === "welcome" && (
                        <div className="grid gap-2">
                          {["Private by design", "Used to ground every space", "You can resume if interrupted"].map(item => (
                            <div key={item} className="border border-white/[0.07] bg-white/[0.03] px-4 py-3" style={{ borderRadius: 10 }}>
                              <p className="text-sm text-[#76716b]">{item}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {current.id === "birthDate" && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#76716b]">Date of birth</label>
                          <input
                            type="date"
                            value={draft.dob}
                            onChange={event => updateDraft({ dob: event.target.value })}
                            required
                            className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                            style={{ borderRadius: 12, fontSize: "16px" }}
                          />
                        </div>
                      )}

                      {current.id === "birthTime" && (
                        <div className="flex flex-col gap-3">
                          <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#76716b]">Time of birth</label>
                          <p className="text-sm text-[#76716b]">How much do you know?</p>

                          <div className="flex flex-col gap-2">
                            {([
                              { mode: "exact" as TimeMode, label: "I know the exact time" },
                              { mode: "approximate" as TimeMode, label: "I know roughly when" },
                              { mode: "window" as TimeMode, label: "I only know the part of day" },
                              { mode: "unknown" as TimeMode, label: "I don't know" },
                            ]).map(({ mode, label }) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => updateDraft({ timeMode: mode })}
                                className={`flex items-center gap-3 border px-4 py-3 text-left text-sm transition-all duration-200 ${
                                  draft.timeMode === mode
                                    ? "border-[#f4efe9]/30 bg-white/[0.05] text-[#f4efe9]"
                                    : "border-white/[0.08] text-[#76716b] hover:border-white/[0.16] hover:text-[#a8a29a]"
                                }`}
                                style={{ borderRadius: 10 }}
                              >
                                <span
                                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-colors ${
                                    draft.timeMode === mode ? "border-[#f4efe9]/60 bg-[#f4efe9]/10" : "border-white/[0.2]"
                                  }`}
                                  style={{ borderRadius: "50%" }}
                                >
                                  {draft.timeMode === mode && <span className="h-1.5 w-1.5 bg-[#f4efe9]" style={{ borderRadius: "50%" }} />}
                                </span>
                                {label}
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            {draft.timeMode === "exact" && (
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
                                  value={draft.tob}
                                  onChange={event => updateDraft({ tob: event.target.value })}
                                  required
                                  className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                                  style={{ borderRadius: 12, fontSize: "16px" }}
                                />
                              </motion.div>
                            )}

                            {draft.timeMode === "approximate" && (
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
                                  value={draft.tobApprox}
                                  onChange={event => updateDraft({ tobApprox: event.target.value })}
                                  className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07] [color-scheme:dark]"
                                  style={{ borderRadius: 12, fontSize: "16px" }}
                                />
                                <div>
                                  <p className="mb-2 text-xs text-[#4f4b47]">How close is that?</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {([
                                      { val: "15" as const, label: "Within 15 min" },
                                      { val: "30" as const, label: "Within 30 min" },
                                      { val: "60" as const, label: "Within 1 hour" },
                                      { val: "unsure" as const, label: "Not sure" },
                                    ]).map(({ val, label }) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => updateDraft({ approxRange: val })}
                                        className={`border px-3 py-2 text-left text-xs transition-all duration-200 ${
                                          draft.approxRange === val
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

                            {draft.timeMode === "window" && (
                              <motion.div
                                key="window"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.25, ease }}
                                className="grid grid-cols-2 gap-2"
                              >
                                {(Object.entries(WINDOW_LABELS) as [DayWindow, string][]).map(([windowKey, label]) => (
                                  <button
                                    key={windowKey}
                                    type="button"
                                    onClick={() => updateDraft({ dayWindow: windowKey })}
                                    className={`border px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                                      draft.dayWindow === windowKey
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

                            {draft.timeMode === "unknown" && (
                              <motion.div
                                key="unknown"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.25, ease }}
                              >
                                <p className="text-sm leading-relaxed text-[#76716b]">
                                  The system will hold this lightly. Some time-sensitive details will be kept approximate; everything else will still be grounded in what is available.
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {current.id === "birthPlace" && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-mono uppercase tracking-[0.14em] text-[#76716b]">Place of birth</label>
                          <input
                            type="text"
                            value={draft.pob}
                            onChange={event => updateDraft({ pob: event.target.value })}
                            required
                            placeholder="City, Country"
                            className="w-full border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-base text-[#f4efe9] placeholder:text-[#4f4b47] outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/[0.07]"
                            style={{ borderRadius: 12, fontSize: "16px" }}
                          />
                        </div>
                      )}

                      {current.id === "review" && (
                        <div className="border border-white/[0.07] bg-white/[0.03] px-4" style={{ borderRadius: 12 }}>
                          <ReviewRow label="Date of birth" value={draft.dob || "Not set"} onEdit={() => goToStep("birthDate")} />
                          <ReviewRow label="Time of birth" value={getTimeSummary(draft)} onEdit={() => goToStep("birthTime")} />
                          <ReviewRow label="Place of birth" value={draft.pob || "Not set"} onEdit={() => goToStep("birthPlace")} />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence>
                    {stage === "error" && errorMsg && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6 text-sm leading-relaxed text-red-400/80"
                      >
                        {errorMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={back}
                      disabled={currentIndex === 0}
                      className="h-10 px-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] transition-colors hover:text-[#f4efe9] disabled:pointer-events-none disabled:opacity-30"
                    >
                      Back
                    </button>

                    {current.id === "review" ? (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canContinue}
                        className="inline-flex h-11 items-center justify-center bg-[#f4efe9] px-5 text-sm font-medium text-[#08070a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                        style={{ borderRadius: "var(--radius-button)" }}
                      >
                        Build Baseline Design
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={next}
                        disabled={!canContinue}
                        className="inline-flex h-11 items-center justify-center bg-[#f4efe9] px-5 text-sm font-medium text-[#08070a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                        style={{ borderRadius: "var(--radius-button)" }}
                      >
                        {current.id === "welcome" ? "Begin" : "Continue"}
                      </button>
                    )}
                  </div>

                  <p className="mt-6 text-center text-xs text-[#4f4b47]">
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
