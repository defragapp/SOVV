"use client"
import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface WorkspaceShellProps {
  sidebar?: React.ReactNode
  main: React.ReactNode
  contextPanel?: React.ReactNode
  mobileTabs: { id: string; label: string; content: React.ReactNode }[]
  spaceName: "Defrag" | "Covenant" | "Library" | string
}

export function WorkspaceShell({ sidebar, main, contextPanel, mobileTabs, spaceName }: WorkspaceShellProps) {
  const [activeTab, setActiveTab] = React.useState(mobileTabs[0].id)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-mono">
      
      {/* Desktop Layout */}
      <div className="hidden lg:grid w-full h-full" style={{ gridTemplateColumns: "256px 1fr 320px", gridTemplateRows: "56px 1fr 32px" }}>

        {/* Context Bar (Top) */}
        <header className="col-span-3 h-14 border-b border-border bg-background px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="text-foreground-muted">Sovereign.os /</span>
            <span className="text-foreground">{spaceName}</span>
          </div>
          <div className="flex items-center font-mono text-xs text-foreground-muted">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              Secure Data Vault
            </span>
          </div>
        </header>

        {/* System Index (Sidebar) */}
        <aside className="col-start-1 row-start-2 w-64 border-r border-border bg-background flex flex-col overflow-y-auto">
          {sidebar}
        </aside>

        {/* Active Canvas (Center) */}
        <main className="col-start-2 row-start-2 flex-1 flex flex-col bg-background overflow-y-auto relative p-6 lg:p-8">
          {main}
        </main>

        {/* Data Inspector (Context Panel) */}
        <aside className="col-start-3 row-start-2 w-80 border-l border-border bg-surface flex flex-col overflow-y-auto">
          {contextPanel}
        </aside>

        {/* Telemetry Footer */}
        <footer className="col-span-3 h-8 border-t border-border bg-background px-6 flex items-center justify-between">
          <span className="font-mono text-xs text-foreground-muted uppercase tracking-widest">
            {spaceName.toLowerCase()}::active
          </span>
          <span className="font-mono text-xs text-foreground-muted">
            Telemetry: OK
          </span>
        </footer>
      </div>

      {/* Mobile / iOS Layout */}
      <div className="flex lg:hidden flex-col w-full h-full safe-top safe-bottom">
         <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-5 py-3 flex items-center justify-between">
            <span className="font-mono text-sm">{spaceName}</span>
         </header>
         
         <div className="flex px-4 py-2 gap-2 overflow-x-auto no-scrollbar border-b border-border">
            {mobileTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-none text-sm font-mono whitespace-nowrap transition-colors touch-target border border-transparent ${
                  activeTab === tab.id 
                    ? "bg-surface text-foreground border-border"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>

         <main className="flex-1 overflow-y-auto p-5 pb-24 bg-background">
            {mobileTabs.find(t => t.id === activeTab)?.content}
         </main>
      </div>
      
    </div>
  )
}
