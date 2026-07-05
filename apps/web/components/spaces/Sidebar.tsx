"use client"

import { useState, useEffect } from "react"
import type { Person, Relation } from "./types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const RELATION_LABELS: Record<Relation, string> = {
  self: "Self",
  partner: "Partner",
  family: "Family",
  friend: "Friend",
  colleague: "Colleague",
}

// ── Session usage counter ─────────────────────────────────────────────────────
interface UsageData {
  tier: string
  used: number
  limit: number
  remaining: number
}

function SessionCounter() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/user/usage", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUsage(data))
      .catch(() => setUsage(null))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || !usage) return null

  const isPro = usage.tier === "pro"
  const pct = Math.min(100, Math.round((usage.used / Math.max(usage.limit, 1)) * 100))
  const low = !isPro && usage.remaining <= 1
  const warn = !isPro && usage.remaining <= 2

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mb-4 px-4 py-3 border border-white/[0.06] bg-white/[0.02]"
        style={{ borderRadius: "var(--radius-container)" }}
      >
        {isPro ? (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
              Sessions
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#e0743a]/60">
              Pro · Unlimited
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
                Sessions today
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                  low ? "text-red-400/80" : warn ? "text-[#e0743a]/70" : "text-[#76716b]"
                }`}
              >
                {usage.remaining === 0 ? "Limit reached" : `${usage.remaining} left`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] w-full bg-white/[0.06] overflow-hidden" style={{ borderRadius: 2 }}>
              <motion.div
                className={`h-full ${low ? "bg-red-400/70" : warn ? "bg-[#e0743a]/60" : "bg-white/20"}`}
                style={{ borderRadius: 2 }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[8px] text-[#4f4b47]">
                {usage.used} / {usage.limit} used
              </span>
              {usage.remaining === 0 ? (
                <Link
                  href="/pricing"
                  className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#e0743a]/80 hover:text-[#e0743a] transition-colors"
                >
                  Upgrade →
                </Link>
              ) : low ? (
                <Link
                  href="/pricing"
                  className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#e0743a]/60 hover:text-[#e0743a] transition-colors"
                >
                  Upgrade →
                </Link>
              ) : warn ? (
                <Link
                  href="/pricing"
                  className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
                >
                  Upgrade →
                </Link>
              ) : null}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({
  selectedPerson,
  onSelectPerson,
}: {
  selectedPerson?: Person
  onSelectPerson?: (person: Person) => void
}) {
  const [people, setPeople] = useState<Person[]>([])
  const [addingPerson, setAddingPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState("")
  const [newPersonRelation, setNewPersonRelation] = useState<Relation>("friend")
  const [addingLoading, setAddingLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/people", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { people: [] }))
      .then((data) => {
        if (data.people?.length) setPeople(data.people)
      })
      .catch(() => {})
  }, [])

  const handleAddPerson = async () => {
    if (!newPersonName.trim() || addingLoading) return
    setAddingLoading(true)
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPersonName.trim(), relation: newPersonRelation }),
      })
      if (res.ok) {
        const data = await res.json() as any
        setPeople(prev => [...prev, { id: data.id, name: newPersonName.trim(), relation: newPersonRelation }])
        setNewPersonName("")
        setAddingPerson(false)
      }
    } catch { /* silent */ } finally {
      setAddingLoading(false)
    }
  }

  const selfList = people.filter((p) => p.relation === "self")
  const peopleList = people.filter((p) => p.relation !== "self")

  const navLinks = [
    { href: "/apps/defrag", label: "Defrag" },
    { href: "/apps/alignment", label: "Alignment" },
    { href: "/apps/covenant", label: "Covenant" },
    { href: "/app", label: "Library" },
  ]

  return (
    <div className="flex h-full flex-col font-sans text-sm">

      {/* Space navigation */}
      <div className="border-b border-white/[0.06] py-4 shrink-0">
        <span className="block px-6 mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
          Spaces
        </span>
        <nav className="flex flex-col">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(link.href + "/") ||
              (link.href === "/apps/defrag" && (pathname === "/app" || pathname?.startsWith("/apps/defrag/")))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-6 py-2.5 border-l-2 transition-colors duration-150 font-medium ${
                  active
                    ? "border-[#f4efe9] text-[#f4efe9] bg-white/[0.04]"
                    : "border-transparent text-[#76716b] hover:text-[#c8c2bc] hover:bg-white/[0.02]"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* People / Relational Matrix */}
      <div className="flex-1 overflow-y-auto py-4">
        {onSelectPerson && selectedPerson && (
          <>
            <div className="flex items-center justify-between px-6 mb-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47]">
                Relational Matrix
              </span>
              <button
                onClick={() => setAddingPerson(p => !p)}
                className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#4f4b47] hover:text-[#76716b] transition-colors"
              >
                {addingPerson ? "Cancel" : "+ Add"}
              </button>
            </div>

            {addingPerson && (
              <div className="mx-4 mb-3 p-3 border border-white/[0.08] bg-white/[0.02]" style={{ borderRadius: "var(--radius-container)" }}>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={e => setNewPersonName(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-transparent text-[#f4efe9] placeholder:text-[#4f4b47] outline-none text-[12px] mb-2 border-b border-white/[0.06] pb-2"
                  onKeyDown={e => e.key === "Enter" && handleAddPerson()}
                  autoFocus
                />
                <select
                  value={newPersonRelation}
                  onChange={e => setNewPersonRelation(e.target.value as Relation)}
                  className="w-full bg-[#0c0a0d] text-[#76716b] text-[11px] outline-none mb-2 border border-white/[0.06] px-2 py-1"
                  style={{ borderRadius: 4 }}
                >
                  {(Object.entries(RELATION_LABELS) as [Relation, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddPerson}
                  disabled={!newPersonName.trim() || addingLoading}
                  className="w-full h-7 bg-[#f4efe9] text-[#08070a] text-[11px] font-medium hover:opacity-90 transition-opacity disabled:opacity-30"
                  style={{ borderRadius: 4 }}
                >
                  {addingLoading ? "Adding…" : "Add person"}
                </button>
              </div>
            )}

            <div className="flex flex-col">
              {selfList.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  isSelected={selectedPerson.id === person.id}
                  onSelect={onSelectPerson}
                />
              ))}
              {peopleList.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  isSelected={selectedPerson.id === person.id}
                  onSelect={onSelectPerson}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Session counter — bottom of sidebar */}
      <div className="shrink-0 border-t border-white/[0.05] pt-4">
        <SessionCounter />
      </div>

    </div>
  )
}

function PersonRow({
  person,
  isSelected,
  onSelect,
}: {
  person: Person
  isSelected: boolean
  onSelect: (person: Person) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(person)}
      className={`flex w-full items-center gap-3 px-6 py-2.5 text-left border-l-2 transition-colors duration-150 ${
        isSelected
          ? "border-[#f4efe9] text-[#f4efe9] bg-white/[0.04]"
          : "border-transparent text-[#76716b] hover:text-[#c8c2bc] hover:bg-white/[0.02]"
      }`}
    >
      <span className="truncate font-medium">{person.name}</span>
      <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.14em] text-[#4f4b47]">
        {RELATION_LABELS[person.relation]}
      </span>
    </button>
  )
}