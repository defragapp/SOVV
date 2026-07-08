"use client"

import { motion } from "framer-motion"
import { constitutionalResponseStructure } from "@/data/understanding"

type ResponseLabel = (typeof constitutionalResponseStructure)[number]

export interface StructuredResponseSection {
  readonly label: ResponseLabel
  readonly value?: string
  readonly emphasis?: boolean
}

interface ResponseStructureProps {
  readonly sections: readonly StructuredResponseSection[]
}

export function ResponseStructure({ sections }: ResponseStructureProps) {
  const visibleSections = sections.filter((section) => Boolean(section.value?.trim()))

  if (visibleSections.length === 0) return null

  return (
    <div className="px-6 py-6">
      {visibleSections.map((section, index) => (
        <motion.div
          key={section.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`border-b border-white/[0.05] pb-5 mb-5 last:border-0 last:pb-0 last:mb-0 ${section.emphasis ? "rounded-lg border border-[#e0743a]/15 bg-[#e0743a]/[0.045] px-4 py-4" : ""}`}
        >
          <p className={`font-mono text-[9px] uppercase tracking-[0.2em] mb-2 ${section.emphasis ? "text-[#e0743a]/80" : "text-[#e0743a]/60"}`}>
            {section.label}
          </p>
          <p className={`text-[14px] leading-[1.7] ${section.emphasis ? "text-[#f4efe9]" : "text-[#f4efe9]"}`}>
            {section.value}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
