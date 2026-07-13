"use client"
import * as React from "react"

export interface DefragResult {
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
  sourcesUsed?: { baseline?: boolean; history?: boolean; invitedUsers?: boolean }
  media?: { audioOverviewAvailable?: boolean; watchPreviewAvailable?: boolean }
  signature?: string
  confidence?: { score: number; strength: "low" | "medium" | "high" }
  presence?: { stepDeeperChoices?: Array<"keep_simple" | "show_pattern" | "map_baseline" | "turn_into_action" | "save_pattern" | "go_deeper" | "steady_first"> }
  rail?: {
    baseline?: { pace?: string; stabilizes?: string; responds?: string }
    sky?: { urgency?: string; tolerance?: string; state?: string }
    pattern?: { loop?: string }
  }
}

interface UseDefragRunOptions {
  input: string
  compareMode: boolean
  compareName: string
  messageMode: boolean
  thread: Array<{ input: string; result: DefragResult }>
}

interface UseDefragRunReturn {
  result: DefragResult | null
  streamingText: string
  isLoading: boolean
  error: string
  run: () => Promise<void>
  runWithDepth: (depth: "simple" | "deep") => Promise<void>
  reset: () => void
}

/**
 * useDefragRun
 *
 * Owns the full submit lifecycle for the Defrag workspace:
 * - Message mode (single /api/defrag/message request)
 * - Standard mode (concurrent /api/explain/stream + /api/explain)
 * - Depth resubmit (/api/explain with depth param)
 *
 * State ownership stays here. The workspace page passes input/mode
 * state down and receives result/loading/error back up.
 */
export function useDefragRun({
  input,
  compareMode,
  compareName,
  messageMode,
  thread,
}: UseDefragRunOptions): UseDefragRunReturn {
  const [result, setResult] = React.useState<DefragResult | null>(null)
  const [streamingText, setStreamingText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const reset = React.useCallback(() => {
    setResult(null)
    setStreamingText("")
    setError("")
  }, [])

  const run = React.useCallback(async () => {
    if (!input.trim() || isLoading) return
    setIsLoading(true)
    setError("")
    setResult(null)
    setStreamingText("")

    // ── Message mode ──────────────────────────────────────────────────────────
    if (messageMode) {
      try {
        const res = await fetch("/api/defrag/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: input }),
        })
        const data = await res.json() as {
          error?: string
          whatMightBeActive?: string
          whatTheyMightMean?: string
          yourPattern?: string
          bestNextResponse?: string
          tone?: string
        }
        if (!res.ok) {
          setError(data.error || "Something went wrong.")
          return
        }
        const messageResult: DefragResult = {
          activePattern: data.whatMightBeActive,
          theRepeat: data.whatTheyMightMean,
          alignment: data.yourPattern,
          bestNextResponse: data.bestNextResponse,
          summary: data.tone,
          sourcesUsed: { baseline: true, history: false, invitedUsers: false },
        }
        setResult(messageResult)
      } catch {
        setError("Unable to connect. Check your connection and try again.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    // ── Standard mode: concurrent stream + structured result ──────────────────
    try {
      // Fire streaming request (progressive UI) — errors are silent
      fetch("/api/explain/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      }).then(async (streamRes) => {
        if (!streamRes.ok || !streamRes.body) return
        const reader = streamRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const evtLines = buffer.split("\n\n")
          buffer = evtLines.pop() ?? ""
          for (const line of evtLines) {
            if (!line.startsWith("data: ")) continue
            try {
              const d = JSON.parse(line.slice(6)) as { token?: string; done?: boolean; error?: string }
              if (d.token) setStreamingText(prev => prev + d.token)
              if (d.done || d.error) break
            } catch { /* ignore */ }
          }
        }
      }).catch(() => { /* stream failed, structured result handles it */ })

      // Structured result request (authoritative)
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: input,
          ...(compareMode && compareName.trim() ? {
            target: { id: "compare", relation: "partner" },
            targetName: compareName.trim(),
          } : {}),
          ...(thread.length > 0 ? {
            priorPatterns: thread.slice(-2).map(t => t.result.activePattern).filter(Boolean),
          } : {}),
        }),
      })
      const data = await res.json() as DefragResult & { type?: string; error?: string; message?: string }
      setStreamingText("")
      if (data.type === "needs_baseline") { setError("needs_baseline"); return }
      if (!res.ok) {
        setError(
          data.error === "daily_limit_reached"
            ? "You've reached your free daily limit. Upgrade to continue."
            : data.message || data.error || "Something went wrong."
        )
        return
      }
      setResult(data)
    } catch {
      setError("Unable to connect. Check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [input, compareMode, compareName, messageMode, thread, isLoading])

  const runWithDepth = React.useCallback(async (depth: "simple" | "deep") => {
    if (!input.trim() || isLoading) return
    setIsLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: input, depth }),
      })
      if (!res.ok) return
      const data = await res.json() as DefragResult
      setResult(data)
    } catch {}
    finally { setIsLoading(false) }
  }, [input, isLoading])

  return { result, streamingText, isLoading, error, run, runWithDepth, reset }
}
