import Link from "next/link"

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#08070a] text-[#f4efe9] flex items-center justify-center px-6 text-center">
      <section className="max-w-4xl">
        <p className="font-mono uppercase tracking-[0.3em] text-[#f4efe9]/30 mb-6 text-[0.65rem]">
          Defrag Studio
        </p>
        <h1 className="font-serif text-balance leading-[1.02] tracking-[-0.035em] text-[clamp(3rem,8vw,7.5rem)]">
          Healing isn&apos;t optional.
        </h1>
        <p className="mt-7 max-w-xl mx-auto text-[#a8a29a] leading-relaxed text-base md:text-lg">
          See the moment clearly, then choose the next right response.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link href="/app/login" className="btn-primary">
            Enter Workspace
          </Link>
          <Link href="/product/defrag" className="btn-secondary">
            Open Defrag
          </Link>
        </div>
      </section>
    </main>
  )
}
