"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DefragMessageResult {
  tone: string;
  whatTheyMightMean: string;
  whatMightBeActive: string;
  yourPattern: string;
  bestNextResponse: string;
}

const EXAMPLE_MESSAGES = [
  "Fine. Do whatever you want.",
  "I'm not mad, I just need space.",
  "You always do this.",
  "Never mind, forget I said anything.",
  "I guess I'm just not a priority.",
]

export function DefragMessage() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DefragMessageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/defrag/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          context: context.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const applyExample = (ex: string) => {
    setMessage(ex);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-1">
          Defrag a message
        </p>
        <p className="text-[13px] text-[#4f4b47] leading-relaxed">
          Paste any text message or conversation snippet. Get a pattern read.
        </p>
      </div>

      {/* Example messages */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_MESSAGES.map((ex) => (
          <button
            key={ex}
            onClick={() => setMessage(ex)}
            className="font-mono text-[9px] uppercase tracking-[0.12em] px-2.5 py-1.5 border border-white/[0.06] text-[#4f4b47] hover:text-[#76716b] hover:border-white/[0.10] transition-colors"
            style={{ borderRadius: 5 }}
          >
            {ex.length > 28 ? ex.slice(0, 28) + "…" : ex}
          </button>
        ))}
      </div>

      {/* Message input */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">
          The message
        </label>
        <textarea
          placeholder={`Paste the message here — exactly as it was sent.\n\n"Fine. Do whatever you want."`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full bg-[#0c0a0d] border border-white/[0.07] px-4 py-3 text-[14px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors resize-none"
          style={{ borderRadius: 10 }}
        />
      </div>

      {/* Optional context */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">
          Context <span className="text-[#4f4b47] normal-case tracking-normal font-sans text-[11px]">(optional)</span>
        </label>
        <textarea
          placeholder="Who sent this? What was happening before? Any relevant history..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          className="w-full bg-[#0c0a0d] border border-white/[0.07] px-4 py-3 text-[13px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors resize-none"
          style={{ borderRadius: 10 }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
        className="h-10 px-5 text-[12px] bg-[#f4efe9] text-[#08070a] hover:bg-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed self-start"
        style={{ borderRadius: 8 }}
      >
        {loading ? "Reading…" : "Read this message"}
      </button>

      {error && (
        <p className="text-[13px] text-[#e0743a]/70">{error}</p>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/[0.07] bg-[#0c0a0d] overflow-hidden"
            style={{ borderRadius: 12 }}
          >
            {[
              { label: "Tone", value: result.tone },
              { label: "What they might mean", value: result.whatTheyMightMean },
              { label: "What might be active", value: result.whatMightBeActive },
              { label: "Your pattern", value: result.yourPattern },
            ].map((row) => (
              <div key={row.label} className="px-5 py-4 border-b border-white/[0.05]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-2">{row.label}</p>
                <p className="text-[14px] text-[#c8c2bc] leading-relaxed">{row.value}</p>
              </div>
            ))}
            <div className="px-5 py-4 bg-[#e0743a]/[0.04]">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/80 mb-2">Best next response</p>
              <p className="text-[14px] text-[#f4efe9] leading-relaxed">{result.bestNextResponse}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}