// defrag.app tool landing — served when host-based routing sends defrag.app to /tool
// Note: per platform hierarchy, defrag.app should serve the Sovereign.os platform landing.
// This page is a fallback for the feat/host-routing branch pattern.
// When middleware is updated, defrag.app routes to app/page.tsx (Sovereign.os landing).

export default function ToolLanding() {
  return (
    <main className="min-h-screen bg-[#0c0a0d] text-[#f4efe9] flex flex-col items-center justify-center p-8 selection:bg-white/10 selection:text-white">
      <div className="w-full max-w-sm border border-white/[0.06] bg-[#0c0a0d] p-10 flex flex-col gap-10">
        <header className="text-center">
          <p className="text-[10px] font-mono text-[#4f4b47] tracking-[0.28em] uppercase mb-4">Sovereign.os</p>
          <div className="h-px w-full bg-white/[0.06] mb-6" />
          <h1 className="font-serif text-[22px] tracking-[-0.02em] text-[#f4efe9]">Choose a space</h1>
          <p className="text-[10px] font-mono text-[#76716b] uppercase tracking-[0.2em] mt-2">Your private platform for relational intelligence.</p>
        </header>

        <section className="space-y-4">
          <a href="/login" className="flex items-center justify-center w-full border border-white/[0.06] bg-white text-black hover:bg-white/90 transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.14em]">
            Sign In
          </a>
          <a href="/apps/defrag" className="flex items-center justify-center w-full border border-white/[0.06] bg-transparent text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/[0.06] transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.14em]">
            Defrag Space
          </a>
          <a href="/apps/covenant" className="flex items-center justify-center w-full border border-white/[0.06] bg-transparent text-[#a8a29a] hover:text-[#f4efe9] hover:border-white/[0.06] transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.14em]">
            Covenant Space
          </a>
        </section>

        <footer className="pt-6 border-t border-white/[0.06] text-center">
          <p className="text-[10px] font-mono text-[#4f4b47] uppercase tracking-[0.2em]">Sovereign.os / defrag.app</p>
        </footer>
      </div>
    </main>
  )
}
