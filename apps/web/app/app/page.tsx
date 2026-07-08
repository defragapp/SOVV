"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { JourneyHeader } from "@/components/understanding/JourneyHeader"
import Link from "next/link"

interface LibraryPayload {
  activePattern?: string
  whatIsTrue?: string
  pattern?: string
  summary?: string
  alignment?: string
  theRepeat?: string
  bestNextResponse?: { summary?: string } | string
}

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
  payload?: LibraryPayload | string | null
}

function spaceLabel(source: string): string {
  if (source === "DEFRAG") return "Experience"
  if (source === "COVENANT") return "Agreement"
  if (source === "ALIGNMENT") return "Relationship"
  return source
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function parsePayload(payload: LibraryItem["payload"]): LibraryPayload | null {
  if (!payload) return null
  if (typeof payload === "string") {
    try { return JSON.parse(payload) as LibraryPayload } catch { return null }
  }
  return payload
}

function extractPreview(item: LibraryItem): string {
  const p = parsePayload(item.payload)
  if (!p) return ""
  const nextMove = typeof p.bestNextResponse === "string" ? p.bestNextResponse : p.bestNextResponse?.summary
  return p.activePattern || p.whatIsTrue || p.pattern || p.theRepeat || p.alignment || p.summary || nextMove || ""
}

function countBySource(items: LibraryItem[], source: string): number {
  return items.filter(item => item.workspace_source === source).length
}

export default function LibraryPage() {
  const [items, setItems] = React.useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [recurringPattern, setRecurringPattern] = React.useState<string | null>(null)
  const [sessionCount, setSessionCount] = React.useState(0)

  React.useEffect(() => {
    fetch("/api/memory", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { recurringPattern?: string; sessionCount?: number } | null) => {
        if (d?.recurringPattern) setRecurringPattern(d.recurringPattern)
        if (d?.sessionCount) setSessionCount(d.sessionCount)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    fetch("/api/library", { credentials: "include" })
      .then(r => r.json())
      .then((d: { items?: LibraryItem[] }) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const counts = {
    experiences: countBySource(items, "DEFRAG"),
    relationships: countBySource(items, "ALIGNMENT"),
    agreements: countBySource(items, "COVENANT"),
    total: items.length,
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Saved Understanding</p>
      </div>
      <div className="px-5 pt-5 pb-5">
        <p className="text-[12px] text-[#76716b] leading-relaxed">
          The Library is not a transcript archive. It is the record of experiences, patterns, repairs, relationships, and agreements worth carrying forward.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {[
            { label: "Experiences", value: counts.experiences },
            { label: "Relationships", value: counts.relationships },
            { label: "Agreements", value: counts.agreements },
            { label: "All nodes", value: counts.total },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">{row.label}</p>
              <p className="font-mono text-[9px] text-[#76716b]">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const contextPanel = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Continuity</p>
      </div>
      <div className="px-5 pt-5 flex flex-col gap-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-2">What compounds</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed">
            Each saved result becomes context for future clarity. The goal is not to remember every conversation. It is to recognize what keeps repeating.
          </p>
        </div>
        <JourneyHeader active="learning" compact />
        <a
          href="/settings"
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#a8a29a] transition-colors"
        >
          Baseline →
        </a>
      </div>
    </div>
  )

  const main = (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full px-4 md:px-0">
      <div className="pt-8 pb-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#4f4b47] mb-5">Library</p>
        <h1 className="font-serif text-[#f4efe9] text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] tracking-[-0.025em] max-w-2xl">
          Your understanding should not disappear when the conversation ends.
        </h1>
        <p className="mt-4 text-[14px] text-[#76716b] leading-relaxed max-w-lg">
          Save the nodes that matter: experiences, patterns, relationships, repairs, choices, and agreements. Over time, this becomes your map.
        </p>
      </div>

      {recurringPattern && sessionCount >= 3 && (
        <div className="mb-5 px-4 py-3 border border-[#e0743a]/15 bg-[#e0743a]/[0.04]" style={{ borderRadius: "var(--radius-container)" }}>
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-1">
            Recurring pattern · {sessionCount} sessions
          </p>
          <p className="text-[12px] text-[#a8a29a] leading-relaxed italic">
            &ldquo;{recurringPattern.length > 120 ? recurringPattern.slice(0, 120) + "…" : recurringPattern}&rdquo;
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-4 h-4 border border-white/[0.15] border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center py-16 text-center px-8" style={{ borderRadius: "var(--radius-container)" }}>
          <p className="text-[14px] text-[#f4efe9] mb-3">No understanding saved yet.</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed max-w-sm mb-7">
            Start with one lived moment. Defrag will help separate the experience from the pattern, then you can save what is worth carrying forward.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-xl mb-8">
            {[
              { label: "Experience", preview: "What happened." },
              { label: "Pattern", preview: "What keeps repeating." },
              { label: "Clean move", preview: "What changes it." },
            ].map((row) => (
              <div key={row.label} className="px-4 py-3 border border-white/[0.05] bg-white/[0.02] text-left" style={{ borderRadius: "var(--radius-container)" }}>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] mb-1">{row.label}</p>
                <p className="text-[11px] text-[#76716b] italic">{row.preview}</p>
              </div>
            ))}
          </div>
          <Link
            href="/apps/defrag/workspace"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-4 py-2 hover:border-white/[0.16]"
            style={{ borderRadius: "var(--radius-button)" }}
          >
            Tell Defrag what happened →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-white/[0.06] overflow-hidden mb-8" style={{ borderRadius: "var(--radius-container)" }}>
          {items.map((item) => {
            const preview = extractPreview(item)
            return (
              <Link
                key={item.id}
                href={`/apps/defrag/${item.id}`}
                className="block px-6 py-5 border-b border-white/[0.05] last:border-0 glow-card-hover group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] border border-white/[0.07] px-2 py-0.5"
                    style={{ borderRadius: "var(--radius-minimal)" }}
                  >
                    {spaceLabel(item.workspace_source)}
                  </span>
                  <span className="font-mono text-[9px] text-[#4f4b47] shrink-0">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-[14px] text-[#c8c2bc] group-hover:text-[#f4efe9] transition-colors leading-snug mb-1">
                  {item.title || "Untitled"}
                </p>
                {preview && <p className="text-[12px] text-[#4f4b47] leading-relaxed line-clamp-2">{preview}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <SpaceShell
      spaceName="Library"
      sidebar={sidebar}
      main={main}
      contextPanel={contextPanel}
      mobileTabs={[
        { id: "library", label: "Library", content: main },
        { id: "context", label: "Context", content: contextPanel },
      ]}
    />
  )
}
