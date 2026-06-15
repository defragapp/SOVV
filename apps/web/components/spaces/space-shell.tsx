"use client"
import * as React from "react"
import Link from "next/link"

interface SpaceShellProps {
  sidebar?: React.ReactNode
  main: React.ReactNode
  contextPanel?: React.ReactNode
  mobileTabs: { id: string; label: string; content: React.ReactNode }[]
  spaceName: "Defrag" | "Covenant" | "Library" | string
}

export function SpaceShell({ sidebar, main, contextPanel, mobileTabs, spaceName }: SpaceShellProps) {
  const [activeTab, setActiveTab] = React.useState(mobileTabs[0].id)

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-surface text-[#f4efe9] font-sans">
      
      {/* Desktop Layout */}
      <div className="hidden lg:grid w-full h-full" style={{ gridTemplateColumns: "256px 1fr 320px", gridTemplateRows: "56px 1fr" }}>

        {/* Top Header */}
        <header className="col-span-3 h-14 border-b border-border bg-surface px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-sans font-medium text-[11px] tracking-widest uppercase">
            <Link href="/" className="text-[#a8a29a] hover:text-[#f4efe9] transition-colors">Sovereign.os</Link>
            <span className="text-white/20">/</span>
            <span className="text-[#f4efe9]">{spaceName}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/settings" className="font-sans font-medium text-[10px] tracking-[0.1em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Baseline Design
            </Link>
            <div className="flex items-center gap-2 font-sans font-medium text-[10px] tracking-[0.1em] uppercase text-[#76716b]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              Secure Session
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <aside className="col-start-1 row-start-2 w-64 border-r border-border bg-surface flex flex-col overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main Workspace */}
        <main className="col-start-2 row-start-2 flex-1 flex flex-col bg-surface overflow-y-auto relative p-6 lg:p-8">
          {main}
        </main>

        {/* Context Panel */}
        <aside className="col-start-3 row-start-2 w-80 bg-surface flex flex-col overflow-y-auto">
          {contextPanel}
        </aside>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-col w-full h-full safe-top safe-bottom">
         <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans font-medium text-[11px] tracking-widest uppercase">
               <Link href="/" className="text-[#a8a29a]">Sovereign.os</Link>
               <span className="text-white/20">/</span>
               <span className="text-[#f4efe9]">{spaceName}</span>
            </div>
            <Link href="/settings" className="font-sans font-medium text-[10px] uppercase text-[#76716b]">
              Settings
            </Link>
         </header>
         
         <div className="flex px-4 pt-2 gap-2 overflow-x-auto no-scrollbar border-b border-border bg-surface">
            {mobileTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 text-[11px] font-sans font-medium tracking-widest uppercase whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? "border-border text-[#f4efe9]"
                    : "border-transparent text-[#76716b] hover:text-[#a8a29a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>

         <main className="flex-1 overflow-y-auto p-5 pb-24 bg-surface">
            {mobileTabs.find(t => t.id === activeTab)?.content}
         </main>
      </div>
      
    </div>
  )
}
