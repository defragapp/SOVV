"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Person {
  id: string;
  name: string;
  role: string;
  notes: string;
}

interface MultiPersonResult {
  situation: string;
  people: Array<{
    name: string;
    role: string;
    activePattern: string;
    likelyResponse: string;
    needBeneath: string;
  }>;
  groupDynamic: string;
  sharedPattern: string;
  bestNextMove: string;
}

function PersonCard({
  person,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  person: Person;
  index: number;
  onUpdate: (id: string, field: keyof Person, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="border border-white/[0.07] bg-[#0c0a0d] p-5 flex flex-col gap-3"
      style={{ borderRadius: 12 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60">
          Person {index + 1}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove(person.id)}
            className="font-mono text-[9px] text-[#4f4b47] hover:text-[#76716b] transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Name (e.g. Marcus)"
        value={person.name}
        onChange={(e) => onUpdate(person.id, "name", e.target.value)}
        className="w-full bg-[#08070a] border border-white/[0.07] px-3 py-2.5 text-[13px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors"
        style={{ borderRadius: 8 }}
      />
      <input
        type="text"
        placeholder="Role (e.g. partner, parent, colleague)"
        value={person.role}
        onChange={(e) => onUpdate(person.id, "role", e.target.value)}
        className="w-full bg-[#08070a] border border-white/[0.07] px-3 py-2.5 text-[13px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors"
        style={{ borderRadius: 8 }}
      />
      <textarea
        placeholder="Any context about this person (optional)"
        value={person.notes}
        onChange={(e) => onUpdate(person.id, "notes", e.target.value)}
        rows={2}
        className="w-full bg-[#08070a] border border-white/[0.07] px-3 py-2.5 text-[13px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors resize-none"
        style={{ borderRadius: 8 }}
      />
    </motion.div>
  );
}

function ResultSection({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`px-5 py-4 border-b border-white/[0.05] last:border-0 ${highlight ? "bg-[#e0743a]/[0.04]" : ""}`}>
      <p className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-2 ${highlight ? "text-[#e0743a]/80" : "text-[#76716b]"}`}>
        {label}
      </p>
      <p className={`text-[14px] leading-relaxed ${highlight ? "text-[#f4efe9]" : "text-[#c8c2bc]"}`}>{value}</p>
    </div>
  );
}

let idCounter = 0;
function newPerson(): Person {
  return { id: String(++idCounter), name: "", role: "", notes: "" };
}

export function MultiPersonDefrag() {
  const [situation, setSituation] = useState("");
  const [people, setPeople] = useState<Person[]>([newPerson(), newPerson(), newPerson()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultiPersonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addPerson = () => {
    if (people.length >= 8) return;
    setPeople((p) => [...p, newPerson()]);
  };

  const removePerson = (id: string) => {
    setPeople((p) => p.filter((x) => x.id !== id));
  };

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    setPeople((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const handleSubmit = async () => {
    if (!situation.trim()) return;
    const validPeople = people.filter((p) => p.name.trim());
    if (validPeople.length < 2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/defrag/multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          people: validPeople.map(({ name, role, notes }) => ({ name, role, notes })),
          includeBaseline: true,
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

  return (
    <div className="flex flex-col gap-6">
      {/* Situation */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">
          The situation
        </label>
        <textarea
          placeholder="Describe what's happening — the dynamic, the tension, the moment..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={4}
          className="w-full bg-[#0c0a0d] border border-white/[0.07] px-4 py-3 text-[14px] text-[#f4efe9] placeholder:text-[#4f4b47] focus:outline-none focus:border-white/[0.16] transition-colors resize-none"
          style={{ borderRadius: 10 }}
        />
      </div>

      {/* People */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b]">
            People involved ({people.length})
          </label>
          {people.length < 8 && (
            <button
              onClick={addPerson}
              className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors"
            >
              + Add person
            </button>
          )}
        </div>
        <AnimatePresence>
          {people.map((p, i) => (
            <PersonCard
              key={p.id}
              person={p}
              index={i}
              onUpdate={updatePerson}
              onRemove={removePerson}
              canRemove={people.length > 2}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !situation.trim() || people.filter((p) => p.name.trim()).length < 2}
        className="h-11 px-6 text-[13px] bg-[#f4efe9] text-[#08070a] hover:bg-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderRadius: 8 }}
      >
        {loading ? "Reading patterns…" : "Defrag this group"}
      </button>

      {error && (
        <p className="text-[13px] text-[#e0743a]/70">{error}</p>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/[0.07] bg-[#0c0a0d] overflow-hidden"
            style={{ borderRadius: 12 }}
          >
            {/* Individual patterns */}
            {result.people.map((p) => (
              <div key={p.name} className="border-b border-white/[0.05] px-5 py-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-3">{p.name}</p>
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] text-[#c8c2bc]"><span className="text-[#76716b]">Active: </span>{p.activePattern}</p>
                  <p className="text-[13px] text-[#c8c2bc]"><span className="text-[#76716b]">Likely response: </span>{p.likelyResponse}</p>
                  <p className="text-[13px] text-[#c8c2bc]"><span className="text-[#76716b]">Need beneath: </span>{p.needBeneath}</p>
                </div>
              </div>
            ))}
            <ResultSection label="Group dynamic" value={result.groupDynamic} />
            <ResultSection label="Shared pattern" value={result.sharedPattern} />
            <ResultSection label="Best next move" value={result.bestNextMove} highlight />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}