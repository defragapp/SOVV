// sovereign.defrag.app hub — Sovereign.os platform entry
// This page serves as the transitional landing for sovereign.defrag.app
// It presents Sovereign.os as the parent platform with Defrag and Covenant as spaces.

export default function HubLanding() {
  return (
    <main className="min-h-screen bg-surface text-[#f4efe9] flex flex-col items-center selection:bg-white/10 selection:text-white pt-24 pb-16 px-6">
      <div className="w-full max-w-2xl flex flex-col gap-16">
        <header className="border-b border-border pb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-white/20" />
            <span className="font-sans font-medium text-[10px] text-[#76716b] tracking-[0.2em] uppercase">Sovereign.os</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#f4efe9] text-balance">
            Your private platform for relational intelligence.
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-border">
          <div className="bg-surface p-10 flex flex-col gap-8">
            <h2 className="text-[10px] font-sans font-medium text-[#52525B] uppercase tracking-[0.2em]">Enter</h2>
            <div className="space-y-4">
              <a href="https://app.defrag.app/login" className="flex items-center justify-center w-full border border-border bg-white text-black hover:bg-white/90 transition-colors h-10 text-[10px] font-sans font-medium uppercase tracking-[0.15em]">
                Sign In
              </a>
              <a href="/about" className="flex items-center justify-center w-full border border-border bg-transparent text-[#a8a29a] hover:text-white hover:border-border transition-colors h-10 text-[10px] font-sans font-medium uppercase tracking-[0.15em]">
                About
              </a>
              <a href="/faq" className="flex items-center justify-center w-full border border-border bg-transparent text-[#a8a29a] hover:text-white hover:border-border transition-colors h-10 text-[10px] font-sans font-medium uppercase tracking-[0.15em]">
                FAQ
              </a>
            </div>
          </div>

          <div className="bg-surface p-10 flex flex-col gap-8 border-l border-border">
            <h2 className="text-[10px] font-sans font-medium text-[#52525B] uppercase tracking-[0.2em]">Spaces</h2>
            <div className="space-y-4">
              <a href="https://app.defrag.app/apps/defrag" className="block border border-border bg-transparent p-4 hover:border-border transition-colors group">
                <div className="font-sans font-medium text-[10px] text-[#f4efe9] uppercase tracking-[0.15em] mb-2 group-hover:text-white transition-colors">Defrag Space</div>
                <div className="text-[#76716b] text-xs leading-relaxed">Relational intelligence space. Work through what is active now.</div>
              </a>
              <a href="https://app.defrag.app/apps/covenant" className="block border border-border bg-transparent p-4 hover:border-border transition-colors group">
                <div className="font-sans font-medium text-[10px] text-[#f4efe9] uppercase tracking-[0.15em] mb-2 group-hover:text-white transition-colors">Covenant Space</div>
                <div className="text-[#76716b] text-xs leading-relaxed">Optional faith-context reflection space. User-initiated.</div>
              </a>
            </div>
          </div>
        </div>

        <footer className="pt-8 border-t border-border flex items-center justify-between text-[10px] font-sans font-medium text-[#4f4b47] uppercase tracking-widest">
          <span>Sovereign.os</span>
          <span>defrag.app</span>
        </footer>
      </div>
    </main>
  )
}
