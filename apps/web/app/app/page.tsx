"use client"
import * as React from "react"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LibraryPage() {
  const sidebarContent = (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xs font-mono text-[#A1A1AA] uppercase tracking-widest">Filters</h3>
        <div className="space-y-2 flex flex-col">
          {["All", "Defrag", "Covenant", "Audio", "Watch", "Invites"].map(filter => (
             <button key={filter} className="text-left px-3 py-2 text-sm text-[#A1A1AA] hover:text-[#FDFDFD] hover:bg-white/5 rounded-md transition-colors">
               {filter}
             </button>
          ))}
        </div>
      </div>
    </div>
  )

  const mainArea = (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Your Library</h1>
          <Badge variant="pro">Pro Active</Badge>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Empty State Mock */}
          <Card variant="ghost" className="border-dashed border-white/20 flex flex-col items-center justify-center py-12 text-center col-span-full">
             <svg className="w-10 h-10 text-[#52525B] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
             </svg>
             <h3 className="text-lg font-medium text-[#A1A1AA]">No saved items yet</h3>
             <p className="text-sm text-[#52525B] max-w-sm mt-2">
                Your saved Results, Covenant Briefs, and shared context will appear here when you save them to Sovereign.os.
             </p>
          </Card>
       </div>
    </div>
  )

  const mobileTabs = [
    { id: "library", label: "Saved Items", content: mainArea },
    { id: "filters", label: "Filters", content: sidebarContent }
  ]

  return (
    <WorkspaceShell
      spaceName="Library"
      sidebar={sidebarContent}
      main={mainArea}
      mobileTabs={mobileTabs}
    />
  )
}
