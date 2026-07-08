"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { ResponseStructure, type StructuredResponseSection } from "@/components/understanding/ResponseStructure"

interface RailBaseline { pace?: string; stabilizes?: string; responds?: string }
interface RailSky { urgency?: string; tolerance?: string; state?: string }
interface RailPattern { loop?: string }

type StepDeeperChoice =
  | "keep_simple"
  | "show_pattern"
  | "map_baseline"
  | "turn_into_action"
  | "save_pattern"
  | "go_deeper"
  | "steady_first"

const STEP_DEEPER_LABELS: Record<StepDeeperChoice, string> = {
  keep_simple: "Keep it simple",
  show_pattern: "Show the deeper pattern",
  map_baseline: "Map with Baseline Design",
  turn_into_action: "Turn this into action",
  save_pattern: "Save this pattern",
  go_deeper: "Go deeper",
  steady_first: "Steady first",
}

interface PresenceData {
  mode?: string
  overlay?: string
  emotionalCharge?: "low" | "medium" | "high"
  visibleStructure?: string
  stepDeeperChoices?: StepDeeperChoice[]
  useBaseline?: boolean
}

interface ResultCardProps {
  result: {
    activePattern?: string
    theRepeat?: string
    oldRole?: string
    whatYouLearnedToCarry?: string
    strainPattern?: string
    giftUnderStrain?: string
    alignment?: string
    bestNextResponse?: { summary?: string; phrasing?: string[] } | string
    conversationalSteering?: { do?: string[]; avoid?: string[] }
    summary?: string
    /** Compressed identity signature — shown once, bottom only */
    signature?: string
    /** Confidence scoring from output validator */
    confidence?: { score: number; strength: "low" | "medium" | "high" }
    /** Reduced signal rail data */
    rail?: {
      baseline?: RailBaseline
      sky?: RailSky
      pattern?: RailPattern
    }
    /** Presence Engine output */
    presence?: PresenceData
  }
  input: string
  spaceName?: string
  onSave?: () => void
  isSaving?: boolean
  saveSuccess?: boolean
  onInvite?: () => void
  onStepDeeper?: (choice: StepDeeperChoice) => void
}

function getResponseSummary(response: ResultCardProps["result"]["bestNextResponse"]): string | undefined {
  if (!response) return undefined
  return typeof response === "string" ? response : response.summary
}

export function ResultCard({
  result,
  input,
  spaceName = "Defrag",
  onSave,
  isSaving,
  saveSuccess,
  onInvite,
  onStepDeeper,
}: ResultCardProps) {
  const [copied, setCopied] = React.useState(false)

  const response = result.bestNextResponse
  const responseSummary = getResponseSummary(response)
  const steering = result.conversationalSteering

  const structuredSections: StructuredResponseSection[] = [
    { label: "Diagnosis", value: result.activePattern || result.summary },
    { label: "Explanation", value: result.whatYouLearnedToCarry || result.strainPattern || result.theRepeat },
    { label: "Pattern connection", value: result.theRepeat || result.oldRole || result.giftUnderStrain },
    { label: "Clean move", value: responseSummary || result.alignment, emphasis: true },
    { label: "Reflection", value: result.alignment || result.giftUnderStrain || result.signature },
  ]

  const sections = [
    { label: "Diagnosis", value: result.activePattern || result.summary },
    { label: "Explanation", value: result.whatYouLearnedToCarry || result.strainPattern || result.theRepeat },
    { label: "Pattern connection", value: result.theRepeat || result.oldRole || result.giftUnderStrain },
    { label: "Clean move", value: responseSummary || result.alignment },
    { label: "Reflection", value: result.alignment || result.giftUnderStrain || result.signature },
  ].filter(s => s.value)

  const handleCopyAll = async () => {
    const NL = "\n"
    const lines: string[] = [
      `SOVEREIGN.OS — ${spaceName.toUpperCase()}`,
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      "",
      `"${input}"`,
      "",
    ]
    sections.forEach(s => {
      lines.push(s.label.toUpperCase())
      lines.push(s.value!)
      lines.push("")
    })
    if (response && typeof response === "object" && response.phrasing?.length) {
      lines.push("WORDS YOU CAN USE")
      response.phrasing.forEach(p => lines.push(`  -> ${p}`))
      lines.push("")
    }
    if (steering) {
      if (steering.do?.length) {
        lines.push("IN THE NEXT CONVERSATION")
        steering.do.forEach(d => lines.push(`  + ${d}`))
        lines.push("")
      }
      if (steering.avoid?.length) {
        lines.push("AVOID")
        steering.avoid.forEach(a => lines.push(`  - ${a}`))
        lines.push("")
      }
    }
    lines.push("—")
    lines.push("Sovereign.os · defrag.app")
    const text = lines.join(NL)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const NL = "\n"
    const lines: string[] = [
      `SOVEREIGN.OS — ${spaceName.toUpperCase()}`,
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      "",
      `"${input}"`,
      "",
    ]
    sections.forEach(s => {
      lines.push(s.label.toUpperCase())
      lines.push(s.value!)
      lines.push("")
    })
    lines.push("—")
    lines.push("Sovereign.os · defrag.app")
    const blob = new Blob([lines.join(NL)], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sovereign-${spaceName.toLowerCase()}-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border border-white/[0.08] bg-white/[0.02] overflow-hidden"
      style={{ borderRadius: "var(--radius-container)" }}
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#08070a]/60">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Sovereign.os</span>
          <span className="text-[#4f4b47] text-xs">/</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8a29a]">{spaceName}</span>
        </div>
        <div className="flex items-center gap-3">
          {result.confidence && result.confidence.strength !== "low" && (
            <span
              className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47]"
              title={`Signal strength: ${result.confidence.strength}`}
            >
              {result.confidence.strength === "high" ? "●●●" : "●●○"}
            </span>
          )}
          <span className="font-mono text-[9px] text-[#4f4b47]">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Experience</p>
        <p className="text-[13px] text-[#76716b] leading-relaxed italic">"{input.slice(0, 120)}{input.length > 120 ? "…" : ""}"</p>
      </div>

      <ResponseStructure sections={structuredSections} />

      {response && typeof response === "object" && response.phrasing && response.phrasing.length > 0 && (
        <div className="px-6 pb-6">
          <div className="border border-white/[0.06] bg-white/[0.02] p-4" style={{ borderRadius: 10 }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">Words you can use</p>
            {response.phrasing.map((phrase, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-[13px] text-[#a8a29a] leading-relaxed py-2.5 border-b border-white/[0.04] last:border-0 last:pb-0 cursor-pointer hover:text-[#f4efe9] transition-colors group"
                onClick={() => navigator.clipboard.writeText(phrase)}
                role="button"
                tabIndex={0}
              >
                <span className="text-[#4f4b47] shrink-0 mt-0.5 select-none">↳</span>
                <span className="flex-1">{phrase}</span>
                <span className="text-[9px] text-[#4f4b47] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center font-mono uppercase tracking-[0.1em]">Copy</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {steering && (steering.do?.length || steering.avoid?.length) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 pb-6 grid grid-cols-2 gap-6"
        >
          {steering.do?.length ? (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">In the next conversation</p>
              <ul className="space-y-2">
                {steering.do.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[#a8a29a] leading-relaxed">
                    <span className="text-[#76716b] shrink-0 select-none">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {steering.avoid?.length ? (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Avoid</p>
              <ul className="space-y-2">
                {steering.avoid.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[#a8a29a] leading-relaxed">
                    <span className="text-[#76716b] shrink-0 select-none">−</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      )}

      {result.rail ? (
        <div className="px-6 py-4 border-t border-white/[0.04] bg-[#08070a]/30">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {result.rail.baseline && (result.rail.baseline.pace || result.rail.baseline.stabilizes || result.rail.baseline.responds) && (
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1.5">Baseline</p>
                <div className="flex flex-col gap-0.5">
                  {result.rail.baseline.pace && <p className="font-mono text-[9px] text-[#4f4b47]">pace: {result.rail.baseline.pace}</p>}
                  {result.rail.baseline.stabilizes && <p className="font-mono text-[9px] text-[#4f4b47]">stabilizes: {result.rail.baseline.stabilizes}</p>}
                  {result.rail.baseline.responds && <p className="font-mono text-[9px] text-[#4f4b47]">responds: {result.rail.baseline.responds}</p>}
                </div>
              </div>
            )}
            {result.rail.sky && (result.rail.sky.urgency || result.rail.sky.tolerance) && (
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1.5">Timing</p>
                <div className="flex flex-col gap-0.5">
                  {result.rail.sky.urgency && <p className="font-mono text-[9px] text-[#4f4b47]">urgency: {result.rail.sky.urgency}</p>}
                  {result.rail.sky.tolerance && <p className="font-mono text-[9px] text-[#4f4b47]">tolerance: {result.rail.sky.tolerance}</p>}
                </div>
              </div>
            )}
            {result.rail.pattern?.loop && (
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1.5">Pattern</p>
                <p className="font-mono text-[9px] text-[#4f4b47]">{result.rail.pattern.loop}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {result.signature ? (
        <div className="px-6 py-3 border-t border-white/[0.03]">
          <p className="font-mono text-[8px] text-[#4f4b47] tracking-[0.12em]">{result.signature}</p>
        </div>
      ) : null}

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 py-3 border-t border-[#e0743a]/10 bg-[#e0743a]/[0.04] flex items-center justify-between"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70">Saved to your Library</span>
          <a href="/app" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">View Library →</a>
        </motion.div>
      )}

      {result.presence?.stepDeeperChoices && result.presence.stepDeeperChoices.length > 0 && onStepDeeper && (
        <div className="px-6 py-4 border-t border-white/[0.04] flex flex-wrap gap-2">
          {result.presence.stepDeeperChoices.map((choice) => (
            <button
              key={choice}
              onClick={() => onStepDeeper(choice)}
              className="font-mono text-[8px] uppercase tracking-[0.14em] px-3 py-1.5 border border-white/[0.06] text-[#76716b] hover:text-[#f4efe9] hover:border-white/[0.12] transition-all duration-200"
              style={{ borderRadius: "var(--radius-minimal)" }}
            >
              {STEP_DEEPER_LABELS[choice]}
            </button>
          ))}
        </div>
      )}

      <div className="px-6 py-4 border-t border-white/[0.06] bg-[#08070a]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={handleCopyAll} className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
            Export
          </button>
        </div>
        {onInvite && (
          <button onClick={onInvite} className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
            Invite Privately
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving || saveSuccess}
            className="h-7 px-4 bg-[#f4efe9] text-[#08070a] text-[11px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderRadius: 6 }}
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save to Library"}
          </button>
        )}
      </div>
    </motion.div>
  )
}
