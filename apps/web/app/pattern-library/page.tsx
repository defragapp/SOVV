import type { Metadata } from "next"
import { SiteShell } from "@/components/marketing/site-shell"
import { Container } from "@/components/ui/layout-primitives"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pattern Library — Sovereign.os",
  description: "Curated named patterns with descriptions — common relational, emotional, and behavioral patterns explained.",
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <span className="h-px w-6 bg-[#e0743a]/60" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#a8a29a]">{children}</span>
    </div>
  )
}

type PatternCategory = "relational" | "emotional" | "behavioral" | "family" | "boundary"

interface Pattern {
  id: string
  name: string
  category: PatternCategory
  shortDesc: string
  fullDesc: string
  signals: string[]
  nextMove: string
}

const CATEGORY_LABELS: Record<PatternCategory, string> = {
  relational: "Relational",
  emotional: "Emotional",
  behavioral: "Behavioral",
  family: "Family",
  boundary: "Boundary",
}

const PATTERNS: Pattern[] = [
  {
    id: "pursue-withdraw",
    name: "Pursue–Withdraw",
    category: "relational",
    shortDesc: "One person reaches; the other pulls back. Distance grows.",
    fullDesc: "A cyclical dynamic where one person increases contact, urgency, or emotional expression while the other decreases engagement or goes silent. The pursuer's reaching triggers the withdrawer's retreat, which triggers more pursuing. Neither is wrong — both are protecting something.",
    signals: ["Checking your phone repeatedly", "Silence that feels louder than words", "The argument that ends without resolution", "Feeling like you're always the one who reaches"],
    nextMove: "Name one feeling and one need — in a single sentence. Send it without asking for a response.",
  },
  {
    id: "overfunctioning",
    name: "Overfunctioning",
    category: "behavioral",
    shortDesc: "Doing more than your share to manage what feels unmanageable.",
    fullDesc: "Taking on responsibility for others' emotions, decisions, or outcomes — often to reduce anxiety or maintain connection. Overfunctioning feels like helpfulness but creates resentment, exhaustion, and dependency. The person being overfunctioned for often underfunctions in response.",
    signals: ["Feeling responsible for how others feel", "Doing things others could do themselves", "Exhaustion that doesn't make sense given the facts", "Resentment that you can't explain"],
    nextMove: "Identify one thing you're carrying that isn't yours. Put it down — not dramatically, just quietly.",
  },
  {
    id: "emotional-cutoff",
    name: "Emotional Cutoff",
    category: "family",
    shortDesc: "Managing unresolved family tension by distance or silence.",
    fullDesc: "A way of handling unresolved emotional intensity in family relationships by reducing or eliminating contact. Cutoff feels like freedom but often recreates the same patterns in new relationships. The intensity doesn't disappear — it relocates.",
    signals: ["Avoiding certain family members or topics", "Feeling relief when you don't have to see someone", "Recreating family dynamics in friendships or partnerships", "Numbness when family comes up"],
    nextMove: "You don't have to reconnect. But notice what you're carrying from the relationship you cut — it's still active.",
  },
  {
    id: "fawn-response",
    name: "Fawn Response",
    category: "emotional",
    shortDesc: "Appeasing others to avoid conflict or abandonment.",
    fullDesc: "A survival response where the person prioritizes others' comfort, approval, or emotional state over their own needs — often to prevent conflict, rejection, or harm. Fawning feels like kindness but is driven by fear. It erodes self-trust over time.",
    signals: ["Agreeing when you don't agree", "Apologizing when you haven't done anything wrong", "Feeling responsible for others' moods", "Difficulty knowing what you actually want"],
    nextMove: "Before your next response, pause and ask: what do I actually think? You don't have to say it yet — just know it.",
  },
  {
    id: "parentified-child",
    name: "Parentified Child",
    category: "family",
    shortDesc: "Taking on emotional or practical responsibility for a parent.",
    fullDesc: "A role assigned (consciously or not) to a child who manages a parent's emotional needs, household, or siblings. The parentified child learns that their needs come second — and carries this into adult relationships as a default operating mode.",
    signals: ["Feeling responsible for your parent's happiness", "Difficulty receiving care without guilt", "Being the 'responsible one' in every group", "Exhaustion from always being the one who holds things together"],
    nextMove: "You were not responsible then. You are not responsible now. Name one thing you need — just for yourself.",
  },
  {
    id: "protest-behavior",
    name: "Protest Behavior",
    category: "relational",
    shortDesc: "Actions designed to get a response from an unavailable person.",
    fullDesc: "Behaviors that signal distress or need to a partner or person who is emotionally unavailable — including excessive contact, withdrawal, threats to leave, or provocative statements. Protest behavior is attachment seeking, not manipulation.",
    signals: ["Sending multiple messages without response", "Threatening to leave when you don't want to", "Picking fights to get a reaction", "Feeling invisible until you escalate"],
    nextMove: "The protest is a signal, not a strategy. What do you actually need from this person? Say that instead.",
  },
  {
    id: "scarcity-loop",
    name: "Scarcity Loop",
    category: "emotional",
    shortDesc: "Operating from 'not enough' — time, love, safety, or worth.",
    fullDesc: "A cognitive and emotional pattern where decisions are made from a baseline assumption of scarcity — that there isn't enough love, time, safety, or value to go around. Scarcity loops create hoarding, competition, and difficulty receiving.",
    signals: ["Difficulty trusting good things to last", "Comparing yourself to others constantly", "Holding back in relationships to protect yourself", "Feeling like you have to earn what you need"],
    nextMove: "Notice one place where you're operating from 'not enough.' What would you do differently if you trusted there was enough?",
  },
  {
    id: "boundary-negotiation",
    name: "Boundary Negotiation",
    category: "boundary",
    shortDesc: "Repeatedly revisiting a limit you've already set.",
    fullDesc: "The pattern of setting a boundary and then softening, explaining, or withdrawing it when met with resistance, guilt, or disappointment. Boundary negotiation signals that the limit was set from obligation rather than clarity — and that the person setting it doesn't yet believe they're allowed to hold it.",
    signals: ["Explaining your 'no' until it becomes a 'yes'", "Feeling guilty for having needs", "Setting limits and then apologizing for them", "Exhaustion after interactions where you 'won' the argument"],
    nextMove: "A boundary doesn't need to be justified. State it once, clearly. Then hold it — not with anger, with steadiness.",
  },
  {
    id: "grief-avoidance",
    name: "Grief Avoidance",
    category: "emotional",
    shortDesc: "Staying busy, numb, or angry to avoid feeling loss.",
    fullDesc: "The pattern of managing grief through activity, intellectualization, anger, or numbness — anything that keeps the actual feeling at a distance. Grief avoidance delays integration and often surfaces as irritability, disconnection, or physical symptoms.",
    signals: ["Staying busy after a loss", "Feeling angry when you expect to feel sad", "Numbness that doesn't lift", "Difficulty talking about what happened without deflecting"],
    nextMove: "You don't have to feel it all at once. Name one thing you've lost — just to yourself. That's enough for now.",
  },
  {
    id: "triangulation",
    name: "Triangulation",
    category: "family",
    shortDesc: "Routing tension between two people through a third.",
    fullDesc: "A relational pattern where tension between two people is managed by involving a third — through gossip, alliance-building, or making someone else the focus of the conflict. Triangulation reduces anxiety temporarily but prevents direct resolution.",
    signals: ["Being told things about someone who isn't in the room", "Feeling caught between two people", "Becoming the messenger in someone else's conflict", "Alliances that shift depending on who's present"],
    nextMove: "Step out of the triangle. You can care about both people without carrying their conflict. Name what's yours to hold — and what isn't.",
  },
  {
    id: "hypervigilance",
    name: "Hypervigilance",
    category: "behavioral",
    shortDesc: "Scanning for threat in environments that are safe.",
    fullDesc: "A state of heightened alertness — reading tone, body language, and silence for signs of danger, rejection, or conflict. Hypervigilance was adaptive in environments where threat was real. In safe environments, it creates exhaustion and misreads neutral signals as hostile.",
    signals: ["Reading tone in every message", "Preparing for conflict that doesn't come", "Difficulty relaxing in relationships", "Feeling like you're always waiting for something to go wrong"],
    nextMove: "Notice one moment today where you scanned for threat and found none. Let that register — not as proof you're safe, just as data.",
  },
  {
    id: "identity-foreclosure",
    name: "Identity Foreclosure",
    category: "behavioral",
    shortDesc: "Committing to a role or identity without exploring alternatives.",
    fullDesc: "Adopting an identity — the responsible one, the caretaker, the achiever, the black sheep — without questioning whether it fits. Identity foreclosure often happens in response to family pressure or early survival needs. The role becomes the self.",
    signals: ["Feeling trapped in a version of yourself you didn't choose", "Difficulty imagining who you'd be without your role", "Resentment toward people who seem to have more freedom", "Performing a version of yourself that feels hollow"],
    nextMove: "The role isn't you. Name one thing you want that has nothing to do with the role you've been playing.",
  },
]

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PatternCategory[]

export default function PatternLibraryPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-20 bg-[#08070a] overflow-hidden border-b border-white/5">
        <div className="light-beam opacity-40" aria-hidden />
        <Container className="relative z-10 max-w-3xl">
          <MetaLabel>Pattern Library</MetaLabel>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] text-[#f4efe9] leading-[1.05] tracking-[-0.02em] text-balance mb-4">
            Named patterns.
            <br />
            <span style={{ color: "rgba(244,239,233,0.45)" }}>What they are. What they do.</span>
          </h1>
          <p className="text-[#76716b] text-base leading-relaxed max-w-md">
            Curated relational, emotional, behavioral, and family patterns — with signals and a next move for each.
          </p>
        </Container>
      </section>

      {/* Category nav */}
      <section className="w-full py-6 bg-[#0c0a0d] border-b border-white/[0.04] sticky top-[68px] z-30">
        <Container className="max-w-4xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <a
              href="#all"
              className="font-mono text-[9px] uppercase tracking-[0.18em] px-3 py-1.5 border border-white/[0.08] text-[#76716b] hover:text-[#f4efe9] hover:border-white/[0.16] transition-colors whitespace-nowrap"
              style={{ borderRadius: 6 }}
            >
              All ({PATTERNS.length})
            </a>
            {CATEGORIES.map((cat) => {
              const count = PATTERNS.filter((p) => p.category === cat).length
              return (
                <a
                  key={cat}
                  href={`#${cat}`}
                  className="font-mono text-[9px] uppercase tracking-[0.18em] px-3 py-1.5 border border-white/[0.06] text-[#4f4b47] hover:text-[#76716b] hover:border-white/[0.10] transition-colors whitespace-nowrap"
                  style={{ borderRadius: 6 }}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </a>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Patterns */}
      <section id="all" className="w-full py-16 md:py-20 bg-[#08070a]">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-4">
            {PATTERNS.map((pattern) => (
              <details
                key={pattern.id}
                id={pattern.category}
                className="group border border-white/[0.07] bg-[#0c0a0d] overflow-hidden"
                style={{ borderRadius: 12 }}
              >
                <summary className="flex items-start justify-between px-6 py-5 cursor-pointer list-none hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col gap-2 flex-1 pr-6">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-mono text-[8px] uppercase tracking-[0.16em] border px-2 py-0.5 text-[#e0743a]/60 border-[#e0743a]/20"
                        style={{ borderRadius: 3 }}
                      >
                        {CATEGORY_LABELS[pattern.category]}
                      </span>
                    </div>
                    <h3 className="text-[16px] text-[#f4efe9] font-medium leading-snug">{pattern.name}</h3>
                    <p className="text-[13px] text-[#76716b] leading-relaxed">{pattern.shortDesc}</p>
                  </div>
                  <span className="font-mono text-[14px] text-[#4f4b47] shrink-0 mt-1 group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>

                <div className="px-6 pb-6 flex flex-col gap-5 border-t border-white/[0.05] pt-5">
                  {/* Full description */}
                  <p className="text-[14px] text-[#c8c2bc] leading-relaxed">{pattern.fullDesc}</p>

                  {/* Signals */}
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#76716b] mb-3">Signals</p>
                    <div className="flex flex-col gap-2">
                      {pattern.signals.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[#e0743a]/40 text-[10px] mt-0.5 shrink-0">—</span>
                          <p className="text-[13px] text-[#a8a29a] leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next move */}
                  <div className="border border-[#e0743a]/15 bg-[#e0743a]/[0.04] px-5 py-4" style={{ borderRadius: 8 }}>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-2">Next move</p>
                    <p className="text-[14px] text-[#f4efe9] leading-relaxed">{pattern.nextMove}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-3">
                    <Link
                      href="/apps/defrag/workspace"
                      className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#e0743a]/70 hover:text-[#e0743a] transition-colors"
                    >
                      Defrag this pattern →
                    </Link>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="w-full py-20 bg-[#0c0a0d] border-t border-white/[0.04] text-center">
        <Container className="max-w-xl">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#4f4b47] mb-4">Bring your moment</p>
          <h2 className="font-serif text-3xl text-[#f4efe9] tracking-[-0.02em] mb-4">
            Recognizing the pattern is the first move.
          </h2>
          <p className="text-[#76716b] text-base leading-relaxed mb-8 max-w-sm mx-auto">
            Defrag reads your specific situation through your Baseline Design — not a generic pattern list.
          </p>
          <Link href="/app/login" className="btn-primary">
            Enter Sovereign.os
          </Link>
        </Container>
      </section>
    </SiteShell>
  )
}