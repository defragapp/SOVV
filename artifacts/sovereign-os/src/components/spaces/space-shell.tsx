
import * as React from "react"
import { Link } from "wouter"
import { FloatingNav } from "./FloatingNav"
import { SpaceGlow, type SpaceVariant } from "./SpaceGlow"

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
  const [userTier, setUserTier] = React.useState<"free" | "pro" | null>(null)
  const scrollPositions = React.useRef<Record<string, number>>({})
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Refresh session on mount + load user tier
  React.useEffect(() => {
    fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).catch(() => {})
    fetch("/api/user/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then((d: any) => d?.tier && setUserTier(d.tier))
      .catch(() => {})
  }, [])

  const spaceVariant: SpaceVariant =
    spaceName === 'Covenant' ? 'covenant' :
    spaceName === 'Alignment' ? 'alignment' :
    spaceName === 'Archive' ? 'archive' :
    'defrag';

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#08070a] text-[#f4efe9] font-sans">

      {/* Per-space ambient color temperature */}
      <SpaceGlow variant={spaceVariant} />

      {/* ── Desktop Layout ─────────────────────────────────────────── */}
      <div
        className="hidden lg:grid w-full h-full relative z-10"
        style={{ gridTemplateColumns: "260px 1fr 300px", gridTemplateRows: "52px 1fr" }}
      >
        {/* ── Header ── */}
        <header className="col-span-3 h-[52px] border-b border-[#e0743a]/10 bg-[#08070a]/95 backdrop-blur-md px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/apps/defrag" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Sovereign.os
            </Link>
            <span className="text-[#4f4b47] text-xs">/</span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#f4efe9]">{spaceName}</span>
          </div>

          {/* Space switcher */}
          <nav aria-label="Space navigation" className="flex items-center gap-1">
            {[
              { href: "/apps/defrag", label: "Defrag" },
              { href: "/apps/covenant", label: "Covenant" },
              { href: "/apps/alignment", label: "Alignment" },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                aria-current={spaceName === s.label ? "page" : undefined}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
                  spaceName === s.label
                    ? "bg-white/[0.08] text-[#f4efe9]"
                    : "text-[#76716b] hover:text-[#a8a29a] hover:bg-white/[0.04]"
                }`}
                style={{ borderRadius: "var(--radius-minimal)" }}
              >
                {s.label}
              </Link>
            ))}
          </nav>

          {/* Right nav */}
          <div className="flex items-center gap-4">
            {userTier && (
              <span className={`font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-0.5 ${
                userTier === "pro"
                  ? "text-[#e0743a]/70 border border-[#e0743a]/20"
                  : "text-[#4f4b47] border border-white/[0.06]"
              }`} style={{ borderRadius: 3 }}>
                {userTier === "pro" ? "Pro" : "Free"}
              </span>
            )}
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
              Baseline Design
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
        <aside
          className="col-start-1 row-start-2 border-r border-[#e0743a]/10 flex flex-col overflow-y-auto"
          style={{ background: 'linear-gradient(180deg, #0c0a0d 0%, #09080b 100%)' }}
        >
          {sidebar}
        </aside>

        {/* ── Center: AI Thread ── */}
        <main
          className="col-start-2 row-start-2 flex flex-col overflow-y-auto relative p-8 lg:p-12"
          style={{ background: 'linear-gradient(170deg, #08070a 0%, #0a090d 100%)' }}
        >
          {main}
        </main>

        {/* ── Right: Library / Multimedia ── */}
        <aside
          className="col-start-3 row-start-2 border-l border-[#e0743a]/10 flex flex-col overflow-y-auto"
          style={{ background: 'linear-gradient(180deg, #0c0a0d 0%, #09080b 100%)' }}
        >
          {contextPanel}
        </aside>
      </div>

      {/* ── Mobile Layout ──────────────────────────────────────────── */}
      <div className="flex lg:hidden flex-col w-full h-full relative z-10">
        <header
          className="sticky top-0 z-10 bg-[#08070a]/95 backdrop-blur-md border-b border-[#e0743a]/10 px-5 py-3 flex items-center justify-between select-none"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
            <Link href="/apps/defrag" className="text-[#76716b]">Sovereign.os</Link>
            <span className="text-[#4f4b47]">/</span>
            <span className="text-[#f4efe9]">{spaceName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#76716b] hover:text-[#f4efe9] transition-colors">
              Library
            </Link>
            <button
              onClick={handleSignOut}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#76716b] hover:text-[#f4efe9] transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Content tabs — switch between main content and context panel */}
        {mobileTabs.length > 1 && (
          <div className="flex px-4 gap-1 overflow-x-auto border-b border-[#e0743a]/10 bg-[#08070a] select-none">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (contentRef.current) {
                    scrollPositions.current[activeTab] = contentRef.current.scrollTop
                  }
                  setActiveTab(tab.id)
                  requestAnimationFrame(() => {
                    if (contentRef.current) {
                      contentRef.current.scrollTop = scrollPositions.current[tab.id] ?? 0
                    }
                  })
                }}
                className={`px-4 py-2.5 border-b-2 font-mono text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-[#e0743a] text-[#f4efe9]"
                    : "border-transparent text-[#76716b] hover:text-[#a8a29a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Main content — pb-36 gives clearance above FloatingNav + safe area */}
        <main ref={contentRef} className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(170deg, #08070a 0%, #0a090d 100%)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 88px)' }}>
          {mobileTabs.find((t) => t.id === activeTab)?.content}
        </main>

        {/* Floating bottom tab bar — replaces old space switcher */}
        <FloatingNav />
      </div>

    </div>
  )
}