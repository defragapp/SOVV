"use client"
import * as React from "react"
import { SpaceShell } from "@/components/workspace/space-shell"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LibraryPage() {
  const [items, setItems] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/library")
      .then(r => r.json())
      .then(d => {
        setItems(d.items || [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

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
    </div>
  )

  const mainArea = (
    <div className="flex flex-col h-full gap-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-medium text-[#FAFAFA] tracking-tight">Your Library</h2>
        <p className="text-sm text-[#A1A1AA] font-mono">The private record of what helped.</p>
      </div>
       
       <div className="flex flex-col gap-4">
          {isLoading ? (
             <div className="border border-white/[0.06] bg-[#080808] p-6 text-center">
               <p className="text-sm text-[#52525B] font-mono">Loading...</p>
             </div>
          ) : items.length === 0 ? (
             <div className="border border-white/[0.06] bg-[#080808] flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-[#FAFAFA] font-mono max-w-sm leading-relaxed">
                   Save useful Results here so you can return before the old pattern takes over again.
                </p>
             </div>
          ) : (
             items.map(item => (
                <div key={item.id} className="border border-white/[0.08] bg-[#080808] p-6 flex flex-col gap-4 hover:border-white/[0.18] transition-colors cursor-pointer">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-[0.15em]">
                            {item.workspace_source === "DEFRAG" ? "Defrag space" : item.workspace_source === "COVENANT" ? "Covenant space" : item.workspace_source === "ALIGNMENT" ? "Alignment space" : "Library item"}
                         </span>
                         <h3 className="text-base text-[#FAFAFA] font-medium tracking-tight">{item.title || "Untitled"}</h3>
                      </div>
                      <span className="text-xs text-[#52525B] font-mono">
                         {new Date(item.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   {item.payload && (
                      <p className="text-sm text-[#A1A1AA] font-mono leading-relaxed line-clamp-3">
                         {typeof item.payload === "string" ? (() => { try { return JSON.parse(item.payload).summary || "Result data" } catch { return item.payload }})() : "Result data"}
                      </p>
                   )}
                </div>
             ))
          )}
       </div>
    </div>
  )

  const mobileTabs = [
    { id: "library", label: "Library", content: mainArea },
    { id: "context", label: "Context", content: contextContent }
  ]

  return (
    <SpaceShell
      spaceName="Library"
      sidebar={sidebarContent}
      main={mainArea}
      contextPanel={contextContent}
      mobileTabs={mobileTabs}
    />
  )
}
