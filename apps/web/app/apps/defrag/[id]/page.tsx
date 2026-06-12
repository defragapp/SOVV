"use client"
import * as React from "react"
import { SpaceShell } from "@/components/workspace/space-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"

export default function DefragItemPage() {
  const params = useParams()
  const id = params.id as string

  const [input, setInput] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [initialLoading, setInitialLoading] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  
  // Audio state
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false)
  const [audioError, setAudioError] = React.useState("")

  React.useEffect(() => {
    fetch(`/api/library/${id}`)
      .then(r => {
         if (!r.ok) throw new Error("Not found")
         return r.json()
      })
      .then(d => {
         if (d.payload) {
             const parsed = typeof d.payload === 'string' ? JSON.parse(d.payload) : d.payload
             setResult(parsed)
         }
      })
      .catch(e => setError(e.message))
      .finally(() => setInitialLoading(false))
  }, [id])

  const handleUpdate = async () => {
    if (!input.trim() || !result) return
    setIsLoading(true)
    setError("")
    try {
      // Create a continuity prompt
      const message = `Previous Context: Active Pattern: ${result.activePattern}. The alignment needed was: ${result.alignment}. \n\nUser Update: ${input}`
      
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update")
      }
      setResult(data)
      setInput("")
      setAudioUrl(null)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!result) return
    setIsGeneratingAudio(true)
    setAudioError("")
    try {
      const audioText = `Active Pattern: ${result.activePattern}. Here is what is repeating: ${result.theRepeat}. The alignment needed is: ${result.alignment}. Your best next response is: ${result.bestNextResponse?.summary || "to pause."}`
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: audioText })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Audio generation failed.")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setResult((prev: any) => ({
        ...prev,
        media: { ...prev.media, audioOverviewAvailable: true }
      }))
    } catch (err: any) {
      setAudioError(err.message)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.2em]">Library</h3>
      </div>
      <div className="flex-1 px-5 py-6">
        <p className="text-xs font-mono text-[#3F3F46] leading-relaxed">You are viewing a saved session. Provide updates to shift the pattern.</p>
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
          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-2">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Audio Overview</p>
            {audioUrl ? (
              <audio controls src={audioUrl} className="w-full h-8 outline-none filter grayscale sepia opacity-80 mt-1" />
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <Button 
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
<<<<<<< HEAD
                  variant="secondary" 
=======
                  variant="secondary"
>>>>>>> pr-61
                  className="rounded-none border border-white/[0.15] bg-transparent text-[#FAFAFA] hover:bg-white/5 font-mono text-[10px] tracking-[0.15em] uppercase h-8 w-full"
                >
                  {isGeneratingAudio ? "Generating..." : "Generate Audio"}
                </Button>
                {audioError && <p className="text-red-400 text-[10px] font-mono leading-tight">{audioError}</p>}
                {!audioError && !isGeneratingAudio && <p className="text-[10px] text-[#52525B] font-mono leading-tight">Requires Pro</p>}
              </div>
            )}
          </div>

          <div className="border border-white/[0.04] bg-[#050505] p-4 flex flex-col gap-1.5">
            <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-[0.15em]">Watch Preview</p>
            <p className="text-xs text-[#52525B]">Watch Preview is not available for this Result yet.</p>
          </div>
        </>
      )}
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
      {initialLoading ? (
        <div className="flex-1 flex items-center justify-center border border-white/[0.06] bg-[#080808] p-6 text-center">
          <p className="text-sm text-[#52525B] font-mono leading-relaxed max-w-sm">
            Loading...
          </p>
        </div>
      ) : !result ? (
        <div className="flex-1 flex items-center justify-center border border-white/[0.06] bg-[#080808] p-6 text-center">
          <p className="text-sm text-red-400 font-mono leading-relaxed max-w-sm">
            {error || "Item not found."}
          </p>
        </div>
      ) : (
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
           className="flex-1 overflow-y-auto border border-white/[0.06] bg-[#080808] p-8"
        >
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
        </motion.div>
      )}
    </div>
  )

  const mainInputArea = (
    <div className="flex flex-col h-full justify-end gap-8">
      {error && !initialLoading && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-4 font-mono">
          {error}
        </div>
      )}

      <div className="border border-white/[0.08] bg-[#080808] focus-within:border-white/[0.18] transition-colors duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Update the situation... What happened next?"
          className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3F3F46] resize-none outline-none min-h-[120px] text-sm p-4 leading-relaxed font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleUpdate();
            }
          }}
        />
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-[#3F3F46] font-mono tracking-wide">ENTER TO UPDATE</span>
          <Button
            size="sm"
            onClick={handleUpdate}
            disabled={!input.trim() || isLoading}
            className="rounded-none border border-white/[0.15] bg-white text-black hover:bg-white/90 font-mono text-[10px] tracking-[0.15em] uppercase h-8 px-4 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Running..." : "Update Pattern"}
          </Button>
        </div>
      </div>
    </div>
  )

  const mobileTabs = [
    { id: "result", label: "Result", content: mainResultArea },
    { id: "input", label: "Update", content: mainInputArea },
    { id: "context", label: "Context", content: contextContent }
  ]

  const desktopMain = (
    <div className="flex flex-col h-full gap-6">
       <div className="flex-1 min-h-0">{mainResultArea}</div>
       <div className="flex-none">{mainInputArea}</div>
    </div>
  )

  return (
      spaceName={`Library / ${result?.activePattern || "Item"}`}
      mobileTabs={mobileTabs}
    />
  )
}
