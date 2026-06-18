"use client"
import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { SpaceShell } from "@/components/spaces/space-shell"
import { getTranslation } from "@/lib/baseline/getTranslation"

const ease = [0.16, 1, 0.3, 1] as const

// ─── Types ─────────────────────────────────────────────────────────────────

interface GlossaryItem { tag: string; label: string }
interface TraitBlockData {
  key: string
  lines: string[]
  tags?: string[]
  tagGlossary?: GlossaryItem[]
}
interface AlignmentRender {
  hero: { anchor: string; tags?: string[]; tagGlossary?: GlossaryItem[] }
  aligned: TraitBlockData[]
  misaligned: { over: TraitBlockData[]; under: TraitBlockData[] }
  currentDrift?: string[]
  action: string[]
  workspaceHref: string
}

// ─── Tag chip ──────────────────────────────────────────────────────────────

function TagChip({ tag, label }: { tag: string; label?: string }) {
  const [open, setOpen] = React.useState(false)
  const prefersReduced = useReducedMotion()
  return (
    <span className="relative inline-block">
      <button
        onClick={() => label && setOpen(o => !o)}
        onBlur={() => setOpen(false)}
        className={`font-mono text-[8px] uppercase tracking-[0.12em] border px-2 py-0.5 transition-colors duration-150 ${
          label
            ? "border-white/[0.10] text-[#4f4b47] hover:border-white/[0.22] hover:text-[#76716b] cursor-pointer"
            : "border-white/[0.06] text-[#3a3733] cursor-default"
        }`}
        style={{ borderRadius: 2 }}
        aria-label={label ? `${tag}: ${label}` : tag}
        aria-expanded={open}
      >
        {tag}
      </button>
      <AnimatePresence>
        {open && label && (
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? {} : { opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease }}
            className="absolute bottom-full left-0 mb-2 z-30 w-52 border border-white/[0.10] bg-[#0c0a0d] px-3 py-2.5 shadow-xl"
            style={{ borderRadius: 6 }}
          >
            <p className="text-[11px] text-[#a8a29a] leading-relaxed">{label}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

// ─── Tags row ──────────────────────────────────────────────────────────────

function TagsRow({ tags, glossary }: { tags?: string[]; glossary?: GlossaryItem[] }) {
  if (!tags?.length) return null
  const map = Object.fromEntries((glossary || []).map(g => [g.tag, g.label]))
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map(tag => <TagChip key={tag} tag={tag} label={map[tag]} />)}
    </div>
  )
}

// ─── Section label ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#4f4b47] mb-5">
      {children}
    </p>
  )
}

// ─── Divider ───────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-white/[0.05] my-10" />
}

// ─── Loading skeleton ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse max-w-2xl mx-auto pt-16 px-6">
      {/* Hero skeleton */}
      <div className="flex flex-col gap-3">
        <div className="h-8 bg-white/[0.04] w-4/5" style={{ borderRadius: 2 }} />
        <div className="h-8 bg-white/[0.03] w-3/5" style={{ borderRadius: 2 }} />
      </div>
      <div className="h-px bg-white/[0.04] w-full" />
      {/* Content skeletons */}
      {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 bg-white/[0.04]" style={{ borderRadius: 2, width: `${w * 100}%` }} />
          <div className="h-4 bg-white/[0.03]" style={{ borderRadius: 2, width: `${(w - 0.15) * 100}%` }} />
        </div>
      ))}
    </div>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function Hero({ data, delay = 0 }: { data: AlignmentRender["hero"]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
      className="mb-12"
    >
      <p className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] text-[#f4efe9] leading-[1.25] tracking-[-0.015em] max-w-xl">
        {data.anchor}
      </p>
      <TagsRow tags={data.tags} glossary={data.tagGlossary} />
    </motion.div>
  )
}

// ─── Alignment view ────────────────────────────────────────────────────────

function AlignmentView({ blocks, delay = 0 }: { blocks: TraitBlockData[]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!blocks.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      <SectionLabel>when you're aligned</SectionLabel>
      <div className="flex flex-col gap-0">
        {blocks.map((block, i) => (
          <motion.div
            key={block.key}
            initial={prefersReduced ? {} : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: delay + i * 0.07, ease }}
            className="border-b border-white/[0.05] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0"
          >
            <div className="flex flex-col gap-1.5">
              {block.lines.map((line, j) => (
                <p key={j} className="text-[15px] text-[#f4efe9] leading-[1.65]">{line}</p>
              ))}
            </div>
            <TagsRow tags={block.tags} glossary={block.tagGlossary} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Misalignment view ─────────────────────────────────────────────────────

function MisalignmentView({
  over, under, delay = 0
}: {
  over: TraitBlockData[]
  under: TraitBlockData[]
  delay?: number
}) {
  const prefersReduced = useReducedMotion()
  if (!over.length && !under.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      <SectionLabel>when you're off</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Over-expression */}
        {over.length > 0 && (
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#3a3733] mb-4">too much</p>
            <div className="flex flex-col gap-0">
              {over.map((block, i) => (
                <motion.div
                  key={block.key}
                  initial={prefersReduced ? {} : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: delay + 0.05 + i * 0.06, ease }}
                  className="border-b border-white/[0.04] pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
                >
                  {block.lines.map((line, j) => (
                    <p key={j} className="text-[13px] text-[#76716b] leading-[1.6]">{line}</p>
                  ))}
                  <TagsRow tags={block.tags} glossary={block.tagGlossary} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
        {/* Under-expression */}
        {under.length > 0 && (
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#3a3733] mb-4">too little</p>
            <div className="flex flex-col gap-0">
              {under.map((block, i) => (
                <motion.div
                  key={block.key}
                  initial={prefersReduced ? {} : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: delay + 0.1 + i * 0.06, ease }}
                  className="border-b border-white/[0.04] pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
                >
                  {block.lines.map((line, j) => (
                    <p key={j} className="text-[13px] text-[#76716b] leading-[1.6]">{line}</p>
                  ))}
                  <TagsRow tags={block.tags} glossary={block.tagGlossary} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Current drift ─────────────────────────────────────────────────────────

function CurrentDrift({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!lines.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease }}
      className="border border-white/[0.06] px-5 py-4"
      style={{ borderRadius: 10 }}
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#3a3733] mb-3">right now</p>
      {lines.slice(0, 2).map((line, i) => (
        <p key={i} className="text-[13px] text-[#76716b] leading-[1.6]">{line}</p>
      ))}
    </motion.div>
  )
}

// ─── Action panel ──────────────────────────────────────────────────────────

function ActionPanel({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!lines.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      <SectionLabel>the move</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {lines.slice(0, 2).map((line, i) => (
          <p key={i} className="text-[15px] text-[#f4efe9] leading-[1.65]">{line}</p>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Enter workspace ───────────────────────────────────────────────────────

function EnterWorkspace({ href, delay = 0 }: { href: string; delay?: number }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease }}
      className="pt-2"
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-3 text-[13px] text-[#76716b] hover:text-[#f4efe9] transition-colors duration-200"
      >
        <span>go deeper</span>
        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
      </Link>
    </motion.div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function AlignmentEntryPage() {
  const [brief, setBrief] = React.useState<AlignmentRender | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    getTranslation("alignment")
      .then(t => {
        if (t?.appRender) setBrief(t.appRender as AlignmentRender)
        else setError("Unable to load your alignment brief.")
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
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50 mb-3">What this is</p>
          <p className="text-[12px] text-[#4f4b47] leading-relaxed">
            Your fixed center. The live sky above you. Alignment uses both to show you the path back to yourself — when a situation, conversation, or decision has pulled you off course.
          </p>
        </div>
        <div className="border-t border-white/[0.05] pt-5 flex flex-col gap-3">
          <div>
            <p className="text-[11px] text-[#76716b] font-medium mb-1">Baseline Design</p>
            <p className="text-[11px] text-[#3a3733] leading-relaxed">Your fixed center. How you naturally operate.</p>
          </div>
          <div>
            <p className="text-[11px] text-[#76716b] font-medium mb-1">Live sky</p>
            <p className="text-[11px] text-[#3a3733] leading-relaxed">The emotional weather you're moving through right now.</p>
          </div>
        </div>
        <div className="border-t border-white/[0.05] pt-5">
          <Link
            href="/apps/alignment/workspace"
            className="flex items-center justify-between group"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] group-hover:text-[#f4efe9] transition-colors">
              Open workspace
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#3a3733] group-hover:text-[#f4efe9] transition-colors">
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
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-4 bg-white/[0.04] w-full" style={{ borderRadius: 2 }} />
            <div className="h-4 bg-white/[0.03] w-3/4" style={{ borderRadius: 2 }} />
          </div>
        ) : brief?.action ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease }}
            className="flex flex-col gap-4"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/50 mb-1">The move</p>
            {brief.action.slice(0, 2).map((line, i) => (
              <p key={i} className="text-[13px] text-[#f4efe9] leading-relaxed">{line}</p>
            ))}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <Link
                href="/apps/alignment/workspace"
                className="flex items-center justify-between w-full h-9 px-4 border border-white/[0.07] hover:border-white/[0.16] transition-colors group"
                style={{ borderRadius: 6 }}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] group-hover:text-[#f4efe9] transition-colors">
                  Work through a situation
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#3a3733] group-hover:text-[#f4efe9] transition-colors">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  )

  // ─── CENTER PANEL — main dashboard ───────────────────────────────────────
  const main = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4efe9]">Your Alignment</span>
        {!loading && brief && (
          <Link
            href="/apps/alignment/workspace"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47] hover:text-[#f4efe9] transition-colors"
          >
            Workspace →
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 md:px-10 pt-10 pb-12 max-w-3xl">

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <p className="text-[13px] text-[#4f4b47] leading-relaxed pt-8">{error}</p>
        )}

        {!loading && brief && (
          <AnimatePresence>
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease }}
            >
              {/* 1. Hero */}
              <Hero data={brief.hero} delay={0.05} />

              {/* 2. Alignment view */}
              <AlignmentView blocks={brief.aligned} delay={0.15} />

              <Divider />

              {/* 3. Misalignment view */}
              <MisalignmentView
                over={brief.misaligned?.over ?? []}
                under={brief.misaligned?.under ?? []}
                delay={0.25}
              />

              {/* 4. Current drift (optional) */}
              {brief.currentDrift && brief.currentDrift.length > 0 && (
                <>
                  <Divider />
                  <CurrentDrift lines={brief.currentDrift} delay={0.35} />
                </>
              )}

              <Divider />

              {/* 5. Action panel */}
              <ActionPanel lines={brief.action} delay={0.4} />

              {/* 6. Enter workspace */}
              <div className="mt-10">
                <EnterWorkspace href={brief.workspaceHref || "/apps/alignment/workspace"} delay={0.5} />
              </div>
            </motion.div>
          </AnimatePresence>
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