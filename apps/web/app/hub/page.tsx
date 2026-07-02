// sovereign.defrag.app hub — Sovereign.os platform entry
// This page serves as the transitional landing for sovereign.defrag.app
// It presents Sovereign.os as the parent platform with Defrag and Covenant as spaces.

export default function HubLanding() {
  return (
    <main className="min-h-screen bg-[#0c0a0d] text-[#f4efe9] flex flex-col items-center selection:bg-white/10 selection:text-white pt-24 pb-16 px-6">
      <div className="w-full max-w-2xl flex flex-col gap-16">
        <header className="border-b border-white/[0.06] pb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-white/20" />
            <span className="font-mono text-[10px] text-[#76716b] tracking-[0.2em] uppercase">Sovereign.os</span>
          </div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.02em] text-[#f4efe9] text-balance">
            Pattern-aware AI for the moments that matter.
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.06]">
          <div className="bg-[#0c0a0d] p-10 flex flex-col gap-8">
            <h2 className="text-[10px] font-mono text-[#4f4b47] uppercase tracking-[0.2em]">Enter</h2>
            <div className="space-y-4">
              <a href="/app/login" className="flex items-center justify-center w-full border border-white/[0.06] bg-white text-black hover:bg-white/90 transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.14em]">
                Sign In
              </a>
              <a href="/about" className="flex items-center justify-center w-full border border-white/[0.06] bg-transparent text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/[0.06] transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.14em]">
                About
              </a>
              <a href="/faq" className="flex items-center justify-center w-full border border-white/[0.06] bg-transparent text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/[0.06] transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.14em]">
                FAQ
              </a>
            </div>
          </div>

          <div className="bg-[#0c0a0d] p-10 flex flex-col gap-8 border-l border-white/[0.06]">
            <h2 className="text-[10px] font-mono text-[#4f4b47] uppercase tracking-[0.2em]">Spaces</h2>
            <div className="space-y-4">
              <a href="https://app.defrag.app/apps/defrag" className="block border border-white/[0.06] bg-transparent p-4 hover:border-white/[0.06] transition-colors group">
                <div className="font-mono text-[10px] text-[#f4efe9] uppercase tracking-[0.14em] mb-2 group-hover:text-[#f4efe9] transition-colors">Defrag Space</div>
                <div className="text-[#76716b] text-xs leading-relaxed">Relational intelligence space. Work through what is active now.</div>
              </a>
              <a href="https://app.defrag.app/apps/covenant" className="block border border-white/[0.06] bg-transparent p-4 hover:border-white/[0.06] transition-colors group">
                <div className="font-mono text-[10px] text-[#f4efe9] uppercase tracking-[0.14em] mb-2 group-hover:text-[#f4efe9] transition-colors">Covenant Space</div>
                <div className="text-[#76716b] text-xs leading-relaxed">Optional faith-context reflection space. User-initiated.</div>
              </a>
            </div>
          </div>
        </div>

        <footer className="pt-8 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#4f4b47] uppercase tracking-[0.2em]">
          <span>Sovereign.os</span>
          <span>defrag.app</span>
        </footer>
      </div>
    </main>
  )
}
