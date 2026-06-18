"use client"
import * as React from "react"
import { motion } from "framer-motion"

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
  }
  input: string
  spaceName?: string
  onSave?: () => void
  isSaving?: boolean
  saveSuccess?: boolean
  onInvite?: () => void
}

export function ResultCard({
  result,
  input,
  spaceName = "Defrag",
  onSave,
  isSaving,
  saveSuccess,
  onInvite,
}: ResultCardProps) {
  const [copied, setCopied] = React.useState(false)

  const sections = [
    { label: "Active pattern",       value: result.activePattern },
    { label: "What keeps happening", value: result.theRepeat },
    { label: "Default mode",         value: result.oldRole },
    { label: "What shaped this",     value: result.whatYouLearnedToCarry },
    { label: "Under pressure",       value: result.strainPattern },
    { label: "What's working",       value: result.giftUnderStrain },
    { label: "What would help",      value: result.alignment },
  ].filter(s => s.value)

  const response = result.bestNextResponse
  const steering = result.conversationalSteering

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
      lines.push("SUGGESTED RESPONSE")
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
    await navigator.clipboard.writeText(lines.join(NL))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border border-white/[0.08] bg-white/[0.02] overflow-hidden"
      style={{ borderRadius: 16 }}
    >
      {/* Card header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#08070a]/60">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Sovereign.os</span>
          <span className="text-white/20 text-xs">/</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8a29a]">{spaceName}</span>
        </div>
        <span className="font-mono text-[9px] text-[#4f4b47]">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Input echo */}
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-2">You described</p>
        <p className="text-[13px] text-[#76716b] leading-relaxed italic">"{input.slice(0, 120)}{input.length > 120 ? "…" : ""}"</p>
      </div>

      {/* Sections */}
      <div className="px-6 py-6">
        {sections.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-b border-white/[0.05] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-2">{s.label}</p>
            <p className="text-[14px] text-[#f4efe9] leading-[1.7]">{s.value}</p>
          </motion.div>
        ))}

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sections.length * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.06] pt-5 mt-5"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-3">Suggested response</p>
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

        {steering && (steering.do?.length || steering.avoid?.length) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (sections.length + 1) * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.06] pt-5 mt-5 grid grid-cols-2 gap-6"
          >
            {steering.do?.length ? (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">In the next conversation</p>
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
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Avoid</p>
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

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-white/[0.06] bg-[#08070a]/40 flex items-center justify-between gap-3">
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1"/>
            <path d="M1 8V1h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          {copied ? "Copied" : "Copy all"}
        </button>
        {/* Invite Privately */}
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
      </div>
    </motion.div>
  )
}