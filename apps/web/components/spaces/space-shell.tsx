"use client"
import * as React from "react"
import Link from "next/link"

interface SpaceShellProps {
  sidebar?: React.ReactNode       // LEFT — people / Baseline Design context
  main: React.ReactNode           // CENTER — AI thread
  contextPanel?: React.ReactNode  // RIGHT — Library / multimedia output
  mobileTabs: { id: string; label: string; content: React.ReactNode }[]
  spaceName: "Defrag" | "Covenant" | "Alignment" | "Library" | string
}

async function handleSignOut() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
  window.location.href = "/"
}

export function SpaceShell({ sidebar, main, contextPanel, mobileTabs, spaceName }: SpaceShellProps) {
  const [activeTab, setActiveTab] = React.useState(mobileTabs[0].id)

  // Refresh session on mount to extend 7-day expiry
  React.useEffect(() => {
    fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
      .catch(() => {}) // Non-blocking — failure just means session expires naturally
  }, [])

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#08070a] text-[#f4efe9] font-sans">

      {/* ── Desktop Layout ─────────────────────────────────────────── */}
      <div
        className="hidden lg:grid w-full h-full"
        style={{ gridTemplateColumns: "260px 1fr 300px", gridTemplateRows: "52px 1fr" }}
      >
        {/* ── Header ── */}
        <header className="col-span-3 h-[52px] border-b border-white/[0.06] bg-[#08070a]/95 backdrop-blur-md px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/apps/defrag" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Sovereign.os
            </Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#f4efe9]">{spaceName}</span>
          </div>

          {/* Space switcher */}
          <div className="flex items-center gap-1">
            {[
              { href: "/apps/defrag", label: "Defrag" },
              { href: "/apps/covenant", label: "Covenant" },
              { href: "/apps/alignment", label: "Alignment" },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
                  spaceName === s.label
                    ? "bg-white/[0.08] text-[#f4efe9]"
                    : "text-[#76716b] hover:text-[#a8a29a] hover:bg-white/[0.04]"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Library
            </Link>
            <Link
              href="/settings"
              className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Your Design
            </Link>
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-[#4f4b47]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e0743a]/40" />
              Secure
            </div>
            <button
              onClick={handleSignOut}
              className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* ── Left: People / Baseline Design ── */}
        <aside className="col-start-1 row-start-2 border-r border-white/[0.06] bg-[#0c0a0d] flex flex-col overflow-y-auto">
          {sidebar}
        </aside>

        {/* ── Center: AI Thread ── */}
        <main className="col-start-2 row-start-2 flex flex-col bg-[#08070a] overflow-y-auto relative p-6 lg:p-8">
          {main}
        </main>

        {/* ── Right: Library / Multimedia ── */}
        <aside className="col-start-3 row-start-2 border-l border-white/[0.06] bg-[#0c0a0d] flex flex-col overflow-y-auto">
          {contextPanel}
        </aside>
      </div>

      {/* ── Mobile Layout ──────────────────────────────────────────── */}
      <div className="flex lg:hidden flex-col w-full h-full safe-top safe-bottom">
        <header className="sticky top-0 z-10 bg-[#08070a]/95 backdrop-blur-md border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
            <Link href="/apps/defrag" className="text-[#76716b]">Sovereign.os</Link>
            <span className="text-white/20">/</span>
            <span className="text-[#f4efe9]">{spaceName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Library
            </Link>
            <Link href="/settings" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Your Design
            </Link>
            <button
              onClick={handleSignOut}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Space switcher mobile */}
        <div className="flex px-4 pt-2 gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#08070a]">
          {[
            { href: "/apps/defrag", label: "Defrag" },
            { href: "/apps/covenant", label: "Covenant" },
            { href: "/apps/alignment", label: "Alignment" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`px-3 py-2.5 border-b-2 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap transition-colors ${
                spaceName === s.label
                  ? "border-[#f4efe9] text-[#f4efe9]"
                  : "border-transparent text-[#76716b] hover:text-[#a8a29a]"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Content tabs */}
        <div className="flex px-4 gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#08070a]">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 border-b-2 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-[#e0743a] text-[#f4efe9]"
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