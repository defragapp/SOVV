"use client"
import * as React from "react"

export interface Baseline {
  dob: string
  tob: { type: "exact" | "approx"; value: string }
  pob: string
}

export interface BaselineStatement {
  statement: string
  chips: string[]
}

export interface BaselineContextResult {
  baseline: Baseline | null
  baselineLoading: boolean
  baselineStatements: BaselineStatement[]
  statementsLoading: boolean
  datasetStatus: "none" | "pending" | "ready" | "failed" | null
  recurringPattern: string | null
  sessionCount: number
}

export interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
}

export interface LibraryContextResult {
  library: LibraryItem[]
  libraryLoading: boolean
  refreshLibrary: () => void
}

/**
 * useBaselineContext
 *
 * Owns baseline fetch, status polling, derived profile statements,
 * and memory/session context. Safe to call once at workspace root.
 */
export function useBaselineContext(): BaselineContextResult {
  const [baseline, setBaseline] = React.useState<Baseline | null>(null)
  const [baselineLoading, setBaselineLoading] = React.useState(true)
  const [baselineStatements, setBaselineStatements] = React.useState<BaselineStatement[]>([])
  const [statementsLoading, setStatementsLoading] = React.useState(false)
  const [datasetStatus, setDatasetStatus] = React.useState<"none" | "pending" | "ready" | "failed" | null>(null)
  const [recurringPattern, setRecurringPattern] = React.useState<string | null>(null)
  const [sessionCount, setSessionCount] = React.useState(0)

  // Fetch baseline
  React.useEffect(() => {
    fetch("/api/baseline", { credentials: "include" })
      .then(r => r.ok ? r.json() : { baseline: null })
      .then((d: { baseline?: Baseline | null }) => setBaseline(d.baseline ?? null))
      .catch(() => {})
      .finally(() => setBaselineLoading(false))
  }, [])

  // Poll dataset status while baseline exists
  React.useEffect(() => {
    if (!baseline) return
    let active = true
    const poll = async () => {
      try {
        const r = await fetch("/api/baseline/status", { credentials: "include" })
        if (!r.ok || !active) return null
        const d = await r.json() as { status?: "none" | "pending" | "ready" | "failed" }
        setDatasetStatus(d.status ?? "none")
        return d.status
      } catch { return null }
    }
    poll().then(status => {
      if (status === "pending") {
        const interval = setInterval(async () => {
          const s = await poll()
          if (s === "ready" || s === "failed" || !active) clearInterval(interval)
        }, 5000)
        return () => { active = false; clearInterval(interval) }
      }
    })
    return () => { active = false }
  }, [baseline])

  // Fetch derived profile statements
  React.useEffect(() => {
    if (!baseline) return
    setStatementsLoading(true)
    fetch("/api/derive-profile", { credentials: "include" })
      .then(r => r.ok ? r.json() : { statements: [] })
      .then((d: { statements?: BaselineStatement[] }) => {
        if (Array.isArray(d.statements) && d.statements.length > 0) {
          setBaselineStatements(d.statements)
        }
      })
      .catch(() => {})
      .finally(() => setStatementsLoading(false))
  }, [baseline])

  // Fetch memory/session context
  React.useEffect(() => {
    fetch("/api/memory", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { recurringPattern?: string; sessionCount?: number } | null) => {
        if (d?.recurringPattern) setRecurringPattern(d.recurringPattern)
        if (d?.sessionCount) setSessionCount(d.sessionCount)
      })
      .catch(() => {})
  }, [])

  return { baseline, baselineLoading, baselineStatements, statementsLoading, datasetStatus, recurringPattern, sessionCount }
}

/**
 * useLibraryContext
 *
 * Owns library fetch and refresh. Refreshes when saveSuccess changes.
 */
export function useLibraryContext(workspaceSource: string, saveSuccess: boolean): LibraryContextResult {
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const refreshLibrary = React.useCallback(() => setRefreshKey(k => k + 1), [])

  React.useEffect(() => {
    setLibraryLoading(true)
    fetch(`/api/library?workspace_source=${workspaceSource}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: { items?: LibraryItem[] }) => setLibrary(d.items || []))
      .catch(() => {})
      .finally(() => setLibraryLoading(false))
  }, [workspaceSource, saveSuccess, refreshKey])

  return { library, libraryLoading, refreshLibrary }
}
