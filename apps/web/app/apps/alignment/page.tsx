"use client"
import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { SpaceShell } from "@/components/spaces/space-shell"
import { getAlignmentBrief, type AlignmentBrief, type AlignmentTraitBlock } from "@/lib/alignment/getAlignmentBrief"

const ease = [0.16, 1, 0.3, 1] as const

// ─── Tag chip with glossary reveal ────────────────────────────────────────
function TagChip({ tag, label }: { tag: string; label?: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <span className="relative inline-block">
      <button
        onClick={() => label && setOpen(o => !o)}
        className={`font-mono text-[8px] uppercase tracking-[0.12em] border px-2 py-0.5 transition-colors ${
          label
            ? "border-white/[0.12] text-[#76716b] hover:border-white/[0.25] hover:text-[#a8a29a] cursor-pointer"
            : "border-white/[0.08] text-[#4f4b47] cursor-default"
        }`}
        style={{ borderRadius: 2 }}
        aria-label={label ? `${tag}: ${label}` : tag}
      >
        {tag}
      </button>
      <AnimatePresence>
        {open && label && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease }}
            className="absolute bottom-full left-0 mb-2 z-20 w-48 border border-white/[0.12] bg-[#08070a] px-3 py-2"
            style={{ borderRadius: 4 }}
          >
            <p className="text-[11px] text-[#a8a29a] leading-relaxed">{label}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

// ─── Trait block ──────────────────────────────────────────────────────────
function TraitBlock({ block, delay = 0 }: { block: AlignmentTraitBlock; delay?: number }) {
  const glossaryMap = Object.fromEntries(
    (block.tagGlossary || []).map(g => [g.tag, g.label])
  )
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      className="border-b border-white/[0.06] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0"
    >
      <div className="flex flex-col gap-1.5 mb-3">
        {block.lines.map((line, i) => (
          <p key={i} className="text-[14px] text-[#f4efe9] leading-[1.65]">{line}</p>
        ))}
      </div>
      {block.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {block.tags.map(tag => (
            <TagChip key={tag} tag={tag} label={glossaryMap[tag]} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-6 bg-white/[0.04] w-3/4" style={{ borderRadius: 2 }} />
      <div className="h-4 bg-white/[0.03] w-1/2" style={{ borderRadius: 2 }} />
      <div className="h-px bg-white/[0.06] w-full mt-4" />
      {[1,2,3].map(i => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 bg-white/[0.04] w-full" style={{ borderRadius: 2 }} />
          <div className="h-4 bg-white/[0.03] w-4/5" style={{ borderRadius: 2 }} />
        </div>
      ))}
    </div>
  )
}

// ─── Main entry page ──────────────────────────────────────────────────────
export default function AlignmentEntryPage() {
  const [brief, setBrief] = React.useState<AlignmentBrief | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    getAlignmentBrief()
      .then(b => {
        if (b) setBrief(b)
        else setError("Unable to load your alignment brief. Check your connection.")
      })
      .catch(() => setError("Unable to load your alignment brief."))
      .finally(() => setLoading(false))
  }, [])

  // ─── LEFT PANEL ──────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Alignment</p>
      </div>
      <div className="px-5 pt-6 pb-5 flex flex-col gap-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-3">What this is</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Your fixed center. The live sky above you. Alignment uses both to show you the path back to yourself — when a situation, conversation, or decision has pulled you off course.
          </p>
        </div>
        <div className="border-t border-white/[0.06] pt-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Two inputs</p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] text-[#a8a29a] font-medium mb-1">Baseline Design</p>
              <p className="text-[11px] text-[#4f4b47] leading-relaxed">Your fixed center. How you naturally operate. Never changes.</p>
            </div>
            <div>
              <p className="text-[11px] text-[#a8a29a] font-medium mb-1">Live sky</p>
              <p className="text-[11px] text-[#4f4b47] leading-relaxed">The emotional weather you're moving through right now. Changes daily.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-5">
          <Link
            href="/apps/alignment/workspace"
            className="flex items-center justify-between group"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#76716b] group-hover:text-[#f4efe9] transition-colors">
              Open workspace
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#4f4b47] group-hover:text-[#f4efe9] transition-colors">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )

  // ─── RIGHT PANEL ─────────────────────────────────────────────────────────
  const contextPanel = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29a]">Action</p>
      </div>
      <div className="px-5 pt-6 pb-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="h-4 bg-white/[0.04] w-full animate-pulse" style={{ borderRadius: 2 }} />
            <div className="h-4 bg-white/[0.03] w-3/4 animate-pulse" style={{ borderRadius: 2 }} />
          </div>
        ) : brief?.action ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease }}
            className="flex flex-col gap-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/60 mb-2">Right now</p>
            {brief.action.map((line, i) => (
              <p key={i} className="text-[13px] text-[#f4efe9] leading-relaxed">{line}</p>
            ))}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <Link
                href="/apps/alignment/workspace"
                className="flex items-center justify-between w-full h-9 px-4 border border-white/[0.08] hover:border-white/[0.2] transition-colors group"
                style={{ borderRadius: 6 }}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] group-hover:text-[#f4efe9] transition-colors">
                  Work through a situation
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#4f4b47] group-hover:text-[#f4efe9] transition-colors">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  )

  // ─── CENTER PANEL ─────────────────────────────────────────────────────────
  const main = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4efe9]">Your Alignment</span>
        {!loading && brief && (
          <Link
            href="/apps/alignment/workspace"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
          >
            Workspace →
          </Link>
        )}
      </div>

      <div className="flex-1 px-6 pt-8 pb-8">
        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <p className="text-[13px] text-[#76716b] leading-relaxed">{error}</p>
        )}

        {!loading && brief && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-col gap-0"
          >
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="mb-10"
            >
              <p className="font-serif text-[22px] md:text-[26px] text-[#f4efe9] leading-[1.3] tracking-[-0.01em] mb-4">
                {brief.hero.anchor}
              </p>
              {brief.hero.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {brief.hero.tags.map(tag => {
                    const glossary = brief.hero.tagGlossary?.find(g => g.tag === tag)
                    return <TagChip key={tag} tag={tag} label={glossary?.label} />
                  })}
                </div>
              )}
            </motion.div>

            {/* Aligned */}
            {brief.aligned.length > 0 && (
              <div className="mb-10">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-6">
                  When you're in your lane
                </p>
                {brief.aligned.map((block, i) => (
                  <TraitBlock key={block.key} block={block} delay={0.1 + i * 0.08} />
                ))}
              </div>
            )}

            {/* Misaligned */}
            {(brief.misaligned.over.length > 0 || brief.misaligned.under.length > 0) && (
              <div className="mb-10 border-t border-white/[0.06] pt-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#4f4b47] mb-6">
                  When you're off course
                </p>
                {brief.misaligned.over.length > 0 && (
                  <div className="mb-6">
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47] mb-4">Over-expression</p>
                    {brief.misaligned.over.map((block, i) => (
                      <TraitBlock key={block.key} block={block} delay={0.3 + i * 0.06} />
                    ))}
                  </div>
                )}
                {brief.misaligned.under.length > 0 && (
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#4f4b47] mb-4">Under-expression</p>
                    {brief.misaligned.under.map((block, i) => (
                      <TraitBlock key={block.key} block={block} delay={0.4 + i * 0.06} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current drift */}
            {brief.currentDrift && brief.currentDrift.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5, ease }}
                className="mb-10 border-t border-white/[0.06] pt-8"
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#4f4b47] mb-4">Current drift</p>
                {brief.currentDrift.map((line, i) => (
                  <p key={i} className="text-[13px] text-[#76716b] leading-relaxed mb-2">{line}</p>
                ))}
              </motion.div>
            )}

            {/* CTA to workspace */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6, ease }}
              className="border-t border-white/[0.06] pt-8"
            >
              <Link
                href="/apps/alignment/workspace"
                className="flex items-center justify-between w-full group"
              >
                <div>
                  <p className="text-[13px] text-[#f4efe9] mb-1">Work through a specific situation</p>
                  <p className="text-[11px] text-[#4f4b47]">Describe what's pulling you off course — Alignment will show you the path back.</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#4f4b47] group-hover:text-[#f4efe9] transition-colors shrink-0 ml-4">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "brief",   label: "Alignment", content: main },
        { id: "context", label: "Context",   content: sidebar },
        { id: "action",  label: "Action",    content: contextPanel },
      ]}
    />
  )
}
