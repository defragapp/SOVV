// sovereign.defrag.app hub — Sovereign.os platform entry
// This page serves as the transitional landing for sovereign.defrag.app
// It presents Sovereign.os as the parent platform with Defrag and Covenant as spaces.

export default function HubLanding() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header className="mb-16 border-b border-white pb-4">
        <h1 className="text-4xl font-bold tracking-tighter">SOVEREIGN.OS</h1>
        <p className="text-gray-400 mt-2">Your private platform for relational intelligence.</p>
      </header>

      <section className="max-w-2xl space-y-12">
        <div>
          <h2 className="text-2xl mb-4 border-b border-white pb-2">ENTER</h2>
          <div className="space-y-4">
            <a href="https://app.defrag.app/app/login" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
              Sign In
            </a>
            <a href="/about" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
              ABOUT
            </a>
            <a href="/faq" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
              FAQ
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-2xl mb-4 border-b border-white pb-2">SPACES</h2>
          <div className="space-y-4">
            <a href="https://app.defrag.app/apps/defrag" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
              <div className="font-bold">Defrag</div>
              <div className="text-gray-400 text-sm mt-1">Relational intelligence space. Work through what is active now.</div>
            </a>
            <a href="https://app.defrag.app/apps/covenant" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
              <div className="font-bold">Covenant</div>
              <div className="text-gray-400 text-sm mt-1">Optional faith-context reflection space. User-initiated.</div>
            </a>
          </div>
        </div>
      </section>

      <footer className="mt-16 pt-4 border-t border-white text-gray-500 text-sm">
        Sovereign.os / defrag.app
      </footer>
    </main>
  )
}