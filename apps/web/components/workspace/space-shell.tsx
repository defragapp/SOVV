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
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#08070a] text-[#f4efe9] font-sans">

      {/* ── Desktop Layout ─────────────────────────────────────────── */}
      <div
        className="hidden lg:grid w-full h-full"
        style={{ gridTemplateColumns: "256px 1fr 320px", gridTemplateRows: "56px 1fr" }}
      >
        {/* Header */}
        <header className="col-span-3 h-14 border-b border-white/[0.06] bg-[#08070a]/90 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-xs tracking-widest uppercase">
            <Link href="/" className="text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Sovereign.os
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-[#f4efe9]">{spaceName}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/settings"
              className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Baseline Design
            </Link>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#4f4b47]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/40" />
              Secure Session
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <aside className="col-start-1 row-start-2 w-64 border-r border-white/[0.06] bg-[#0c0a0d] flex flex-col overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main */}
        <main className="col-start-2 row-start-2 flex-1 flex flex-col bg-[#08070a] overflow-y-auto relative p-6 lg:p-8">
          {main}
        </main>

        {/* Context Panel */}
        <aside className="col-start-3 row-start-2 w-80 bg-[#0c0a0d] flex flex-col overflow-y-auto border-l border-white/[0.06]">
          {contextPanel}
        </aside>
      </div>

      {/* ── Mobile Layout ──────────────────────────────────────────── */}
      <div className="flex lg:hidden flex-col w-full h-full safe-top safe-bottom">
        <header className="sticky top-0 z-10 bg-[#08070a]/95 backdrop-blur-md border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
            <Link href="/" className="text-[#76716b]">Sovereign.os</Link>
            <span className="text-white/20">/</span>
            <span className="text-[#f4efe9]">{spaceName}</span>
          </div>
          <Link
            href="/settings"
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
          >
            Settings
          </Link>
        </header>

        <div className="flex px-4 pt-2 gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#08070a]">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 text-xs font-mono tracking-widest uppercase whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-[#f4efe9] text-[#f4efe9]"
                  : "border-transparent text-[#76716b] hover:text-[#a8a29a]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-5 pb-24 bg-[#08070a]">
          {mobileTabs.find((t) => t.id === activeTab)?.content}
        </main>
      </div>

    </div>
  )
}