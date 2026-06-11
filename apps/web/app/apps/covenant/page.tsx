"use client"
import * as React from "react"
import { SpaceShell } from "@/components/workspace/space-shell"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.2em]">Covenant Briefs</h3>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="gap-2 flex flex-col">
          <h2 className="text-base font-medium text-foreground tracking-tight">Faith-context reflection</h2>
          <p className="text-xs text-foreground-disabled font-mono leading-relaxed">
            Connect your current moment to grounded reflection.
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
          placeholder="Describe the moment or pressure..."
          className="w-full bg-transparent text-foreground placeholder:text-foreground-disabled resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-border">
          <span className="text-[10px] text-foreground-disabled font-mono tracking-wide">ENTER TO REFLECT</span>
          <Button
            size="sm"
            onClick={handleCovenant}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-border-hover bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
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
            The Covenant space is ready visually, but its backend route is not connected yet.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-border bg-surface p-8">
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
    {
      id: "result",
      label: "Brief",
      content: (

        <div className="flex flex-col gap-6 p-4">
          <div className="border-b border-border pb-6">
            <p className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.2em] mb-4">The Story in Plain Language</p>
            <p className="text-sm text-foreground font-mono leading-relaxed">The desire to fix it immediately is bypassing the need for actual repair. True repair requires waiting for the other person to be ready to hear it.</p>
          </div>
          <div className="border-b border-border pb-6">
            <p className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.2em] mb-4">The Scripture Connection</p>
            <p className="text-sm text-foreground font-mono leading-relaxed opacity-80">&quot;Let every person be quick to hear, slow to speak, slow to anger.&quot;<br/>— James 1:19</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.2em] mb-4">One Grounded Response</p>
            <p className="text-sm text-foreground font-mono leading-relaxed">Wait. When the time is right, take responsibility for your part without expecting them to fix theirs.</p>
          </div>
        </div>

      )
    },
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
      spaceName="Covenant"
      sidebar={sidebarContent}
      main={desktopMain}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
