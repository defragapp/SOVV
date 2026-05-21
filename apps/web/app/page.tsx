import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-5xl font-semibold leading-tight">
        The questions you don’t
        <br />
        know how to ask <span className="text-white">anywhere else.</span>
      </h1>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-white/60 font-light">
        <ul className="space-y-4">
          <li>• Am I in alignment right now?</li>
          <li>• Why does this moment feel so intense?</li>
          <li>• Why do I keep reacting this way?</li>
          <li>• What’s actually happening between us?</li>
        </ul>
        <ul className="space-y-4">
          <li>• Why does this keep happening to me?</li>
          <li>• What am I not seeing about myself?</li>
          <li>• What’s the meaning of this moment?</li>
        </ul>
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/app"
          className="rounded-xl bg-white px-5 py-3 text-black font-medium"
        >
          Start
        </Link>
        <Link href="/app">See an example</Link>
      </div>

      <div className="mt-14 rounded-2xl border border-white/15 p-6">
        <p className="text-white/70 text-sm mb-3">Example output</p>
        <div className="space-y-2">
          <p><span className="font-semibold">What’s going on:</span> One person wants reassurance. The other takes space.</p>
          <p><span className="font-semibold">Why it repeats:</span> Accusation triggers defensiveness. Defensiveness triggers escalation.</p>
          <p><span className="font-semibold">One better next step:</span> Replace blame with a direct feeling and a simple request.</p>
          <p className="text-white/50 text-sm">Confidence: Medium</p>
        </div>
      </div>
    </main>
  );
}
