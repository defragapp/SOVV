"use client"
import * as React from "react"
import { motion } from "framer-motion"

interface RailBaseline { pace?: string; stabilizes?: string; responds?: string }
interface RailSky { urgency?: string; tolerance?: string; state?: string }
interface RailPattern { loop?: string }

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
  }
  input: string
  spaceName?: string
  onSave?: () => void
  isSaving?: boolean
  saveSuccess?: boolean
  saveError?: "pro_required" | "error" | null
  onInvite?: () => void
}

export function ResultCard({
  result,
  input,
  spaceName = "Defrag",
  onSave,
  isSaving,
  saveSuccess,
  saveError,
  onInvite,
}: ResultCardProps) {
  const [copied, setCopied] = React.useState(false)

  

  const response = result.bestNextResponse
  const steering = result.conversationalSteering

  const sections = [
    { label: "What's active",          value: result.activePattern },
    { label: "The pattern",            value: result.theRepeat },
    { label: "The role",               value: result.oldRole },
    { label: "What shaped this",       value: result.whatYouLearnedToCarry },
    { label: "Under pressure",         value: result.strainPattern },
    { label: "What's working",         value: result.giftUnderStrain },
    { label: "What changes this",      value: result.alignment },
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
    if (response) {
      lines.push("NEXT MOVE")
      lines.push(typeof response === "string" ? response : (response.summary || ""))
      if (typeof response === "object" && response.phrasing?.length) {
        response.phrasing.forEach(p => lines.push(`  -> ${p}`))
      }
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
    if (response) {
      lines.push("NEXT MOVE")
      lines.push(typeof response === "string" ? response : (response.summary || ""))
      lines.push("")
    }
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
      {/* Card header */}
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

      {/* Input echo */}
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">You described</p>
        <p className="text-[13px] text-[#76716b] leading-relaxed italic">"{input.slice(0, 120)}{input.length > 120 ? "…" : ""}"</p>
      </div>

      {/* Sections — 6 rows + Next move */}
      <div className="px-6 py-6">
        {sections.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-b border-white/[0.05] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">{s.label}</p>
            <p className="text-[14px] text-[#f4efe9] leading-[1.7]">{s.value}</p>
          </motion.div>
        ))}

        {/* Next move — rendered with slight emphasis */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sections.length * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.06] pt-5 mt-5"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-3">Next move</p>
            <p className="text-[14px] text-[#f4efe9] leading-[1.7] mb-4">
              {typeof response === "string" ? response : response.summary}
            </p>
            {typeof response === "object" && response.phrasing && response.phrasing.length > 0 && (
              <div className="border border-white/[0.06] bg-white/[0.02] p-4" style={{ borderRadius: 10 }}>
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
            )}
          </motion.div>
        )}

        {/* Conversational steering */}
        {steering && (steering.do?.length || steering.avoid?.length) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (sections.length + 1) * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.06] pt-5 mt-5 grid grid-cols-2 gap-6"
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
      </div>

      {/* Rail — reduced signal instrumentation, quiet and compressed.
           Default: baseline (pace/stabilizes/responds) + sky (urgency/tolerance) + pattern.
           state: reactive intentionally omitted from default — expanded rail only. */}
      {result.rail ? (
        <div className="px-6 py-4 border-t border-white/[0.04] bg-[#08070a]/30">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {result.rail.baseline && (result.rail.baseline.pace || result.rail.baseline.stabilizes || result.rail.baseline.responds) && (
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1.5">Baseline</p>
                <div className="flex flex-col gap-0.5">
                  {result.rail.baseline.pace && (
                    <p className="font-mono text-[9px] text-[#4f4b47]">pace: {result.rail.baseline.pace}</p>
                  )}
                  {result.rail.baseline.stabilizes && (
                    <p className="font-mono text-[9px] text-[#4f4b47]">stabilizes: {result.rail.baseline.stabilizes}</p>
                  )}
                  {result.rail.baseline.responds && (
                    <p className="font-mono text-[9px] text-[#4f4b47]">responds: {result.rail.baseline.responds}</p>
                  )}
                </div>
              </div>
            )}
            {result.rail.sky && (result.rail.sky.urgency || result.rail.sky.tolerance) && (
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1.5">Sky</p>
                <div className="flex flex-col gap-0.5">
                  {result.rail.sky.urgency && (
                    <p className="font-mono text-[9px] text-[#4f4b47]">urgency: {result.rail.sky.urgency}</p>
                  )}
                  {result.rail.sky.tolerance && (
                    <p className="font-mono text-[9px] text-[#4f4b47]">tolerance: {result.rail.sky.tolerance}</p>
                  )}
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

      {/* Signature line — once only, bottom only, very low contrast.
           Encoded identity, not explained. Never shown in body. */}
      {result.signature ? (
        <div className="px-6 py-3 border-t border-white/[0.03]">
          <p className="font-mono text-[8px] text-[#4f4b47] tracking-[0.12em]">{result.signature}</p>
        </div>
      ) : null}

      {/* Save confirmation — brief, auto-dismiss */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 py-3 border-t border-[#e0743a]/10 bg-[#e0743a]/[0.04] flex items-center justify-between"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/70">
            Saved to your Library
          </span>
          <a
            href="/app"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            View Library →
          </a>
        </motion.div>
      )}

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-white/[0.06] bg-[#08070a]/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1"/>
              <path d="M1 8V1h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
        </div>
        {onInvite && (
          <button
            onClick={onInvite}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 1H11V4M11 1L6.5 5.5M5 2H2C1.45 2 1 2.45 1 3V10C1 10.55 1.45 11 2 11H9C9.55 11 10 10.55 10 10V7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
        {saveError === "pro_required" && (
          <a
            href="/pricing"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors"
          >
            Pro required → Upgrade
          </a>
        )}
        {saveError === "error" && (
          <span className="font-mono text-[9px] text-[#4f4b47]">Save failed. Try again.</span>
        )}
      </div>
    </motion.div>
  )
}