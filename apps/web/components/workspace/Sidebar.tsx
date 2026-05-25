"use client"

import { useState, useEffect } from "react"
import type { Person, Tier, Relation } from "./types"

const RELATION_LABELS: Record<Relation, string> = {
  self: "Self",
  partner: "Partner",
  family: "Family",
  friend: "Friend",
  colleague: "Colleague",
}

export default function Sidebar({
  selectedPerson,
  onSelectPerson,
  tier,
}: {
  selectedPerson: Person
  onSelectPerson: (person: Person) => void
  tier: Tier
}) {
  const [search, setSearch] = useState("")
  const [people, setPeople] = useState<Person[]>([])

  useEffect(() => {
    fetch("/api/auth/people", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { people: [] }))
      .then((data) => {
        if (data.people?.length) setPeople(data.people)
      })
      .catch(() => {})
  }, [])

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const selfList = filtered.filter((p) => p.relation === "self")
  const peopleList = filtered.filter((p) => p.relation !== "self")

  return (
    <aside className="flex h-full flex-col border-r border-[#F6F5F3]/10 bg-black">
      <div className="border-b border-[#F6F5F3]/10 p-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full bg-transparent px-2 py-1 font-mono text-xs text-[#F6F5F3] placeholder:text-white/20 focus:outline-none"
        />
      </div>

      <div className="border-b border-[#F6F5F3]/10 py-2">
        <span className="block px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-white/30">
          Self
        </span>
        {selfList.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            isSelected={selectedPerson.id === person.id}
            onSelect={onSelectPerson}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <span className="block px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-white/30">
          People
        </span>
        {peopleList.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            isSelected={selectedPerson.id === person.id}
            onSelect={onSelectPerson}
          />
        ))}
      </div>

      <div className="border-t border-[#F6F5F3]/10 p-2">
        {tier === "pro" ? (
          <button
            type="button"
            className="w-full px-2 py-1 text-left font-mono text-xs uppercase tracking-widest text-white/40 hover:text-[#F6F5F3]"
          >
            + Add Person
          </button>
        ) : (
          <span className="block px-2 py-1 font-mono text-xs uppercase tracking-widest text-white/20">
            Pro: Add People
          </span>
        )}
      </div>
    </aside>
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
      className={`flex w-full items-center gap-3 px-4 py-2 text-left ${
        isSelected
          ? "bg-[#F6F5F3]/5 text-[#F6F5F3]"
          : "text-white/60 hover:bg-[#F6F5F3]/5 hover:text-[#F6F5F3]"
      }`}
    >
      <span className="block h-1.5 w-1.5 shrink-0 bg-[#F6F5F3]/40" />
      <span className="text-sm font-light">{person.name}</span>
      <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/30">
        {RELATION_LABELS[person.relation]}
      </span>
    </button>
  )
}
