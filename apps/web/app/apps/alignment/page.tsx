"use client"
import * as React from "react"
import { SpaceShell } from "@/components/workspace/space-shell"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function AlignmentPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleAlignment = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to process")
      }
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.2em]">Library</h3>
      </div>
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-mono text-foreground-disabled leading-relaxed">Save useful Results here so you can return before the old pattern takes over again.</p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-px">
      <div className="border border-border bg-surface p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.15em]">Baseline Design</p>
        <p className="text-xs text-foreground-muted">Your Baseline Design gives the system context before you describe this moment.</p>
      </div>
      <div className="border border-border bg-background p-4 flex flex-col gap-1.5 opacity-40">
        <p className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.15em]">Save to Sovereign</p>
        <p className="text-xs text-foreground-disabled">Requires Pro</p>
      </div>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 max-w-sm mx-auto opacity-50">
        <div className="w-10 h-10 border border-border flex items-center justify-center">
          <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="gap-2 flex flex-col">
          <h2 className="text-base font-medium text-foreground tracking-tight">Response integration</h2>
          <p className="text-xs text-foreground-disabled font-mono leading-relaxed">
            Turn your insights into an actionable response.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-4 font-mono">
          {error}
        </div>
      )}

      <div className="border border-border bg-surface focus-within:border-border-hover transition-colors duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you trying to integrate?"
          className="w-full bg-transparent text-foreground placeholder:text-foreground-disabled resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-border">
          <span className="text-[10px] text-foreground-disabled font-mono tracking-wide">ENTER TO ALIGN</span>
          <Button
            size="sm"
            onClick={handleAlignment}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-border-hover bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Running..." : "Align"}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSection = (title: string, content: any) => {
    if (!content) return null;
    return (
      <div className="border-b border-border pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
        <h4 className="text-[10px] font-mono text-foreground-muted uppercase tracking-[0.15em] mb-3">{title}</h4>
        <p className="text-sm text-foreground font-mono leading-relaxed whitespace-pre-wrap">{String(content)}</p>
      </div>
    )
  }

  const mainResultArea = (
    <div className="h-full flex flex-col">
      {!result ? (
        <div className="flex-1 flex items-center justify-center border border-border bg-surface p-6 text-center">
          <p className="text-sm text-foreground-disabled font-mono leading-relaxed max-w-sm">
            Your Alignment Brief will appear here in structured sections you can use, save, and return to later.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-border bg-surface p-8">
           {renderSection("Active Now", result.active_now)}
           {renderSection("What is Yours", result.what_is_yours)}
           {renderSection("What is Not Yours", result.what_is_not_yours)}
           {renderSection("Strain Pattern", result.strain_pattern)}
           {renderSection("Gift Under Strain", result.gift_under_strain)}
           {renderSection("Alignment", result.alignment)}
           {renderSection("Best Next Response", result.best_next_response)}
           {renderSection("Stop Repeating", result.stop_repeating)}
        </div>
      )}
    </div>
  )

  const mobileTabs = [
    { id: "input", label: "Input", content: mainInputArea },
    { id: "result", label: "Result", content: mainResultArea },
    { id: "context", label: "Context", content: contextContent }
  ]

  const desktopMain = (
    <div className="flex flex-col h-full gap-6">
       <div className="flex-none">{mainInputArea}</div>
       <div className="flex-1 min-h-0">{mainResultArea}</div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebarContent}
      main={desktopMain}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
