"use client"
import * as React from "react"
import { SpaceShell } from "@/components/workspace/space-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DefragPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const handleExplain = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setResult(null)
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to explain")
      }
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_source: "DEFRAG",
          title: result.title || result.activePattern || "Defrag Result",
          payload: result,
          content: result.summary || ""
        })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to save")
      }
      setSaveSuccess(true)
    } catch (err: any) {
      alert("Save failed: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em]">Library</h3>
      </div>
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-mono text-[#3F3F46] leading-relaxed">Save useful Results here so you can return before the old pattern takes over again.</p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-px">
      <div className="border border-white/[0.06] bg-[#080808] p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Baseline Design</p>
        <p className="text-xs text-[#71717A]">Your Baseline Design gives the system context before you describe this moment.</p>
      </div>
      
      {result && (
        <>
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-3">
             <Button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="w-full rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8"
              >
                {isSaving ? "Saving..." : saveSuccess ? "Saved to Library" : "Save to Sovereign"}
              </Button>
          </div>
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Audio Overview</p>
            <p className="text-xs text-[#52525B]">Audio Overview is not available for this Result yet.</p>
          </div>
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Watch Preview</p>
            <p className="text-xs text-[#52525B]">Watch Preview is not available for this Result yet.</p>
          </div>
        </>
      )}
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 max-w-sm mx-auto opacity-50">
        <div className="w-10 h-10 border border-white/[0.08] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#71717A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="gap-2 flex flex-col">
          <h2 className="text-base font-medium text-[#FAFAFA] tracking-tight">What’s happening right now?</h2>
          <p className="text-xs text-[#52525B] font-mono leading-relaxed">
            Understand what is active in the moment and what response gives it a better chance.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-4 font-mono">
          {error}
        </div>
      )}

      <div className="border border-white/[0.08] bg-[#080808] focus-within:border-white/[0.18] transition-colors duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the situation, pressure, or pattern you want to understand."
          className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3F3F46] resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleExplain();
            }
          }}
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-[#3F3F46] font-mono tracking-wide">ENTER TO DEFRAG</span>
          <Button
            size="sm"
            onClick={handleExplain}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Running..." : "Defrag"}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderSection = (title: string, content: any, isArray: boolean = false) => {
    if (!content) return null;
    return (
      <div className="border-b border-white/[0.06] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
        <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">{title}</h4>
        {isArray ? (
          <ul className="list-disc pl-4 space-y-2">
            {Array.isArray(content) ? content.map((item: string, i: number) => (
              <li key={i} className="text-sm text-[#FAFAFA] font-mono leading-relaxed">{item}</li>
            )) : <li className="text-sm text-[#FAFAFA] font-mono leading-relaxed">{String(content)}</li>}
          </ul>
        ) : (
          <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed whitespace-pre-wrap">{String(content)}</p>
        )}
      </div>
    )
  }

  const mainResultArea = (
    <div className="h-full flex flex-col">
      {!result ? (
        <div className="flex-1 flex items-center justify-center border border-white/[0.06] bg-[#080808] p-6 text-center">
          <p className="text-sm text-[#52525B] font-mono leading-relaxed max-w-sm">
            Your Result will appear here in structured sections you can use, save, and return to later.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-white/[0.06] bg-[#080808] p-8">
           {renderSection("Active pattern", result.activePattern)}
           {renderSection("The Repeat", result.theRepeat)}
           {renderSection("Old Role", result.oldRole)}
           {renderSection("What You Learned to Carry", result.whatYouLearnedToCarry)}
           {renderSection("Strain Pattern", result.strainPattern)}
           {renderSection("Gift Under Strain", result.giftUnderStrain)}
           {renderSection("Alignment", result.alignment)}
           
           {result.bestNextResponse && (
             <div className="border-b border-white/[0.06] pb-6 mb-6">
                <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">Best Next Response</h4>
                <p className="text-sm text-[#FAFAFA] font-mono leading-relaxed mb-4">{result.bestNextResponse.summary || String(result.bestNextResponse)}</p>
                {Array.isArray(result.bestNextResponse.phrasing) && result.bestNextResponse.phrasing.length > 0 && (
                   <div className="bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col gap-2">
                      {result.bestNextResponse.phrasing.map((phrase: string, i: number) => (
                        <div key={i} className="text-sm text-[#E4E4E7] font-mono leading-relaxed flex items-start gap-3">
                           <span className="text-[#3F3F46] mt-0.5">↳</span>
                           <span>{phrase}</span>
                        </div>
                      ))}
                   </div>
                )}
             </div>
           )}

           {result.conversationalSteering && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">Steer Toward</h4>
                  <ul className="space-y-2">
                    {Array.isArray(result.conversationalSteering.do) ? result.conversationalSteering.do.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-[#E4E4E7] font-mono flex items-start gap-2">
                        <span className="text-[#10B981]">+</span>
                        <span>{item}</span>
                      </li>
                    )) : <li className="text-sm text-[#E4E4E7] font-mono">{String(result.conversationalSteering)}</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em] mb-3">Avoid</h4>
                  <ul className="space-y-2">
                    {Array.isArray(result.conversationalSteering.avoid) ? result.conversationalSteering.avoid.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-[#E4E4E7] font-mono flex items-start gap-2">
                        <span className="text-[#EF4444]">-</span>
                        <span>{item}</span>
                      </li>
                    )) : null}
                  </ul>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  )

  const mobileTabs = [
    { id: "input", label: "Input", content: mainInputArea },
    { id: "result", label: "Result", content: mainResultArea },
    { id: "context", label: "Context", content: contextContent }
  ]

  // On Desktop we can show Input and Result side by side, or adapt SpaceShell.
  // SpaceShell expects one "main" node. We'll compose them.
  const desktopMain = (
    <div className="flex flex-col h-full gap-6">
       <div className="flex-none">{mainInputArea}</div>
       <div className="flex-1 min-h-0">{mainResultArea}</div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebarContent}
      main={desktopMain}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
