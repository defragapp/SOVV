"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { Button } from "@/components/ui/button"

export default function CovenantPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleCovenant = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/covenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moment: input })
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
    <div className="flex flex-col h-full bg-[#050505]">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.2em]">Covenant Briefs</h3>
      </div>
      <div className="flex-1 px-6 py-8">
        <p className="text-xs font-mono text-[#71717A] leading-relaxed max-w-[180px]">
          Save useful Results here so you can return before the old pattern takes over again.
        </p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-0 h-full bg-[#050505] border-l border-white/[0.06]">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.2em]">Context</h3>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="border border-white/[0.08] bg-[#080808] p-5 flex flex-col gap-2">
          <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em]">Baseline Design</p>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Your Baseline Design gives the system context before you describe this moment.
          </p>
        </div>
        <div className="border border-white/[0.04] bg-[#050505] p-5 flex flex-col gap-2 opacity-40">
          <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em]">Save to Sovereign</p>
          <p className="text-xs text-[#A1A1AA]">Requires Pro</p>
        </div>
      </div>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8 pt-4 pb-0 max-w-4xl mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto opacity-50">
        <div className="w-12 h-12 border border-white/[0.12] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="gap-3 flex flex-col">
          <h2 className="text-[20px] font-medium text-[#FAFAFA] tracking-tight">Faith-context reflection</h2>
          <p className="text-[13px] text-[#A1A1AA] font-mono leading-relaxed">
            Connect your current moment to grounded reflection.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-4 font-mono">
          {error}
        </div>
      )}

      <div className="border border-white/[0.08] bg-[#080808] focus-within:border-white/[0.22] transition-colors duration-200 shadow-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the moment or pressure..."
          className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3F3F46] resize-none outline-none min-h-[140px] text-sm p-5 leading-[1.75] font-mono"
        />
        <div className="flex justify-between items-center px-5 py-4 border-t border-white/[0.06] bg-[#050505]">
          <span className="text-[10px] text-[#71717A] font-mono tracking-[0.15em] uppercase">ENTER TO REFLECT</span>
          <Button
            size="sm"
            onClick={handleCovenant}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-white/[0.15] bg-[#FAFAFA] text-[#050505] hover:bg-[#E4E4E7] font-mono text-[10px] tracking-[0.15em] uppercase h-9 px-6 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Running..." : "Reflect"}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSection = (title: string, content: any) => {
    if (!content) return null;
    return (
      <div className="border-b border-white/[0.06] pb-8 mb-8 last:border-0 last:pb-0 last:mb-0">
        <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.2em] mb-4">{title}</h4>
        <p className="text-[14px] text-[#FAFAFA] font-mono leading-[1.75] whitespace-pre-wrap">{String(content)}</p>
      </div>
    )
  }

  const mainResultArea = (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {!result ? (
        <div className="flex-1 flex items-center justify-center border border-white/[0.08] bg-[#0A0A0A] p-8 text-center min-h-[240px]">
          <p className="text-[13px] text-[#A1A1AA] font-mono leading-relaxed max-w-[280px]">
            The Covenant space is ready visually, but its backend route is not connected yet.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-white/[0.08] bg-[#0A0A0A] p-8 md:p-12 shadow-xl">
           {renderSection("Moment feels like", result.moment_feels_like)}
           {renderSection("Story Connection", result.story_connection)}
           {renderSection("Reflection Prompt", result.reflection_prompt)}
           {renderSection("Next Step", result.next_step)}
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
      spaceName="Covenant"
      sidebar={sidebarContent}
      main={desktopMain}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
