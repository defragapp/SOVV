"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"

interface LibraryItem {
  id: string
  title: string
  workspace_source: string
  created_at: string
}

function Section({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="border-b border-white/[0.05] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-2">{label}</p>
      <p className="text-[15px] text-[#f4efe9] leading-[1.7]">{value}</p>
    </div>
  )
}

export default function CovenantPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [library, setLibrary] = React.useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/history", { credentials: "include" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then((d: any) => setLibrary((d.items || []).filter((i: any) => i.workspace_source === "COVENANT")))
      .catch(() => {})
      .finally(() => setLibraryLoading(false))
  }, [saveSuccess])

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
    } catch { /* silent */ } finally {
      setIsSaving(false)
    }
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#76716b]">Context</p>
      </div>
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">Your Baseline Design</p>
        <p className="text-xs text-[#76716b] leading-relaxed mb-3">
          Active beneath every Covenant thread. Your emotional architecture and relational tendencies ground every reflection.
        </p>
        <a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#e0743a]/60 hover:text-[#e0743a] transition-colors">
          Edit Baseline Design →
        </a>
      </div>
      <div className="px-5 py-5 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">About Covenant</p>
        <p className="text-xs text-[#76716b] leading-relaxed">
          Faith-context reflection anchored in responsibility. Not as certainty. Not as performance. As faith connected to repair and the next honest step.
        </p>
      </div>
    </div>
  )

  const contextPanel = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#76716b]">Library</p>
      </div>
      {result && (
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="w-full h-9 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save Covenant Brief"}
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {libraryLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-4 h-4 border border-white/20 border-t-[#f4efe9]/40 rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-[#4f4b47] leading-relaxed">Covenant Briefs save here. Private, organized, and yours.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {library.map((item) => (
              <div key={item.id} className="px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <p className="text-[10px] text-[#4f4b47] mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-[#a8a29a] leading-snug line-clamp-2">{item.title || "Covenant Brief"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const main = (
    <div className="flex flex-col gap-6 h-full max-w-2xl mx-auto w-full">
      {!result && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-50 py-12">
          <p className="font-serif text-xl text-[#f4efe9]">What are you walking through?</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed max-w-xs">
            Describe the relationship, the grief, the decision, or the boundary. Covenant brings faith, reflection, and grounded discernment to what you are carrying.
          </p>
        </div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-9">
            {typeof result === "string" ? (
              <p className="text-[15px] text-[#f4efe9] leading-[1.7]">{result}</p>
            ) : (
              <>
                <Section label="Covenant Brief" value={result.brief || result.summary || result.response} />
                <Section label="The moment feels like" value={result.moment_feels_like} />
                <Section label="Story connection" value={result.story_connection} />
                <Section label="Reflection" value={result.reflection} />
                <Section label="Grounded discernment" value={result.discernment} />
                <Section label="Responsibility" value={result.responsibility} />
                <Section label="Repair" value={result.repair} />
                <Section label="Reflection prompt" value={result.reflection_prompt} />
                <Section label="Next honest step" value={result.next_step || result.nextStep} />
                {!result.brief && !result.summary && !result.response && !result.moment_feels_like && (
                  Object.entries(result).map(([key, val]) =>
                    typeof val === "string" && val.length > 0
                      ? <Section key={key} label={key.replace(/([A-Z_])/g, " $1").trim()} value={val} />
                      : null
                  )
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-6 h-6 border border-white/20 border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-sm text-[#76716b]">Reflecting…</p>
          </div>
        </div>
      )}

      <div className="flex-none">
        {error && <p className="text-sm text-red-400/80 text-center mb-3">{error}</p>}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you are walking through — the relationship, the grief, the decision, the boundary."
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[100px] text-sm p-5 leading-[1.75]"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          />
          <div className="flex justify-between items-center px-5 py-3 border-t border-white/[0.06]">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">↵ Enter to run Covenant</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "…" : "Covenant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Covenant"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "input", label: "Covenant", content: main },
        { id: "context", label: "Context", content: sidebar },
        { id: "library", label: "Library", content: contextPanel },
      ]}
    />
  )
}