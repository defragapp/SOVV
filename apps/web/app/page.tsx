export default function SovereignLanding() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono p-8 selection:bg-white selection:text-black">
      <div className="max-w-2xl w-full border border-neutral-800 p-12 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-6 text-white">Sovereign.OS</h1>
        <p className="text-neutral-400 text-lg leading-relaxed mb-12">
          Relational dynamics and alignment protocols.
        </p>
        <div className="h-[1px] w-full bg-neutral-800 mb-12"></div>
        <div className="flex gap-4">
          <a
            href="/workspace"
            className="inline-block bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-neutral-200 transition-none rounded-none"
          >
            Initialize Session
          </a>
        </div>
      </div>
    </div>
  );
}