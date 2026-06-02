export default function SovereignLanding() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-8">

      <main className="max-w-3xl w-full border border-white p-12">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">
          Stop having the same fight.
        </h1>

        <p className="text-xl mb-12 opacity-90 leading-relaxed">
          Sovereign OS maps the anatomy of your hardest conversations.
          See what happens in you, in them, and in the space between,
          so you can break the loop of repeated conflict.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="border border-white p-6">
            <h3 className="text-lg font-bold mb-2">1. The Map</h3>
            <p className="text-sm">See the structure of the conflict without the emotional weight.</p>
          </div>
          <div className="border border-white p-6">
            <h3 className="text-lg font-bold mb-2">2. The Shift</h3>
            <p className="text-sm">Identify the exact moment the conversation derails.</p>
          </div>
          <div className="border border-white p-6">
            <h3 className="text-lg font-bold mb-2">3. The Move</h3>
            <p className="text-sm">Take a clean step forward that doesn&apos;t trigger another fight.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 border-t border-white pt-8">
          <a
            href="/workspace"
            className="bg-white text-black px-6 py-3 font-bold text-center hover:invert transition-all"
          >
            ENTER PLATFORM
          </a>
          <a
            href="/landing"
            className="border border-white px-6 py-3 font-bold text-center hover:bg-white hover:text-black transition-all"
          >
            LEARN MORE
          </a>
        </div>
      </main>

    </div>
  );
}