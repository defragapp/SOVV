"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
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
    <div className="flex flex-col h-full bg-surface">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em]">Alignment</h3>
      </div>
      <div className="flex-1 px-6 py-8">
        <p className="text-xs font-sans font-medium text-[#76716b] leading-relaxed max-w-[180px]">
          Save useful Results here so you can return before the old pattern takes over again.
        </p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-0 h-full bg-surface border-l border-border">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em]">Context</h3>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="border border-border bg-surface p-5 flex flex-col gap-2">
          <p className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.15em]">Baseline Design</p>
          <p className="text-xs text-[#a8a29a] leading-relaxed">
            Your Baseline Design gives the system context before you describe this moment.
          </p>
        </div>
        <div className="border border-border bg-surface p-5 flex flex-col gap-2 opacity-40">
          <p className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.15em]">Save to Sovereign</p>
          <p className="text-xs text-[#a8a29a]">Requires Pro</p>
        </div>
      </div>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8 pt-4 pb-0 max-w-4xl mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto opacity-50">
        <div className="w-12 h-12 border border-border flex items-center justify-center">
          <svg className="w-5 h-5 text-[#a8a29a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="gap-3 flex flex-col">
          <h2 className="text-[20px] font-medium text-[#f4efe9] tracking-tight">Response integration</h2>
          <p className="text-[13px] text-[#a8a29a] font-sans font-medium leading-relaxed">
            Turn your insights into an actionable response.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-4 font-sans font-medium">
          {error}
        </div>
      )}

      <div className="border border-border bg-surface focus-within:border-border transition-colors duration-200 shadow-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you trying to integrate?"
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[140px] text-sm p-5 leading-[1.75] font-sans font-medium"
        />
        <div className="flex justify-between items-center px-5 py-4 border-t border-border bg-surface">
          <span className="text-[10px] text-[#76716b] font-sans font-medium tracking-[0.15em] uppercase">ENTER TO ALIGN</span>
          <Button
            size="sm"
            onClick={handleAlignment}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-border bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] font-sans font-medium text-[10px] tracking-[0.15em] uppercase h-9 px-6 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
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
      <div className="border-b border-border pb-8 mb-8 last:border-0 last:pb-0 last:mb-0">
        <h4 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em] mb-4">{title}</h4>
        <p className="text-[14px] text-[#f4efe9] font-sans font-medium leading-[1.75] whitespace-pre-wrap">{String(content)}</p>
      </div>
    )
  }

  const mainResultArea = (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {!result ? (
        <div className="flex-1 flex items-center justify-center border border-border bg-surface p-8 text-center min-h-[240px]">
          <p className="text-[13px] text-[#a8a29a] font-sans font-medium leading-relaxed max-w-[280px]">
            Your Alignment Brief will appear here in structured sections you can use, save, and return to later.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-border bg-surface p-8 md:p-12 shadow-xl">
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
    <div className="flex flex-col h-full gap-8">
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
