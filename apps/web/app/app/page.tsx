"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import Link from "next/link"

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
  payload?: any
}

function spaceLabel(source: string): string {
  if (source === "DEFRAG") return "Defrag"
  if (source === "COVENANT") return "Covenant"
  if (source === "ALIGNMENT") return "Alignment"
  return source
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function extractPreview(item: LibraryItem): string {
  try {
    const p = typeof item.payload === "string" ? JSON.parse(item.payload) : item.payload
    return p?.activePattern || p?.whatIsTrue || p?.pattern || p?.summary || ""
  } catch {
    return ""
  }
}

export default function LibraryPage() {
  const [items, setItems] = React.useState<LibraryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [recurringPattern, setRecurringPattern] = React.useState<string | null>(null)
  const [sessionCount, setSessionCount] = React.useState(0)
  const [proGated, setProGated] = React.useState(false)
  const [checkoutResult, setCheckoutResult] = React.useState<"upgraded" | "canceled" | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("upgraded") === "1") {
        setCheckoutResult("upgraded")
        // Clean URL
        window.history.replaceState({}, "", "/app")
        // Reload tier data
        setTimeout(() => window.location.reload(), 2000)
      } else if (params.get("canceled") === "1") {
        setCheckoutResult("canceled")
        window.history.replaceState({}, "", "/app")
      }
    }
  }, [])

  React.useEffect(() => {
    fetch("/api/memory", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => {
        if (d?.recurringPattern) setRecurringPattern(d.recurringPattern)
        if (d?.sessionCount) setSessionCount(d.sessionCount)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    fetch("/api/library", { credentials: "include" })
      .then(r => {
        if (r.status === 403) { setProGated(true); return { items: [] } }
        return r.json()
      })
      .then(d => setItems((d as any).items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-11 flex items-center border-b border-white/[0.06] shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">Sovereign.os Library</p>
      </div>
      <div className="px-5 pt-5 pb-5">
        <p className="text-[12px] text-[#4f4b47] leading-relaxed">
          The private record of what helped. Return here before the moment passes.
        </p>
        <div className="mt-6 flex flex-col gap-1">
          {["Defrag", "Alignment", "Covenant"].map(space => (
            <p key={space} className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
              {space}
            </p>
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
      <div className="px-5 pt-5">
        <p className="text-[12px] text-[#4f4b47] leading-relaxed">
          Your Baseline Design gives the system context before you describe this moment.
        </p>
        <a
          href="/settings"
          className="inline-block mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#a8a29a] transition-colors"
        >
          Baseline Design →
        </a>
      </div>
    </div>
  )

  const main = (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-3">Library</p>
        <h1 className="font-serif text-[28px] text-[#f4efe9] leading-tight tracking-[-0.02em]">
          What you've saved.
        </h1>
        <p className="text-[13px] text-[#76716b] leading-relaxed mt-2">
          Results from Defrag, Alignment, and Covenant. Return before the pattern takes over again.
        </p>
        {checkoutResult === "upgraded" && (
          <div className="mt-4 px-4 py-3 border border-[#e0743a]/30 bg-[#e0743a]/[0.05] flex items-center gap-3" style={{ borderRadius: "var(--radius-container)" }}>
            <span className="w-1.5 h-1.5 rounded-sm bg-[#e0743a]/60 shrink-0" />
            <p className="text-[13px] text-[#f4efe9]">Welcome to Pro. Your Library, Covenant, and Alignment spaces are now active.</p>
          </div>
        )}
        {checkoutResult === "canceled" && (
          <div className="mt-4 px-4 py-3 border border-white/[0.06] bg-white/[0.02] flex items-center gap-3" style={{ borderRadius: "var(--radius-container)" }}>
            <span className="w-1.5 h-1.5 rounded-sm bg-[#4f4b47] shrink-0" />
            <p className="text-[13px] text-[#76716b]">Checkout canceled. You're still on the free plan.</p>
          </div>
        )}
        {recurringPattern && sessionCount >= 3 && (
          <div className="mt-5 px-4 py-3 border border-white/[0.06] bg-white/[0.02]" style={{ borderRadius: "var(--radius-container)" }}>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#4f4b47] mb-1">
              Most common pattern · {sessionCount} sessions
            </p>
            <p className="text-[12px] text-[#a8a29a] leading-relaxed italic">
              "{recurringPattern.length > 100 ? recurringPattern.slice(0, 100) + "…" : recurringPattern}"
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-4 h-4 border border-white/[0.15] border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : proGated ? (
        <div className="border border-[#e0743a]/20 bg-[#e0743a]/[0.03] flex flex-col items-center justify-center py-16 text-center px-8" style={{ borderRadius: "var(--radius-container)" }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-4">Pro required</span>
          <p className="text-[14px] text-[#f4efe9] mb-3">Library requires Pro.</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed max-w-xs mb-6">
            Save and return to results from Defrag, Alignment, and Covenant. Upgrade to Pro to unlock your Library.
          </p>
          <a href="/pricing" className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#f4efe9] bg-[#e0743a]/20 hover:bg-[#e0743a]/30 transition-colors border border-[#e0743a]/30 px-5 py-2.5" style={{ borderRadius: "var(--radius-button)" }}>
            Upgrade to Pro →
          </a>
        </div>
      ) : items.length === 0 ? (
        <div className="border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center py-16 text-center px-8" style={{ borderRadius: "var(--radius-container)" }}>
          <p className="text-[14px] text-[#f4efe9] mb-3">Your Library is empty.</p>
          <p className="text-[12px] text-[#76716b] leading-relaxed max-w-xs mb-6">
            Save results from Defrag, Alignment, or Covenant. Return before the pattern takes over again.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs mb-8">
            {[
              { label: "What's active", preview: "The pattern organizing this moment." },
              { label: "What changes this", preview: "One clear move." },
              { label: "Next move", preview: "Say the part that matters." },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 px-4 py-3 border border-white/[0.05] bg-white/[0.02] text-left" style={{ borderRadius: "var(--radius-container)" }}>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] mb-0.5">{row.label}</p>
                  <p className="text-[11px] text-[#76716b] italic">{row.preview}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/apps/defrag"
            className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#76716b] hover:text-[#f4efe9] transition-colors border border-white/[0.08] px-4 py-2 hover:border-white/[0.16]"
            style={{ borderRadius: "var(--radius-button)" }}
          >
            Start with Defrag →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border border-white/[0.06] overflow-hidden" style={{ borderRadius: "var(--radius-container)" }}>
          {items.map((item, i) => {
            const preview = extractPreview(item)
            return (
              <Link
                key={item.id}
                href={`/apps/defrag/${item.id}`}
                className="block px-6 py-5 border-b border-white/[0.05] last:border-0 glow-card-hover group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4b47] border border-white/[0.07] px-2 py-0.5"
                      style={{ borderRadius: "var(--radius-minimal)" }}
                    >
                      {spaceLabel(item.workspace_source)}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#4f4b47] shrink-0">{formatDate(item.created_at)}</span>
                </div>
                <p className="text-[14px] text-[#c8c2bc] group-hover:text-[#f4efe9] transition-colors leading-snug mb-1">
                  {item.title || "Untitled"}
                </p>
                {preview && (
                  <p className="text-[12px] text-[#4f4b47] leading-relaxed line-clamp-2">{preview}</p>
                )}
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