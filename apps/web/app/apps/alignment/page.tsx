"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"

export default function AlignmentPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setSaveSuccess(false)
    try {
      const res = await fetch("/api/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Failed to process")
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: input.slice(0, 60) + (input.length > 60 ? "…" : ""), payload: result, workspace_source: "ALIGNMENT" }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveSuccess(true)
    } catch {
      // silent
    } finally {
      setIsSaving(false)
    }
  }

  const ResultSection = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null
    return (
      <div className="border-b border-white/[0.06] pb-7 mb-7 last:border-0 last:pb-0 last:mb-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">{label}</p>
        <p className="text-[15px] text-[#f4efe9] leading-relaxed">{value}</p>
      </div>
    )
  }

  const ListSection = ({ label, items, accent }: { label: string; items?: string[]; accent: string }) => {
    if (!items?.length) return null
    return (
      <div className="border-b border-white/[0.06] pb-7 mb-7 last:border-0 last:pb-0 last:mb-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">{label}</p>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#a8a29a] leading-relaxed">
              <span className={`${accent} shrink-0 mt-0.5`}>→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Sovereign.os Library</p>
      </div>
      <div className="flex-1 px-6 py-8">
        <p className="text-sm text-[#76716b] leading-relaxed">
          Alignment Results save to your Library — return before the old pattern takes over again.
        </p>
      </div>
    </div>
  )

  const context = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b]">Context</p>
      </div>
      <div className="p-6 flex flex-col gap-5">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-2">Baseline Design</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed">
            Your Baseline Design is active beneath every Alignment thread and never exposed in outputs.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-2">About Alignment</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed">
            Response integration and action choice. Turn insight into a usable response. See what is yours to carry and what belongs to the other side.
          </p>
        </div>
        {result && (
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-10 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved to Library ✓" : "Save Alignment Result"}
          </button>
        )}
      </div>
    </div>
  )

  const inputArea = (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {!result && (
        <div className="text-center py-8 opacity-60">
          <p className="font-serif text-xl text-[#f4efe9] mb-2">What needs to become a response?</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed max-w-sm mx-auto">
            Describe the insight, the situation, or the decision. Alignment will show you what is yours to carry and what the next concrete step looks like.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/20 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the insight, the situation, or the decision you need to turn into a response."
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[140px] text-sm p-5 leading-[1.75]"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
        />
        <div className="flex justify-between items-center px-5 py-4 border-t border-white/[0.06]">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47]">Enter to run Alignment</span>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="h-9 px-6 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Running…" : "Align"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400/80 text-center">{error}</p>}
    </div>
  )

  const resultArea = (
    <div className="max-w-3xl mx-auto w-full">
      {!result ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] flex items-center justify-center py-20 text-center">
          <p className="text-sm text-[#4f4b47] max-w-[260px] leading-relaxed">
            Your Alignment Result will appear here — what is yours, what is not, and the next concrete step.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10">
          <ResultSection label="Alignment Result" value={result.summary || result.response || result.result} />
          <ResultSection label="Active pattern" value={result.activePattern} />
          <ResultSection label="What is yours to carry" value={result.yours || result.whatIsYours} />
          <ResultSection label="What is not yours" value={result.notYours || result.whatIsNotYours} />
          <ResultSection label="Next concrete step" value={result.nextStep || result.next_step || result.bestNextResponse?.summary} />
          <ListSection label="Action choices" items={result.actionChoices || result.actions} accent="text-[#e0743a]/60" />
          <ListSection label="Steer toward" items={result.conversationalSteering?.do || result.steerToward} accent="text-[#e0743a]/60" />
          <ListSection label="Avoid" items={result.conversationalSteering?.avoid || result.avoid} accent="text-red-400/50" />
          {/* Fallback: show all string fields if none matched */}
          {!result.summary && !result.response && !result.result && !result.activePattern && (
            <div>
              {Object.entries(result).map(([key, val]) => (
                typeof val === "string" && val.length > 0 ? (
                  <ResultSection key={key} label={key.replace(/([A-Z])/g, " $1").trim()} value={val} />
                ) : null
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const main = (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex-none">{inputArea}</div>
      <div className="flex-1 min-h-0 overflow-y-auto">{resultArea}</div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebar}
      contextPanel={context}
      main={main}
      mobileTabs={[
        { id: "input", label: "Alignment", content: inputArea },
        { id: "result", label: "Result", content: resultArea },
        { id: "context", label: "Context", content: context },
      ]}
    />
  )
}