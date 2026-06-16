"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"

export default function CovenantPage() {
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
      const res = await fetch("/api/covenant", {
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
        body: JSON.stringify({ title: input.slice(0, 60) + (input.length > 60 ? "…" : ""), payload: result, workspace_source: "COVENANT" }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveSuccess(true)
    } catch {
      // silent
    } finally {
      setIsSaving(false)
    }
  }

  const BriefSection = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null
    return (
      <div className="border-b border-white/[0.06] pb-7 mb-7 last:border-0 last:pb-0 last:mb-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#76716b] mb-3">{label}</p>
        <p className="text-[15px] text-[#f4efe9] leading-relaxed">{value}</p>
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
          Covenant Briefs save to your Library — private, organized, and yours.
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
            Your Baseline Design is active beneath every Covenant thread and never exposed in outputs.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#76716b] mb-2">About Covenant</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed">
            Faith-context reflection anchored in responsibility. Not as certainty. Not as performance. As faith connected to repair and the next honest step.
          </p>
        </div>
        {result && (
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-10 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved to Library ✓" : "Save Covenant Brief"}
          </button>
        )}
      </div>
    </div>
  )

  const inputArea = (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {!result && (
        <div className="text-center py-8 opacity-60">
          <p className="font-serif text-xl text-[#f4efe9] mb-2">What are you walking through?</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed max-w-sm mx-auto">
            Describe the situation, the relationship, the grief, or the decision. Covenant will bring faith, reflection, and grounded discernment to what you are carrying.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/20 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you are walking through — the relationship, the grief, the decision, the boundary."
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[140px] text-sm p-5 leading-[1.75]"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
        />
        <div className="flex justify-between items-center px-5 py-4 border-t border-white/[0.06]">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#4f4b47]">Enter to run Covenant</span>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="h-9 px-6 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Running…" : "Covenant"}
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
            Your Covenant Brief will appear here — grounded reflection, discernment, and the next honest step.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10">
          {/* Handle both structured and unstructured Covenant responses */}
          {typeof result === "string" ? (
            <p className="text-[15px] text-[#f4efe9] leading-relaxed">{result}</p>
          ) : (
            <>
              <BriefSection label="Covenant Brief" value={result.brief || result.summary || result.response} />
              <BriefSection label="Reflection" value={result.reflection} />
              <BriefSection label="Grounded discernment" value={result.discernment} />
              <BriefSection label="Responsibility" value={result.responsibility} />
              <BriefSection label="Repair" value={result.repair} />
              <BriefSection label="Next honest step" value={result.nextStep || result.next_step} />
              <BriefSection label="Active pattern" value={result.activePattern} />
              <BriefSection label="Best Next Response" value={result.bestNextResponse?.summary || (typeof result.bestNextResponse === "string" ? result.bestNextResponse : undefined)} />
              {/* Fallback: show raw JSON fields if none of the above matched */}
              {!result.brief && !result.summary && !result.response && !result.reflection && !result.discernment && (
                <div>
                  {Object.entries(result).map(([key, val]) => (
                    typeof val === "string" && val.length > 0 ? (
                      <BriefSection key={key} label={key.replace(/([A-Z])/g, " $1").trim()} value={val} />
                    ) : null
                  ))}
                </div>
              )}
            </>
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
      spaceName="Covenant"
      sidebar={sidebar}
      contextPanel={context}
      main={main}
      mobileTabs={[
        { id: "input", label: "Covenant", content: inputArea },
        { id: "result", label: "Brief", content: resultArea },
        { id: "context", label: "Context", content: context },
      ]}
    />
  )
}