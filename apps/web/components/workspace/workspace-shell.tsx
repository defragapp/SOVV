"use client"
import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface WorkspaceShellProps {
  sidebar?: React.ReactNode
  main: React.ReactNode
  contextPanel?: React.ReactNode
  mobileTabs: { id: string; label: string; content: React.ReactNode }[]
  spaceName: "Defrag" | "Covenant" | "Library"
}

export function WorkspaceShell({ sidebar, main, contextPanel, mobileTabs, spaceName }: WorkspaceShellProps) {
  const [activeTab, setActiveTab] = React.useState(mobileTabs[0].id)

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#020202] text-[#FDFDFD]">
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full h-full">
        {sidebar && (
          <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] flex flex-col h-full overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 flex flex-col h-full bg-[#020202] overflow-y-auto relative safe-top safe-bottom">
           <header className="sticky top-0 z-10 bg-[#020202]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Badge variant={spaceName.toLowerCase() as any}>{spaceName}</Badge>
                 <span className="text-sm text-[#A1A1AA]">Sovereign.os</span>
              </div>
           </header>
           <div className="flex-1 max-w-4xl mx-auto w-full p-8">
              {main}
           </div>
        </main>
        {contextPanel && (
          <aside className="w-80 border-l border-white/5 bg-[#0A0A0A] flex flex-col h-full overflow-y-auto">
            {contextPanel}
          </aside>
        )}
      </div>

      {/* Mobile / iOS Layout */}
      <div className="flex lg:hidden flex-col w-full h-full safe-top safe-bottom">
         <header className="sticky top-0 z-10 bg-[#020202]/90 backdrop-blur-md border-b border-white/5 px-5 py-3 flex items-center justify-between">
            <Badge variant={spaceName.toLowerCase() as any}>{spaceName}</Badge>
         </header>
         
         <div className="flex px-4 py-2 gap-2 overflow-x-auto no-scrollbar border-b border-white/5">
            {mobileTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-target ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-[#FDFDFD]" 
                    : "text-[#A1A1AA] hover:text-[#FDFDFD]"
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>

         <main className="flex-1 overflow-y-auto p-5 pb-24">
            {mobileTabs.find(t => t.id === activeTab)?.content}
         </main>
      </div>
      
    </div>
  )
}
