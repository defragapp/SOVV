"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { Button } from "@/components/ui/button"

export default function DefragPage() {
  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [error, setError] = React.useState("")
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  const handleExplain = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setError("")
    setSaveSuccess(false)
    setAudioUrl(null)
    setAudioError("")
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to process")
      }
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
        body: JSON.stringify({
          title: input.slice(0, 50) + "...",
          payload: result,
          workspace_source: "DEFRAG",
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaveSuccess(true)
    } catch (err: any) {
      console.error("Save error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleGenerateAudio() {
    if (!result) return
    setIsGeneratingAudio(true)
    setAudioError("")
    try {
      const payload = {
        activePattern: result.activePattern,
        theRepeat: result.theRepeat,
        oldRole: result.oldRole,
        giftUnderStrain: result.giftUnderStrain,
        bestNextResponse:
          result.bestNextResponse?.summary || String(result.bestNextResponse),
      }
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: payload }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate audio")
      }
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (err: any) {
      console.error("Audio generation error:", err)
      setAudioError(err.message || "Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const renderSection = (title: string, content: any, isArray: boolean = false) => {
    if (!content) return null
    return (
      <div className="border-b border-white/[0.06] pb-8 mb-8 last:border-0 last:pb-0 last:mb-0">
        <h4 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em] mb-4">
          {title}
        </h4>
        {isArray ? (
          <ul className="list-none space-y-3">
            {Array.isArray(content) ? (
              content.map((item: string, i: number) => (
                <li
                  key={i}
                  className="text-[14px] text-[#f4efe9] font-sans font-medium leading-[1.75] flex items-start gap-3"
                >
                  <span className="text-[#4f4b47] mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-[14px] text-[#f4efe9] font-sans font-medium leading-[1.75]">
                {String(content)}
              </li>
            )}
          </ul>
        ) : (
          <p className="text-[14px] text-[#f4efe9] font-sans font-medium leading-[1.75] whitespace-pre-wrap">
            {String(content)}
          </p>
        )}
      </div>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0c0a0d]">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em]">
          Sovereign.os Library
        </h3>
      </div>
      <div className="flex-1 px-6 py-8">
        <p className="text-xs font-sans font-medium text-[#76716b] leading-relaxed max-w-[180px]">
          The private record of what helped. Return here before the old pattern
          takes over again.
        </p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-0 h-full bg-[#0c0a0d] border-l border-white/[0.06]">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em]">
          Context
        </h3>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-2">
          <p className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.15em]">
            Baseline Design
          </p>
          <p className="text-xs text-[#a8a29a] leading-relaxed">
            Your Baseline Design gives the system context before you describe
            this moment.
          </p>
        </div>

        {result && (
          <div className="flex flex-col gap-6 mt-4">
            <div className="border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="w-full rounded-none border border-white/[0.08] bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] font-sans font-medium text-[10px] tracking-[0.15em] uppercase h-9"
              >
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                  ? "Saved to Library"
                  : "Save to Sovereign"}
              </Button>
            </div>

            <div className="border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-3">
              <p className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.15em]">
                Audio Overview
              </p>
              {audioUrl ? (
                <audio
                  controls
                  src={audioUrl}
                  className="w-full h-8 outline-none filter grayscale sepia opacity-80 mt-1"
                />
              ) : (
                <div className="flex flex-col gap-3 mt-1">
                  <Button
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    variant="ghost"
                    className="w-full rounded-none border border-white/[0.08] bg-transparent text-[#f4efe9] hover:bg-white/[0.04] font-sans font-medium text-[10px] tracking-[0.15em] uppercase h-9"
                  >
                    {isGeneratingAudio ? "Generating..." : "Generate Audio"}
                  </Button>
                  {audioError && (
                    <p className="text-red-400 text-[10px] font-sans font-medium leading-tight">
                      {audioError}
                    </p>
                  )}
                  {!audioError && !isGeneratingAudio && (
                    <p className="text-[10px] text-[#76716b] font-sans font-medium leading-tight">
                      Requires Pro
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-2 opacity-40">
              <p className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.15em]">
                Watch Preview
              </p>
              <p className="text-xs text-[#a8a29a]">
                Watch Preview is not available for this Result yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8 pt-4 pb-0 max-w-4xl mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto opacity-50">
        <div className="w-12 h-12 border border-white/[0.08] flex items-center justify-center">
          <svg
            className="w-5 h-5 text-[#a8a29a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="gap-3 flex flex-col">
          <h2 className="text-[20px] font-medium text-[#f4efe9] tracking-tight">
            What&apos;s happening right now?
          </h2>
          <p className="text-[13px] text-[#a8a29a] font-sans font-medium leading-relaxed">
            Understand what is active in the moment and what response gives it a
            better chance.
          </p>
        </div>
      </div>

      <div className="border border-white/[0.08] bg-surface focus-within:border-border transition-colors duration-200 shadow-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the situation, pressure, or pattern you want to understand."
          className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] resize-none outline-none min-h-[140px] text-sm p-5 leading-[1.75] font-sans font-medium"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleExplain()
            }
          }}
        />
        <div className="flex justify-between items-center px-5 py-4 border-t border-border bg-surface">
          <span className="text-[10px] text-[#76716b] font-sans font-medium tracking-[0.15em] uppercase">
            ENTER TO DEFRAG
          </span>
          <Button
            size="sm"
            onClick={handleExplain}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-white/[0.08] bg-[#f4efe9] text-[#08070a] hover:bg-[#e8e2da] font-sans font-medium text-[10px] tracking-[0.15em] uppercase h-9 px-6 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Running..." : "Defrag"}
          </Button>
        </div>
      </div>
    </div>
  )

  const mainResultArea = (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {!result ? (
        <div className="flex-1 flex items-center justify-center border border-white/[0.08] bg-white/[0.02] p-8 text-center min-h-[240px]">
          <p className="text-[13px] text-[#a8a29a] font-sans font-medium leading-relaxed max-w-[280px]">
            Your Result will appear here in structured sections you can use,
            save, and return to later.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-white/[0.08] bg-white/[0.02] p-8 md:p-12 shadow-xl">
          {renderSection("Active pattern", result.activePattern)}
          {renderSection("The Repeat", result.theRepeat)}
          {renderSection("Old Role", result.oldRole)}
          {renderSection("What You Learned to Carry", result.whatYouLearnedToCarry)}
          {renderSection("Strain Pattern", result.strainPattern)}
          {renderSection("Gift Under Strain", result.giftUnderStrain)}
          {renderSection("Alignment", result.alignment)}

          {result.bestNextResponse && (
            <div className="border-b border-white/[0.06] pb-8 mb-8">
              <h4 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em] mb-4">
                Best Next Response
              </h4>
              <p className="text-[14px] text-[#f4efe9] font-sans font-medium leading-[1.75] mb-5">
                {result.bestNextResponse.summary ||
                  String(result.bestNextResponse)}
              </p>
              {Array.isArray(result.bestNextResponse.phrasing) &&
                result.bestNextResponse.phrasing.length > 0 && (
                  <div className="bg-surface border border-white/[0.08] p-6 flex flex-col gap-3">
                    {result.bestNextResponse.phrasing.map(
                      (phrase: string, i: number) => (
                        <div
                          key={i}
                          className="text-[14px] text-[#a8a29a] font-sans font-medium leading-[1.75] flex items-start gap-3"
                        >
                          <span className="text-[#4f4b47] mt-0.5 shrink-0">
                            ↳
                          </span>
                          <span>{phrase}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          )}

          {result.conversationalSteering && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em] mb-4">
                  Steer Toward
                </h4>
                <ul className="space-y-3">
                  {Array.isArray(result.conversationalSteering.do) ? (
                    result.conversationalSteering.do.map(
                      (item: string, i: number) => (
                        <li
                          key={i}
                          className="text-[14px] text-[#a8a29a] font-sans font-medium leading-[1.75] flex items-start gap-3"
                        >
                          <span className="text-[#10B981] mt-0.5 shrink-0">
                            +
                          </span>
                          <span>{item}</span>
                        </li>
                      )
                    )
                  ) : (
                    <li className="text-[14px] text-[#a8a29a] font-sans font-medium leading-[1.75]">
                      {String(result.conversationalSteering)}
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-sans font-medium text-[#76716b] uppercase tracking-[0.2em] mb-4">
                  Avoid
                </h4>
                <ul className="space-y-3">
                  {Array.isArray(result.conversationalSteering.avoid) &&
                    result.conversationalSteering.avoid.map(
                      (item: string, i: number) => (
                        <li
                          key={i}
                          className="text-[14px] text-[#a8a29a] font-sans font-medium leading-[1.75] flex items-start gap-3"
                        >
                          <span className="text-[#EF4444] mt-0.5 shrink-0">
                            -
                          </span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <SpaceShell
      spaceName="Defrag"
      sidebar={sidebarContent}
      contextPanel={contextContent}
      main={
        <div className="flex flex-col h-full gap-8">
          <div className="flex-none">{mainInputArea}</div>
          <div className="flex-1 min-h-0">{mainResultArea}</div>
        </div>
      }
      mobileTabs={[
        { id: "input", label: "Defrag", content: mainInputArea },
        { id: "result", label: "Result", content: mainResultArea },
        { id: "context", label: "Context", content: contextContent },
      ]}
    />
  )
}