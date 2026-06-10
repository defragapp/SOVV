// defrag.app tool landing — served when host-based routing sends defrag.app to /tool
// Note: per platform hierarchy, defrag.app should serve the Sovereign.os platform landing.
// This page is a fallback for the feat/host-routing branch pattern.
// When middleware is updated, defrag.app routes to app/page.tsx (Sovereign.os landing).

export default function ToolLanding() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col items-center justify-center p-8 selection:bg-white/10 selection:text-white">
      <div className="w-full max-w-sm border border-white/[0.08] bg-[#080808] p-10 flex flex-col gap-10">
        <header className="text-center">
          <p className="text-[10px] font-mono text-[#3F3F46] tracking-[0.3em] uppercase mb-4">Sovereign.os</p>
          <div className="h-px w-full bg-white/[0.06] mb-6" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">Choose a space</h1>
          <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest mt-2">Your private platform for relational intelligence.</p>
        </header>

        <section className="space-y-4">
          <a href="/login" className="flex items-center justify-center w-full border border-white/[0.15] bg-white text-black hover:bg-white/90 transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.15em]">
            Sign In
          </a>
          <a href="/apps/defrag" className="flex items-center justify-center w-full border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.15em]">
            Defrag Space
          </a>
          <a href="/apps/covenant" className="flex items-center justify-center w-full border border-white/[0.08] bg-transparent text-[#A1A1AA] hover:text-white hover:border-white/20 transition-colors h-10 text-[10px] font-mono uppercase tracking-[0.15em]">
            Covenant Space
          </a>
        </section>

        <footer className="pt-6 border-t border-white/[0.06] text-center">
          <p className="text-[10px] font-mono text-[#3F3F46] uppercase tracking-widest">Sovereign.os / defrag.app</p>
        </footer>
      </div>
    </main>
  )
}
