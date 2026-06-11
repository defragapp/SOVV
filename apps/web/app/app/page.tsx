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
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-[10px] font-mono text-foreground-disabled uppercase tracking-[0.2em]">Library</h3>
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
    </div>
  )

  const mainArea = (
    <div className="flex flex-col h-full gap-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-medium text-foreground tracking-tight">Your Library</h2>
        <p className="text-sm text-foreground-muted font-mono">The private record of what helped.</p>
      </div>
       
       <div className="flex flex-col gap-4">
          {isLoading ? (
             <div className="border border-border bg-surface p-6 text-center">
               <p className="text-sm text-foreground-disabled font-mono">Loading...</p>
             </div>
          ) : items.length === 0 ? (
             <div className="border border-border bg-surface flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-foreground font-mono max-w-sm leading-relaxed">
                   Save useful Results here so you can return before the old pattern takes over again.
                </p>
             </div>
          ) : (
             items.map(item => (
                <div key={item.id} className="border border-border bg-surface p-6 flex flex-col gap-4 hover:border-border-hover transition-colors cursor-pointer">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-[0.15em]">
                            {item.workspace_source === "DEFRAG" ? "Defrag space" : item.workspace_source === "COVENANT" ? "Covenant space" : item.workspace_source === "ALIGNMENT" ? "Alignment space" : "Library item"}
                         </span>
                         <h3 className="text-base text-foreground font-medium tracking-tight">{item.title || "Untitled"}</h3>
                      </div>
                      <span className="text-xs text-foreground-disabled font-mono">
                         {new Date(item.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   {item.payload && (
                      <p className="text-sm text-foreground-muted font-mono leading-relaxed line-clamp-3">
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
