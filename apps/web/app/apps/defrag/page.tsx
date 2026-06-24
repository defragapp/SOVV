"use client"
import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { SpaceShell } from "@/components/spaces/space-shell"
import { getTranslation } from "@/lib/baseline/getTranslation"

const ease = [0.16, 1, 0.3, 1] as const

// ─── Types ─────────────────────────────────────────────────────────────────

interface GlossaryItem { tag: string; label: string }

interface DefragRender {
  hero: { lines: string[]; tags?: string[]; glossary?: GlossaryItem[] }
  activePattern?: { name?: string; lines: string[]; tags?: string[] }
  pressureMap?: { starts?: string[]; moves?: string[]; lands?: string[] }
  loopPreview?: { trigger?: string; reaction?: string; repeat?: string; cost?: string }
  rolePull?: { lines: string[] }
  cleanerMove?: { lines: string[] }
  workspaceHref: string
  // Fallback fields from DefragEntryTranslation shape
  likelyLoops?: Array<{ key: string; label: string; description: string; trigger: string; tags?: string[] }>
  pressurePattern?: { lines: string[]; tags?: string[] }
  repairMoves?: string[]
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
          label ? "border-white/[0.10] text-[#4f4b47] hover:border-white/[0.22] hover:text-[#76716b] cursor-pointer"
                : "border-white/[0.06] text-[#4f4b47] cursor-default"
        }`}
        style={{ borderRadius: 2 }}
        aria-label={label ? `${tag}: ${label}` : tag}
      >
        {tag}
      </button>
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
    </span>
  )
}

function TagsRow({ tags, glossary }: { tags?: string[]; glossary?: GlossaryItem[] }) {
  if (!tags?.length) return null
  const map = Object.fromEntries((glossary || []).map(g => [g.tag, g.label]))
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map(tag => <TagChip key={tag} tag={tag} label={map[tag]} />)}
    </div>
  )
}

// ─── Loading skeleton ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse max-w-2xl pt-12 px-6 md:px-10">
      <div className="flex flex-col gap-3">
        <div className="h-8 bg-white/[0.04] w-4/5" style={{ borderRadius: 2 }} />
        <div className="h-8 bg-white/[0.03] w-3/5" style={{ borderRadius: 2 }} />
      </div>
      <div className="h-px bg-white/[0.04] w-full" />
      {[0.9, 0.7, 0.8, 0.6, 0.75].map((w, i) => (
        <div key={i} className="h-[16px] bg-white/[0.03]" style={{ borderRadius: 2, width: `${w * 100}%` }} />
      ))}
    </div>
  )
}

function SectionLabel({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return <p className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-5 ${dim ? "text-[#4f4b47]" : "text-[#4f4b47]"}`}>{children}</p>
}

function Divider() {
  return <div className="h-px bg-white/[0.05] my-10" />
}

// ─── Normalize translation output → DefragRender ──────────────────────────
// Handles both the DefragEntryTranslation shape and a richer shape

function normalizeDefragRender(appRender: Record<string, unknown>): DefragRender {
  const r = appRender as any

  // Build hero lines
  const heroLines: string[] = []
  if (r.hero?.anchor) heroLines.push(r.hero.anchor)
  else if (Array.isArray(r.hero?.lines)) heroLines.push(...r.hero.lines)

  // Build activePattern from likelyLoops[0] or direct
  let activePattern = r.activePattern
  if (!activePattern && r.likelyLoops?.length) {
    const loop = r.likelyLoops[0]
    activePattern = { name: loop.label, lines: [loop.description, loop.trigger].filter(Boolean), tags: loop.tags }
  }

  // Build pressureMap from pressurePattern
  let pressureMap = r.pressureMap
  if (!pressureMap && r.pressurePattern?.lines?.length) {
    const lines = r.pressurePattern.lines as string[]
    pressureMap = { starts: [lines[0]], moves: lines.slice(1, 2), lands: lines.slice(2, 3) }
  }

  // Build loopPreview from likelyLoops[1] or loop data
  let loopPreview = r.loopPreview
  if (!loopPreview && r.likelyLoops?.length > 1) {
    const loop = r.likelyLoops[1]
    loopPreview = { trigger: loop.trigger, reaction: loop.description, repeat: loop.label }
  }

  // Build rolePull
  let rolePull = r.rolePull
  if (!rolePull && r.pressurePattern?.lines?.length) {
    rolePull = { lines: [r.pressurePattern.lines[r.pressurePattern.lines.length - 1]] }
  }

  // Build cleanerMove from repairMoves or action
  let cleanerMove = r.cleanerMove
  if (!cleanerMove && r.repairMoves?.length) {
    cleanerMove = { lines: r.repairMoves.slice(0, 2) }
  }
  if (!cleanerMove && r.action?.length) {
    cleanerMove = { lines: Array.isArray(r.action) ? r.action.slice(0, 2) : [r.action] }
  }

  return {
    hero: { lines: heroLines, tags: r.hero?.tags, glossary: r.hero?.tagGlossary || r.hero?.glossary },
    activePattern,
    pressureMap,
    loopPreview,
    rolePull,
    cleanerMove,
    workspaceHref: r.workspaceHref || "/apps/defrag/workspace",
    likelyLoops: r.likelyLoops,
    pressurePattern: r.pressurePattern,
    repairMoves: r.repairMoves,
  }
}

// ─── Section components ────────────────────────────────────────────────────

function Hero({ data, delay = 0 }: { data: DefragRender["hero"]; delay?: number }) {
  const prefersReduced = useReducedMotion()
  return (
    <div className="mb-12">
      {data.lines.map((line, i) => (
        <motion.p
          key={i}
          initial={prefersReduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: delay + i * 0.18, ease }}
          className="font-serif text-[clamp(1.6rem,3.8vw,2.4rem)] text-[#f4efe9] leading-[1.2] tracking-[-0.018em] max-w-xl"
        >
          {line}
        </motion.p>
      ))}
      <TagsRow tags={data.tags} glossary={data.glossary} />
    </div>
  )
}

function ActivePattern({ data, delay = 0 }: { data: NonNullable<DefragRender["activePattern"]>; delay?: number }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      <SectionLabel>what's here</SectionLabel>
      {data.name && <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e0743a]/50 mb-4">{data.name}</p>}
      <div className="flex flex-col gap-2.5">
        {data.lines.map((line, i) => (
          <motion.p
            key={i}
            initial={prefersReduced ? {} : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: delay + i * 0.07, ease }}
            className="text-[15px] text-[#f4efe9] leading-[1.7]"
          >
            {line}
          </motion.p>
        ))}
      </div>
      {data.tags && <TagsRow tags={data.tags} />}
    </motion.div>
  )
}

function PressureMap({ data, delay = 0 }: { data: NonNullable<DefragRender["pressureMap"]>; delay?: number }) {
  const prefersReduced = useReducedMotion()
  const hasContent = (data.starts?.length || data.moves?.length || data.lands?.length)
  if (!hasContent) return null

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      <SectionLabel>where pressure is moving</SectionLabel>
      <div className="flex flex-col gap-0">
        {/* Starts */}
        {data.starts?.map((s, i) => (
          <div key={i} className="flex items-start gap-4 py-3 border-b border-white/[0.04]">
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#76716b] shrink-0 w-12 mt-1">starts</span>
            <p className="text-[13px] text-[#76716b] leading-[1.6]">{s}</p>
          </div>
        ))}
        {/* Moves */}
        {data.moves?.map((m, i) => (
          <div key={i} className="flex items-start gap-4 py-3 border-b border-white/[0.04]">
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#76716b] shrink-0 w-12 mt-1">moves</span>
            <p className="text-[13px] text-[#5a5550] leading-[1.6]">{m}</p>
          </div>
        ))}
        {/* Lands */}
        {data.lands?.map((l, i) => (
          <div key={i} className="flex items-start gap-4 py-3">
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#76716b] shrink-0 w-12 mt-1">lands</span>
            <p className="text-[13px] text-[#4f4b47] leading-[1.6]">{l}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function LoopPreview({ data, delay = 0 }: { data: NonNullable<DefragRender["loopPreview"]>; delay?: number }) {
  const prefersReduced = useReducedMotion()
  const hasContent = data.trigger || data.reaction || data.repeat || data.cost
  if (!hasContent) return null

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      <SectionLabel dim>the repeat</SectionLabel>
      <div className="border border-white/[0.05] overflow-hidden" style={{ borderRadius: 10 }}>
        {[
          { label: "trigger", value: data.trigger },
          { label: "reaction", value: data.reaction },
          { label: "repeat", value: data.repeat },
          { label: "cost", value: data.cost },
        ].filter(r => r.value).map((row, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0">
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] shrink-0 w-14 mt-0.5">{row.label}</span>
            <p className="text-[13px] text-[#5a5550] leading-[1.6]">{row.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function RolePull({ data, delay = 0 }: { data: NonNullable<DefragRender["rolePull"]>; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!data.lines.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      <SectionLabel dim>what role it pulls you into</SectionLabel>
      <div className="flex flex-col gap-2">
        {data.lines.map((line, i) => (
          <p key={i} className="text-[13px] text-[#5a5550] leading-[1.65]">{line}</p>
        ))}
      </div>
    </motion.div>
  )
}

function CleanerMove({ data, delay = 0 }: { data: NonNullable<DefragRender["cleanerMove"]>; delay?: number }) {
  const prefersReduced = useReducedMotion()
  if (!data.lines.length) return null
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      <SectionLabel>what stops feeding it</SectionLabel>
      <div className="flex flex-col gap-2 max-w-lg">
        {data.lines.slice(0, 2).map((line, i) => (
          <p key={i} className={`leading-[1.65] ${i === 0 ? "text-[16px] text-[#f4efe9]" : "text-[14px] text-[#a8a29a]"}`}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

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
        <span>open the pattern</span>
        <motion.span animate={{ x: 0 }} whileHover={{ x: 3 }} transition={{ duration: 0.2, ease }} className="inline-block">→</motion.span>
      </Link>
    </motion.div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function DefragEntryPage() {
  const [brief, setBrief] = React.useState<DefragRender | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    getTranslation("defrag")
      .then(t => {
        if (t?.appRender) setBrief(normalizeDefragRender(t.appRender as Record<string, unknown>))
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
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Defrag</p>
      </div>
      <div className="px-5 pt-6 pb-5 flex flex-col gap-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Before you move</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Defrag separates the moment from the pattern. It shows you what is active beneath the argument, the silence, the message, or the grief — and gives you the clearest next response.
          </p>
        </div>
        <div className="border-t border-white/[0.04] pt-5 flex flex-col gap-3">
          {["Something keeps happening", "I need to respond well", "I am carrying too much", "Boundaries you can't hold"].map(item => (
            <div key={item} className="flex items-start gap-2">
              <span className="text-[#e0743a]/30 text-[10px] mt-0.5 shrink-0">—</span>
              <span className="text-[11px] text-[#4f4b47] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.04] pt-5">
          <Link href="/apps/defrag/workspace" className="flex items-center justify-between group">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] group-hover:text-[#f4efe9] transition-colors">Open workspace</span>
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
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Next move</p>
      </div>
      <div className="px-5 pt-6 pb-5">
        {loading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-4 bg-white/[0.04] w-full" style={{ borderRadius: 2 }} />
            <div className="h-4 bg-white/[0.03] w-3/4" style={{ borderRadius: 2 }} />
          </div>
        ) : brief?.cleanerMove ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8, ease }} className="flex flex-col gap-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/40 mb-1">What belongs to you</p>
            {brief.cleanerMove.lines.slice(0, 2).map((line, i) => (
              <p key={i} className={`leading-relaxed ${i === 0 ? "text-[13px] text-[#f4efe9]" : "text-[12px] text-[#76716b]"}`}>{line}</p>
            ))}
            <div className="mt-5 pt-4 border-t border-white/[0.04]">
              <Link href="/apps/defrag/workspace"
                className="flex items-center justify-between w-full h-9 px-4 border border-white/[0.06] hover:border-white/[0.14] transition-colors group"
                style={{ borderRadius: 6 }}>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] group-hover:text-[#f4efe9] transition-colors">Work through a moment</span>
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
      <div className="h-11 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#f4efe9]">Defrag</span>
        {!loading && brief && (
          <Link href="/apps/defrag/workspace" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
            Workspace →
          </Link>
        )}
      </div>

      <div className="flex-1 px-6 md:px-10 pt-12 pb-16 max-w-2xl">
        {loading && <LoadingSkeleton />}
        {!loading && !brief && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 pt-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/40 mb-3">Defrag</p>
              <p className="text-[22px] text-[#f4efe9] leading-snug mb-3">
                Separate the moment from the pattern.
              </p>
              <p className="text-[13px] text-[#76716b] leading-relaxed max-w-sm">
                Describe what is happening. Defrag shows you what is active beneath the argument, the silence, or the message — and gives you the clearest next move.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {[
                { label: "I need clarity", href: "/apps/defrag/workspace?prompt=I%20need%20clarity", desc: "See the moment before you move." },
                { label: "I am carrying too much", href: "/apps/alignment/workspace?prompt=I%20am%20carrying%20too%20much", desc: "Separate what belongs to you from what does not." },
                { label: "I need to respond well", href: "/apps/alignment/workspace?prompt=I%20need%20to%20respond%20well", desc: "Find words that do not add weight." },
                { label: "I am making this heavier", href: "/apps/alignment/workspace?prompt=I%20am%20making%20this%20heavier", desc: "See what you may be adding." },
                { label: "I am pulling back", href: "/apps/defrag/workspace?prompt=I%20am%20pulling%20back", desc: "Understand what silence is protecting." },
                { label: "This feels bigger than this", href: "/apps/covenant/workspace?prompt=This%20feels%20bigger%20than%20this", desc: "Hold what matters without forcing an answer." },
              ].map(item => (
                <Link key={item.label} href={item.href}
                  className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.02] transition-colors -mx-2 px-2"
                  style={{ borderRadius: 2 }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-[#c8c2bc] leading-snug group-hover:text-[#f4efe9] transition-colors">{item.label}</span>
                    <span className="text-[10px] text-[#4f4b47] leading-relaxed">{item.desc}</span>
                  </div>
                  <span className="text-[#4f4b47] group-hover:text-[#c8c2bc] transition-colors text-[10px] shrink-0 mt-0.5">→</span>
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <Link href="/apps/defrag/workspace"
                className="inline-flex items-center gap-2 h-9 px-5 border border-[#c8c2bc]/30 hover:border-[#c8c2bc]/50 hover:bg-[#c8c2bc]/5 transition-all"
                style={{ borderRadius: "var(--radius-button)" }}>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#c8c2bc]">Begin →</span>
              </Link>
            </div>
          </motion.div>
        )}
        {!loading && brief && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease }}>

            {/* 1. Hero */}
            <Hero data={brief.hero} delay={0.05} />

            {/* 2. Active pattern */}
            {brief.activePattern && <ActivePattern data={brief.activePattern} delay={0.2} />}

            {brief.activePattern && <Divider />}

            {/* 3. Pressure map */}
            {brief.pressureMap && <PressureMap data={brief.pressureMap} delay={0.3} />}

            {brief.pressureMap && <Divider />}

            {/* 4. Loop preview */}
            {brief.loopPreview && <LoopPreview data={brief.loopPreview} delay={0.35} />}

            {/* 5. Role pull */}
            {brief.rolePull && (
              <>
                {brief.loopPreview && <Divider />}
                <RolePull data={brief.rolePull} delay={0.4} />
              </>
            )}

            <Divider />

            {/* 6. Cleaner move */}
            {brief.cleanerMove && <CleanerMove data={brief.cleanerMove} delay={0.45} />}

            {/* 7. Enter workspace */}
            <div className="mt-12">
              <EnterWorkspace href={brief.workspaceHref || "/apps/defrag/workspace"} delay={0.55} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "brief",   label: "Defrag",  content: main },
        { id: "context", label: "Context", content: sidebar },
        { id: "move",    label: "Move",    content: contextPanel },
      ]}
    />
  )
}