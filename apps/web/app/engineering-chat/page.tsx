"use client";

import { FormEvent, useState } from "react";

type EngineeringMode = "architect" | "developer" | "reviewer" | "release";

type ChatResponse = {
  answer: string;
  toolCalls: Array<Record<string, unknown>>;
  approvalRequired: boolean;
  error?: string;
};

const modes: EngineeringMode[] = ["architect", "developer", "reviewer", "release"];

export default function EngineeringChatPage() {
  const [message, setMessage] = useState("audit repo and tell me what to fix first");
  const [mode, setMode] = useState<EngineeringMode>("architect");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    setResponse(null);

    try {
      const result = await fetch("/api/engineering-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode }),
      });
      setResponse((await result.json()) as ChatResponse);
    } catch (error) {
      setResponse({
        answer: error instanceof Error ? error.message : "Unable to contact SOVV Engineering Chat.",
        toolCalls: [],
        approvalRequired: false,
        error: "request_failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-5 py-10 text-[#17130f] md:px-8">
      <section className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-[#17130f]/10 pb-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-[#8f5b34]">SOVV Engineering OS</p>
          <h1 className="font-serif text-4xl tracking-[-0.04em] md:text-6xl">Engineering Chat</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5e554d]">
            Project-aware engineering chat with a small, approval-gated tool surface.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-[#17130f]/10 bg-white/60 p-5">
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-[#8f5b34]">Mode</div>
            <div className="mt-4 grid gap-2">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-2xl border px-4 py-3 text-left capitalize ${
                    mode === item ? "border-[#8f5b34] bg-[#fffaf2]" : "border-[#17130f]/10 bg-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl border border-[#17130f]/10 bg-white/70 p-5 md:p-6">
            <form onSubmit={submit} className="grid gap-4">
              <label htmlFor="engineering-message" className="font-mono text-xs uppercase tracking-[0.22em] text-[#8f5b34]">
                Request
              </label>
              <textarea
                id="engineering-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                className="w-full resize-none rounded-3xl border border-[#17130f]/10 bg-[#fffaf2] p-5 text-base leading-7 outline-none focus:border-[#8f5b34]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="justify-self-start rounded-full bg-[#17130f] px-6 py-3 text-sm font-medium text-[#fffaf2] disabled:opacity-50"
              >
                {isSubmitting ? "Running…" : "Run engineering chat"}
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-[#17130f]/10 bg-[#f6f1e8] p-5">
              {!response ? (
                <p className="text-[#6b625a]">Submit a request to see the answer and tool trace.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-[#8f5b34]">Answer</div>
                    <div className="whitespace-pre-wrap rounded-2xl bg-white/70 p-4 leading-7">{response.answer}</div>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-4 text-sm text-[#5e554d]">
                    Approval required: {response.approvalRequired ? "yes" : "no"}
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-2xl bg-[#17130f] p-4 text-xs leading-6 text-[#fffaf2]">
                    {JSON.stringify(response.toolCalls, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
