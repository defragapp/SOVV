"use client"
import * as React from "react"
import { SpaceShell } from "@/components/spaces/space-shell"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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
    <div className="flex flex-col h-full bg-surface">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-[10px] font-sans font-medium text-[#71717A] uppercase tracking-[0.2em]">Sovereign.os Library</h3>
      </div>
      <div className="flex-1 px-6 py-8">
        <p className="text-xs font-sans font-medium text-[#71717A] leading-relaxed max-w-[180px]">
          The private record of what helped. Return here before the old pattern takes over again.
        </p>
      </div>
    </div>
  )

  const contextContent = (
    <div className="flex flex-col gap-0 h-full bg-surface border-l border-border">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-[10px] font-sans font-medium text-[#71717A] uppercase tracking-[0.2em]">Continuity</h3>
      </div>
      <div className="p-6">
        <div className="border border-border bg-surface p-5 flex flex-col gap-2">
          <p className="text-[10px] font-sans font-medium text-[#71717A] uppercase tracking-[0.15em]">Baseline Design</p>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Your Baseline Design gives the system context before you describe this moment.
          </p>
        </div>
      </div>
    </div>
  )

  const mainArea = (
    <div className="flex flex-col h-full gap-10 max-w-4xl mx-auto w-full pt-4 pb-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.1em] uppercase font-sans font-medium text-[#71717A] border border-border px-2.5 py-1 bg-transparent">
            Continuity Layer
          </span>
        </div>
        <h2 className="text-[28px] font-semibold text-[#FAFAFA] tracking-[-0.02em]">Your Library</h2>
      </div>
       
       <div className="flex flex-col gap-4">
          {isLoading ? (
             <div className="border border-border bg-surface p-8 flex items-center justify-center min-h-[200px]">
               <span className="w-4 h-4 border border-border border-t-white/80 rounded-full animate-spin" />
             </div>
          ) : items.length === 0 ? (
             <div className="border border-border bg-surface flex flex-col items-center justify-center py-24 text-center">
                <p className="text-[13px] text-[#A1A1AA] font-sans font-medium max-w-[280px] leading-relaxed">
                   Save useful Results here so you can return before the old pattern takes over again.
                </p>
             </div>
          ) : (

             items.map(item => (
                <Link href={`/apps/defrag/${item.id}`} key={item.id} className="block border border-border bg-surface p-6 flex flex-col gap-4 hover:border-border transition-colors cursor-pointer">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-sans font-medium text-[#71717A] uppercase tracking-[0.15em]">
                            {item.workspace_source === "DEFRAG" ? "Defrag space" : item.workspace_source === "COVENANT" ? "Covenant space" : item.workspace_source === "ALIGNMENT" ? "Alignment space" : "Library item"}
                         </span>
                         <h3 className="text-base text-[#FAFAFA] font-medium tracking-tight">{item.title || "Untitled"}</h3>
                      </div>
                      <span className="text-xs text-[#52525B] font-sans font-medium">
                         {new Date(item.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   {item.payload && (
                      <p className="text-sm text-[#A1A1AA] font-sans font-medium leading-relaxed line-clamp-3">
                         {typeof item.payload === "string" ? (() => { try { return JSON.parse(item.payload).summary || "Result data" } catch { return item.payload }})() : "Result data"}
                      </p>
                   )}
                </Link>
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
