"use client"
import * as React from "react"

export interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
  payload?: unknown
}

interface LibraryViewProps {
  /** Filter by workspace source — omit to show all */
  workspaceSource?: "DEFRAG" | "ALIGNMENT" | "COVENANT"
  /** Called when user clicks a saved item */
  onSelect?: (item: LibraryItem) => void
  /** Refresh trigger — increment to force a reload */
  refreshKey?: number
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

/**
 * LibraryView — renders the user's saved Library items.
 *
 * Fetches from GET /api/library (optionally filtered by workspace_source).
 * Designed to be embedded in workspace right-panels or standalone pages.
 */
export function LibraryView({ workspaceSource, onSelect, refreshKey = 0 }: LibraryViewProps) {
  const [items, setItems] = React.useState<LibraryItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    const url = workspaceSource
      ? `/api/library?workspace_source=${workspaceSource}`
      : "/api/library"
    fetch(url, { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: { items?: LibraryItem[] }) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [workspaceSource, refreshKey])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="w-4 h-4 border border-white/[0.15] border-t-white/30 rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-[12px] text-[#4f4b47] leading-relaxed px-5 py-8 text-center">
        {workspaceSource
          ? `No saved ${spaceLabel(workspaceSource)} results yet.`
          : "Nothing saved yet. Results you save will appear here."}
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect?.(item)}
          className="text-left px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#4f4b47]">
              {spaceLabel(item.workspace_source)}
            </span>
            <span className="text-[10px] text-[#4f4b47]">
              {formatDate(item.created_at)}
            </span>
          </div>
          <p className="text-[13px] text-[#76716b] group-hover:text-[#f4efe9] transition-colors leading-snug line-clamp-2">
            {item.title}
          </p>
        </button>
      ))}
    </div>
  )
}
