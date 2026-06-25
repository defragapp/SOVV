"use client"
import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { SpaceShell } from "@/components/spaces/space-shell"
import { getTranslation } from "@/lib/baseline/getTranslation"

const ease = [0.16, 1, 0.3, 1] as const

// ─── Types ─────────────────────────────────────────────────────────────────

interface GlossaryItem { tag: string; label: string }

interface AlignmentLine {
  text: string
  mechanism?: string
  contrast?: string
  sourceTags?: string[]
}

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
            : "border-white/[0.06] text-[#4f4b47] cursor-default"
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

function TagsRow({ tags, glossary }: { tags?: string[]; glossary?: GlossaryItem[] }) {
  if (!tags?.length) return null
  const map = Object.fromEntries((glossary || []).map(g => [g.tag, g.label]))
  return (
    <div className="flex flex-wrap gap-1.5 mt-4">
      {tags.map(tag => <TagChip key={tag} tag={tag} label={map[tag]} />)}
    </div>
  )
}

// ─── Loading skeleton ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse max-w-2xl pt-14 px-6 md:px-10">
      <div className="flex flex-col gap-3">
        <div className="h-9 bg-white/[0.04] w-4/5" style={{ borderRadius: 2 }} />
        <div className="h-9 bg-white/[0.03] w-3/5" style={{ borderRadius: 2 }} />
      </div>
      <div className="h-px bg-white/[0.04] w-full" />
      {[0.85, 0.7, 0.9, 0.65, 0.75].map((w, i) => (
        <div key={i} className="h-[18px] bg-white/[0.03]" style={{ borderRadius: 2, width: `${w * 100}%` }} />
      ))}
      <div className="h-px bg-white/[0.04] w-full" />
      {[0.6, 0.5].map((w, i) => (
        <div key={i} className="h-[14px] bg-white/[0.02]" style={{ borderRadius: 2, width: `${w * 100}%` }} />
      ))}
    </div>
  )
}

// ─── Section label ─────────────────────────────────────────────────────────

function SectionLabel({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <p className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-6 ${dim ? "text-[#4f4b47]" : "text-[#4f4b47]"}`}>
      {children}
    </p>
  )
}

// ─── Divider ───────────────────────────────────────────────────────────────

function Divider({ tight = false }: { tight?: boolean }) {
  return <div className={`h-px bg-white/[0.05] ${tight ? "my-8" : "my-12"}`} />
}

// ─── 1. Hero ───────────────────────────────────────────────────────────────
// Slow sequential reveal — line 1, then line 2 after 180ms, then tags

function Hero({ data }: { data: AlignmentRender["hero"] }) {
  const prefersReduced = useReducedMotion()
  const lines = data.anchor.includes("\n")
    ? data.anchor.split("\n").filter(Boolean)
    : [data.anchor]

  return (
    <div className="mb-14">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={prefersReduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.05 + i * 0.18, ease }}
          className="font-serif text-[clamp(1.6rem,3.8vw,2.4rem)] text-[#f4efe9] leading-[1.2] tracking-[-0.018em] max-w-xl"
        >
          {line}
        </motion.p>
      ))}
      {data.tags && data.tags.length > 0 && (
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 + lines.length * 0.18 + 0.1, ease }}
        >
          <TagsRow tags={data.tags} glossary={data.tagGlossary} />
        </motion.div>
      )}
    </div>
  )
}

// ─── 2. Alignment view ─────────────────────────────────────────────────────
// Open spacing, full opacity, each line as its own thought

function AlignmentView({ blocks, delay = 0 }: { blocks: TraitBlockData[]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!blocks.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
    >
      <SectionLabel>what's available to you</SectionLabel>
      <div className="flex flex-col gap-0">
        {blocks.map((block, bi) => (
          <div key={block.key} className="border-b border-white/[0.05] pb-7 mb-7 last:border-0 last:pb-0 last:mb-0">
            {/* Each line as its own thought — generous line height */}
            <div className="flex flex-col gap-3">
              {block.lines.map((line, li) => (
                <motion.p
                  key={li}
                  initial={prefersReduced ? {} : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: delay + bi * 0.1 + li * 0.07, ease }}
                  className="text-[15px] text-[#f4efe9] leading-[1.7]"
                >
                  {line}
                </motion.p>
              ))}
            </div>
            <TagsRow tags={block.tags} glossary={block.tagGlossary} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── 3. Misalignment view ──────────────────────────────────────────────────
// Compressed spacing, dimmer opacity — same mechanism in distorted states

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
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      <SectionLabel dim>what may be adding weight</SectionLabel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

        {/* Over-expression — too much */}
        {over.length > 0 && (
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">too much</p>
            <div className="flex flex-col gap-0">
              {over.map((block, bi) => (
                <div key={block.key} className="border-b border-white/[0.04] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex flex-col gap-2">
                    {block.lines.map((line, li) => (
                      <motion.p
                        key={li}
                        initial={prefersReduced ? {} : { opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: delay + 0.05 + bi * 0.08 + li * 0.05, ease }}
                        className="text-[13px] text-[#5a5550] leading-[1.65]"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <TagsRow tags={block.tags} glossary={block.tagGlossary} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Under-expression — too little */}
        {under.length > 0 && (
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-5">too little</p>
            <div className="flex flex-col gap-0">
              {under.map((block, bi) => (
                <div key={block.key} className="border-b border-white/[0.04] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex flex-col gap-2">
                    {block.lines.map((line, li) => (
                      <motion.p
                        key={li}
                        initial={prefersReduced ? {} : { opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: delay + 0.1 + bi * 0.08 + li * 0.05, ease }}
                        className="text-[13px] text-[#5a5550] leading-[1.65]"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <TagsRow tags={block.tags} glossary={block.tagGlossary} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── 4. Current drift ──────────────────────────────────────────────────────
// Small, timestamp-like, alive — never dominates

function CurrentDrift({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!lines.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay, ease }}
      className="border-l-2 border-[#e0743a]/20 pl-4 py-1"
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#76716b] mb-2.5">right now</p>
      {lines.slice(0, 2).map((line, i) => (
        <p key={i} className="text-[13px] text-[#4f4b47] leading-[1.6]">{line}</p>
      ))}
    </motion.div>
  )
}

// ─── 5. Action panel ───────────────────────────────────────────────────────
// High contrast, decisive — the clearest thing on the page after the hero

function ActionPanel({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!lines.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      <SectionLabel>the move</SectionLabel>
      <div className="flex flex-col gap-2.5 max-w-lg">
        {lines.slice(0, 2).map((line, i) => (
          <p
            key={i}
            className={`leading-[1.65] ${
              i === 0
                ? "text-[16px] text-[#f4efe9] font-normal"
                : "text-[14px] text-[#a8a29a]"
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

// ─── 6. Enter workspace ────────────────────────────────────────────────────

function EnterWorkspace({ href, delay = 0 }: { href: string; delay?: number }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease }}
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-3 text-[13px] text-[#4f4b47] hover:text-[#f4efe9] transition-colors duration-200"
      >
        <span>go deeper</span>
        <motion.span
          animate={{ x: 0 }}
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2, ease }}
          className="inline-block"
        >
          →
        </motion.span>
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
        if (t?.appRender) setBrief(t.appRender as unknown as AlignmentRender)
        // If translation not available, brief stays null — workspace CTA shown instead
      })
      .catch(() => {
        // Translation unavailable — workspace CTA shown instead
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── LEFT PANEL ──────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Alignment</p>
      </div>
      <div className="px-5 pt-6 pb-5 flex flex-col gap-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">What this is</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Your fixed center. The live sky above you. Alignment uses both to show you the path back to yourself — when a situation, conversation, or decision has pulled you off course.
          </p>
        </div>
        <div className="border-t border-white/[0.04] pt-5 flex flex-col gap-4">
          <div>
            <p className="text-[11px] text-[#4f4b47] font-medium mb-1">Baseline Design</p>
            <p className="text-[11px] text-[#4f4b47] leading-relaxed">Your fixed center. How you naturally operate.</p>
          </div>
          <div>
            <p className="text-[11px] text-[#4f4b47] font-medium mb-1">Live sky</p>
            <p className="text-[11px] text-[#4f4b47] leading-relaxed">The emotional weather you're moving through right now.</p>
          </div>
        </div>
        <div className="border-t border-white/[0.04] pt-5">
          <Link
            href="/apps/alignment/workspace"
            className="flex items-center justify-between group"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] group-hover:text-[#f4efe9] transition-colors">
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
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Action</p>
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
            transition={{ duration: 0.5, delay: 0.8, ease }}
            className="flex flex-col gap-4"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1">The move</p>
            {brief.action.slice(0, 2).map((line, i) => (
              <p key={i} className={`leading-relaxed ${i === 0 ? "text-[13px] text-[#f4efe9]" : "text-[12px] text-[#76716b]"}`}>
                {line}
              </p>
            ))}
            <div className="mt-5 pt-4 border-t border-white/[0.04]">
              <Link
                href="/apps/alignment/workspace"
                className="flex items-center justify-between w-full h-9 px-4 border border-white/[0.06] hover:border-white/[0.14] transition-colors group"
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
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#f4efe9]">Alignment</span>
        {!loading && brief && (
          <Link
            href="/apps/alignment/workspace"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
          >
            Workspace →
          </Link>
        )}
      </div>

      {/* Content — max-w-2xl, generous padding */}
      <div className="flex-1 px-6 md:px-10 pt-12 pb-16 max-w-2xl">

        {loading && <LoadingSkeleton />}
        {!loading && error && (
          <p className="text-[13px] text-[#76716b] leading-relaxed pt-8">{error}</p>
        )}

        {!loading && !brief && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 pt-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Alignment</p>
              <p className="text-[22px] text-[#f4efe9] leading-snug mb-3">
                Find what belongs to you.
              </p>
              <p className="text-[13px] text-[#76716b] leading-relaxed max-w-sm">
                Your Baseline Design and the live sky above you are already here. Alignment shows you what belongs to you, what may be adding weight, and what options are still available.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/apps/alignment/workspace"
                className="inline-flex items-center gap-2 h-9 px-5 border border-[#c8c2bc]/30 hover:border-[#c8c2bc]/50 hover:bg-[#c8c2bc]/5 transition-all"
                style={{ borderRadius: "var(--radius-button)" }}>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#c8c2bc]">Begin →</span>
              </Link>
            </div>
          </motion.div>
        )}

        {!loading && brief && (
          <AnimatePresence>
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease }}
            >
              {/* 1. Hero — sequential line reveal */}
              <Hero data={brief.hero} />

              {/* 2. Alignment view — open, full opacity */}
              <AlignmentView blocks={brief.aligned} delay={0.2} />

              <Divider />

              {/* 3. Misalignment view — compressed, dimmer */}
              <MisalignmentView
                over={brief.misaligned?.over ?? []}
                under={brief.misaligned?.under ?? []}
                delay={0.3}
              />

              {/* 4. Current drift — optional, alive, never dominant */}
              {brief.currentDrift && brief.currentDrift.length > 0 && (
                <>
                  <Divider tight />
                  <CurrentDrift lines={brief.currentDrift} delay={0.4} />
                </>
              )}

              <Divider />

              {/* 5. Action panel — decisive, high contrast */}
              <ActionPanel lines={brief.action} delay={0.45} />

              {/* 6. Enter workspace */}
              <div className="mt-12">
                <EnterWorkspace
                  href={brief.workspaceHref || "/apps/alignment/workspace"}
                  delay={0.55}
                />
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
        { id: "action",  label: "What's still available",    content: contextPanel },
      ]}
    />
  )
}