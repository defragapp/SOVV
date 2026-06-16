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

function ListSection({ label, items, accent }: { label: string; items?: string[]; accent?: string }) {
  if (!items?.length) return null
  return (
    <div className="border-b border-white/[0.05] pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#e0743a]/60 mb-3">{label}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#a8a29a] leading-relaxed">
            <span className={`${accent || "text-[#e0743a]/50"} shrink-0 mt-0.5`}>→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AlignmentPage() {
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
      .then((d: any) => setLibrary((d.items || []).filter((i: any) => i.workspace_source === "ALIGNMENT")))
      .catch(() => {})
      .finally(() => setLibraryLoading(false))
  }, [saveSuccess])

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
          Active beneath every Alignment thread. Your processing style and relational tendencies shape every response integration.
        </p>
        <a href="/settings" className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#e0743a]/60 hover:text-[#e0743a] transition-colors">
          Edit Baseline Design →
        </a>
      </div>
      <div className="px-5 py-5 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] mb-3">About Alignment</p>
        <p className="text-xs text-[#76716b] leading-relaxed">
          Response integration and action choice. Turn insight into a usable response. See what is yours to carry and what belongs to the other side.
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
            {isSaving ? "Saving…" : saveSuccess ? "Saved ✓" : "Save Alignment Result"}
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
            <p className="text-xs text-[#4f4b47] leading-relaxed">Alignment Results save here. Return before the old pattern takes over again.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {library.map((item) => (
              <div key={item.id} className="px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <p className="text-[10px] text-[#4f4b47] mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-[#a8a29a] leading-snug line-clamp-2">{item.title || "Alignment Result"}</p>
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
          <p className="font-serif text-xl text-[#f4efe9]">What needs to become a response?</p>
          <p className="text-sm text-[#a8a29a] leading-relaxed max-w-xs">
            Describe the insight, the situation, or the decision. Alignment shows you what is yours to carry and what the next concrete step looks like.
          </p>
        </div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-9">
            <Section label="Active now" value={result.active_now || result.activePattern || result.summary || result.response} />
            <Section label="What is yours to carry" value={result.what_is_yours || result.yours || result.whatIsYours} />
            <Section label="What is not yours" value={result.what_is_not_yours || result.notYours || result.whatIsNotYours} />
            <Section label="Strain Pattern" value={result.strain_pattern || result.strainPattern} />
            <Section label="Gift Under Strain" value={result.gift_under_strain || result.giftUnderStrain} />
            <Section label="Alignment" value={result.alignment} />
            <Section label="Best Next Response" value={result.best_next_response || result.bestNextResponse?.summary || (typeof result.bestNextResponse === "string" ? result.bestNextResponse : undefined)} />
            <Section label="Stop repeating" value={result.stop_repeating || result.stopRepeating} />
            <ListSection label="Action choices" items={result.actionChoices || result.actions} />
            <ListSection label="Steer toward" items={result.conversationalSteering?.do || result.steerToward} />
            <ListSection label="Avoid" items={result.conversationalSteering?.avoid || result.avoid} accent="text-red-400/40" />
            {!result.active_now && !result.activePattern && !result.summary && !result.response && !result.what_is_yours && (
              Object.entries(result).map(([key, val]) =>
                typeof val === "string" && val.length > 0
                  ? <Section key={key} label={key.replace(/([A-Z_])/g, " $1").trim()} value={val} />
                  : null
              )
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-6 h-6 border border-white/20 border-t-[#e0743a]/60 rounded-full animate-spin" />
            <p className="text-sm text-[#76716b]">Integrating…</p>
          </div>
        </div>
      )}

      <div className="flex-none">
        {error && <p className="text-sm text-red-400/80 text-center mb-3">{error}</p>}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the insight, the situation, or the decision you need to turn into a response."
            className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[100px] text-sm p-5 leading-[1.75]"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          />
          <div className="flex justify-between items-center px-5 py-3 border-t border-white/[0.06]">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47]">↵ Enter to run Alignment</span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="h-8 px-5 rounded-full bg-[#f4efe9] text-[#08070a] text-xs font-medium tracking-tight transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "…" : "Align"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <SpaceShell
      spaceName="Alignment"
      sidebar={sidebar}
      contextPanel={contextPanel}
      main={main}
      mobileTabs={[
        { id: "input", label: "Alignment", content: main },
        { id: "context", label: "Context", content: sidebar },
        { id: "library", label: "Library", content: contextPanel },
      ]}
    />
  )
}