// defrag.app tool landing — served when host-based routing sends defrag.app to /tool
// Note: per platform hierarchy, defrag.app should serve the Sovereign.os platform landing.
// This page is a fallback for the feat/host-routing branch pattern.
// When middleware is updated, defrag.app routes to app/page.tsx (Sovereign.os landing).

export default function ToolLanding() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header className="mb-16 border-b border-white pb-4">
        <h1 className="text-4xl font-bold tracking-tighter">SOVEREIGN.OS</h1>
        <p className="text-gray-400 mt-2">Your private space for relational intelligence.</p>
      </header>

      <section className="max-w-2xl">
        <h2 className="text-2xl mb-4 border-b border-white pb-2">BEGIN</h2>
        <div className="space-y-4">
          <a href="/app/login" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
            SIGN IN
          </a>
          <a href="/apps/defrag" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
            DEFRAG SPACE
          </a>
          <a href="/apps/covenant" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
            COVENANT SPACE
          </a>
        </div>
      </section>

      <footer className="mt-16 pt-4 border-t border-white text-gray-500 text-sm">
        Sovereign.os / defrag.app
      </footer>
    </main>
  )
}