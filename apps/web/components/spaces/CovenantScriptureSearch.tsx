"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScriptureResult {
  reference: string;   // e.g. "Matthew 5:9"
  text: string;        // verse text
  theme: string;       // matched theme
  reflection?: string; // optional AI reflection on why this applies
}

const SUGGESTED_THEMES = [
  "forgiveness",
  "boundaries",
  "grief",
  "anger",
  "fear",
  "trust",
  "repair",
  "rest",
  "identity",
  "family",
  "patience",
  "courage",
]

export function CovenantScriptureSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScriptureResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (theme: string) => {
    if (!theme.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(false);

    try {
      const params = new URLSearchParams({ theme: theme.trim(), limit: "6" });
      const res = await fetch(`/api/covenant/search?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results || []);
      setSearched(true);
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  const applyTheme = (theme: string) => {
    setQuery(theme);
    search(theme);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-1">
          Scripture search
        </p>
        <p className="text-[13px] text-[#4f4b47] leading-relaxed">
          Search by theme — not just free text. Find scripture that speaks to what&apos;s active.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter a theme (e.g. forgiveness, grief, fear...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-[#0c0a0d] border border-white/[0.07] px-4 py-2.5 text-[13px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors"
          style={{ borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-10 px-4 text-[12px] bg-[#f4efe9] text-[#08070a] hover:bg-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ borderRadius: 8 }}
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {/* Suggested themes */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => setQuery(theme)}
            className="font-mono text-[8px] uppercase tracking-[0.16em] px-2.5 py-1.5 border border-white/[0.06] text-[#4f4b47] hover:text-[#76716b] hover:border-white/[0.10] transition-colors"
            style={{ borderRadius: 5 }}
          >
            {theme}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-[13px] text-[#e0743a]/70">{error}</p>
      )}

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-sm bg-[#e0743a]/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">
              Searching scripture
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {searched && results.length === 0 && !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[13px] text-[#4f4b47]"
          >
            No results found for &ldquo;{query}&rdquo;. Try a different theme.
          </motion.p>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            {results.map((r, i) => (
              <motion.div
                key={`${r.reference}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="border border-white/[0.07] bg-[#0c0a0d] p-5 flex flex-col gap-3"
                style={{ borderRadius: 10 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#e0743a]/70">{r.reference}</span>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.14em] border border-white/[0.06] text-[#4f4b47] px-2 py-0.5"
                    style={{ borderRadius: 3 }}
                  >
                    {r.theme}
                  </span>
                </div>
                <blockquote className="text-[14px] text-[#c8c2bc] leading-relaxed italic">
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                {r.reflection && (
                  <p className="text-[12px] text-[#76716b] leading-relaxed border-t border-white/[0.05] pt-3">
                    {r.reflection}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}