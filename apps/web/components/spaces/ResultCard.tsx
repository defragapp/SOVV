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

  // Section labels locked to canonical Defrag output structure.
  // These 7 labels are the system contract — do not change them.
  //
  // Field mapping:
  //   activePattern         → What's active
  //   theRepeat             → You  (your pattern under this pressure)
  //   oldRole               → Them  (how the other side tends to move)
  //   whatYouLearnedToCarry → What forms between you  (the loop)
  //   strainPattern         → Why it's sharper now  (timing/amplification)
  //   giftUnderStrain       → What changes this  (the mechanism/shift)
  //   alignment             → What changes this (secondary — merged if both present)
  //
  // "Next move" is rendered separately with emphasis below.
  const sections = [
    { label: "What's active",           value: result.activePattern },
    { label: "You",                     value: result.theRepeat },
    { label: "Them",                    value: result.oldRole },
    { label: "What forms between you",  value: result.whatYouLearnedToCarry },
    { label: "Why it's sharper now",    value: result.strainPattern },
    // Merge giftUnderStrain + alignment into "What changes this"
    // Use alignment if present (it's the primary shift field), fall back to giftUnderStrain
    {
      label: "What changes this",
      value: result.alignment || result.giftUnderStrain,
    },
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
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-3">Next move</p>
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

      
        