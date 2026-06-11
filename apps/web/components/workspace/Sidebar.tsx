"use client"

import { useState, useEffect } from "react"
import type { Person, Relation } from "./types"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
}: {
  selectedPerson?: Person
  onSelectPerson?: (person: Person) => void
}) {
  const [people, setPeople] = useState<Person[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/auth/people", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { people: [] }))
      .then((data) => {
        if (data.people?.length) setPeople(data.people)
      })
      .catch(() => {})
  }, [])

  const selfList = people.filter((p) => p.relation === "self")
  const peopleList = people.filter((p) => p.relation !== "self")

  return (
    <div className="flex h-full flex-col font-mono text-sm">
      <div className="border-b border-border py-4">
        <span className="block px-6 mb-2 text-xs text-foreground-muted uppercase tracking-widest">
          Active Engines
        </span>
        <nav className="flex flex-col">
          <Link href="/apps/defrag" className={`px-6 py-2 border-l-2 transition-colors ${pathname === '/apps/defrag' || pathname === '/app' ? 'border-foreground text-foreground bg-surface' : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-surface'}`}>
            Defrag
          </Link>
          <Link href="/apps/alignment" className={`px-6 py-2 border-l-2 transition-colors ${pathname === '/apps/alignment' ? 'border-foreground text-foreground bg-surface' : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-surface'}`}>
            Alignment
          </Link>
          <Link href="/apps/covenant" className={`px-6 py-2 border-l-2 transition-colors ${pathname === '/apps/covenant' ? 'border-foreground text-foreground bg-surface' : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-surface'}`}>
            Covenant
          </Link>
          <Link href="/app" className={`px-6 py-2 border-l-2 transition-colors ${pathname === '/app' && !pathname.startsWith('/apps/') ? 'border-foreground text-foreground bg-surface' : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-surface'}`}>
            Library
          </Link>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {onSelectPerson && selectedPerson && (
           <>
            <span className="block px-6 mb-2 text-xs text-foreground-muted uppercase tracking-widest">
              Relational Matrix
            </span>
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
      className={`flex w-full items-center gap-3 px-6 py-2 text-left border-l-2 transition-colors ${
        isSelected
          ? "border-foreground text-foreground bg-surface"
          : "border-transparent text-foreground-muted hover:text-foreground hover:bg-surface"
      }`}
    >
      <span className="truncate">{person.name}</span>
      <span className="ml-auto text-[10px] uppercase tracking-widest text-foreground-disabled">
        {RELATION_LABELS[person.relation]}
      </span>
    </button>
  )
}
