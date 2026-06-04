export default function ToolLanding() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <header className="mb-16 border-b border-white pb-4">
        <h1 className="text-4xl font-bold tracking-tighter">DEFRAG.APP</h1>
        <p className="text-gray-400 mt-2">Realign your trajectory.</p>
      </header>

      <section className="max-w-2xl">
        <h2 className="text-2xl mb-4 border-b border-white pb-2">BEGIN</h2>
        <div className="space-y-4">
          <a href="/auth" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
            LOGIN / REGISTER
          </a>
          <a href="/checkout" className="block border border-white p-4 hover:bg-white hover:text-black transition-colors">
            SUBSCRIBE (STRIPE)
          </a>
        </div>
      </section>

      <footer className="mt-16 pt-4 border-t border-white text-gray-500 text-sm">
        defrag.app / a sovereign.defrag.app tool
      </footer>
    </main>
  )
}
