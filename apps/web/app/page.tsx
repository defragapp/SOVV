import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/layout-primitives"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center selection:bg-white/20 selection:text-white pb-20">
      
      {/* 1. Hero Section */}
      <Section className="w-full relative flex flex-col items-center justify-center min-h-[90vh] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        <Container className="relative z-10 flex flex-col items-center text-center max-w-4xl space-y-10">
          <Badge variant="outline" className="mb-6">SOVEREIGN.OS</Badge>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#FDFDFD] leading-[1.1]">
              Healing isn’t optional.<br className="hidden md:block" />
              <span className="text-[#A1A1AA]">Holding the pain is.</span>
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl leading-relaxed balance-text">
            Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
          </p>
          
          <div className="text-[#A1A1AA] font-medium space-y-1">
            <p>See what is actually happening.</p>
            <p>Understand your role in it.</p>
            <p className="text-[#FDFDFD]">Respond differently.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">Enter Sovereign.os</Button>
            </Link>
            <Link href="/settings" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">Start Baseline Design</Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 2. What this helps with */}
      <Section className="w-full bg-[#0A0A0A] border-t border-white/5">
        <Container>
          <div className="flex flex-col space-y-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-[#FDFDFD]">What this helps with</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Relationships", desc: "Understand repeating conflicts." },
                { title: "Family dynamics", desc: "See the roles you step into." },
                { title: "Boundaries", desc: "Hold lines without the guilt." },
                { title: "Grief", desc: "Process the space left behind." },
                { title: "Communication", desc: "Say what actually needs saying." },
                { title: "Parenting", desc: "Respond instead of reacting." },
                { title: "Team dynamics", desc: "Clear the friction at work." },
                { title: "Faith context", desc: "Reflect with responsibility." }
              ].map((item, i) => (
                <Card key={i} variant="elevated" className="border-white/5 hover:border-white/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-[#A1A1AA] mt-2">{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. What Sovereign.os does */}
      <Section className="w-full">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#FDFDFD] leading-tight">
                Clarity that changes what happens next.
              </h2>
              <div className="space-y-6 text-lg text-[#A1A1AA] leading-relaxed">
                <p>Sovereign.os gives structure to what usually stays tangled.</p>
                <p>It helps you see:</p>
                <ul className="space-y-3 list-none pl-4 border-l border-white/10">
                  <li>what is actually driving the situation</li>
                  <li>what part of it keeps repeating</li>
                  <li>how you tend to respond under pressure</li>
                  <li>where the pattern holds in place</li>
                  <li>what kind of next response could change it</li>
                </ul>
              </div>
            </div>
            
            <Card variant="premium" className="p-8 md:p-12 space-y-6">
              <Badge variant="outline">Trust Block</Badge>
              <div className="space-y-4 text-xl font-medium text-[#A1A1AA]">
                <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> No diagnosis.</p>
                <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> No compatibility score.</p>
                <p className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> No verdict.</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-lg text-[#FDFDFD]">Just a clearer understanding — and a better next move.</p>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 4. Baseline Design */}
      <Section className="w-full bg-[#0A0A0A] border-y border-white/5">
        <Container className="max-w-4xl text-center space-y-8">
          <Badge>Baseline Design</Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Your Baseline Design is the source.</h2>
          <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
            Your Baseline Design gives Sovereign.os context for how you process pressure, conflict, connection, repair, timing, and alignment.
          </p>
          <div className="flex justify-center gap-8 text-[#A1A1AA] font-medium py-4">
            <span className="line-through decoration-white/20">Not as a label.</span>
            <span className="line-through decoration-white/20">Not as an excuse.</span>
            <span className="text-[#FDFDFD]">As context.</span>
          </div>
          <Link href="/settings" className="inline-block mt-8">
            <Button variant="secondary">Start Baseline Design</Button>
          </Link>
        </Container>
      </Section>

      {/* 5. Defrag */}
      <Section className="w-full">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <Badge variant="defrag">Defrag Space</Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                Defrag is where the pattern becomes workable.
              </h2>
              <div className="space-y-6 text-lg text-[#A1A1AA] leading-relaxed">
                <p>Defrag helps you make sense of conflict, family roles, grief, boundaries, communication breakdowns, parenting pressure, team dynamics, and relationship patterns.</p>
                <p>It separates what is happening right now from what has been repeating underneath it — so you can choose a response with more clarity instead of feeding the same outcome again.</p>
              </div>
              <Link href="/apps/defrag" className="inline-block pt-4">
                <Button>Explore Defrag</Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
               <Card className="bg-[#111111] p-8 space-y-4">
                  {[
                    "See what is active.",
                    "Spot what is repeating.",
                    "Notice the role you step into under pressure.",
                    "Get a clearer next response.",
                    "Save what helped."
                  ].map((val, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FDFDFD]" />
                      <p className="text-[#FDFDFD]">{val}</p>
                    </div>
                  ))}
               </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. Covenant */}
      <Section className="w-full bg-[#0A0A0A] border-t border-white/5">
        <Container className="max-w-4xl text-center space-y-8">
          <Badge variant="covenant">Covenant Space</Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Faith connected to repair, responsibility, and the next honest step.</h2>
          <p className="text-lg text-[#A1A1AA] leading-relaxed mx-auto max-w-2xl">
            Covenant is for users who want faith connected to the work.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[#A1A1AA] font-medium py-4">
            <span className="line-through decoration-white/20">Not as certainty.</span>
            <span className="line-through decoration-white/20">Not as performance.</span>
            <span className="text-[#FDFDFD]">Not as a shortcut around responsibility.</span>
          </div>
          <Link href="/apps/covenant" className="inline-block mt-4">
            <Button variant="secondary">Explore Covenant</Button>
          </Link>
        </Container>
      </Section>

      {/* 7. When both sides matter */}
      <Section className="w-full">
        <Container className="max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Some patterns need both sides.</h2>
          <p className="text-lg text-[#A1A1AA] leading-relaxed">
            With consent, Sovereign.os can compare two Baseline Designs — not to decide who is right, not to score the relationship, and not to diagnose anyone.
          </p>
          <p className="text-lg text-[#FDFDFD]">
            It helps show how the same dynamic may be experienced differently from each side.
          </p>
          <div className="pt-8">
            <Button variant="secondary">Invite Privately</Button>
          </div>
        </Container>
      </Section>

      {/* 8. Library */}
      <Section className="w-full bg-[#0A0A0A] border-y border-white/5">
        <Container className="max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Your Library keeps the work worth returning to.</h2>
          <p className="text-lg text-[#A1A1AA] leading-relaxed mx-auto max-w-2xl">
            Save Results, reflections, next responses, Covenant Briefs, and the patterns you do not want to lose once the pressure passes.
          </p>
          <Link href="/app" className="inline-block pt-8">
            <Button variant="secondary">Open Library</Button>
          </Link>
        </Container>
      </Section>

      {/* 9. Pro Pricing */}
      <Section className="w-full">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                <Badge variant="pro">Pro Plan</Badge>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                  Free helps you begin.<br />
                  <span className="text-[#A1A1AA]">Pro helps you stay with it.</span>
                </h2>
                <p className="text-xl text-[#FDFDFD]">Pro is for the patterns that need continuity.</p>
                <Link href="/pricing" className="inline-block pt-4">
                  <Button variant="premium" size="lg">Upgrade to Pro</Button>
                </Link>
             </div>
             <div>
               <Card variant="premium" className="p-8">
                  <ul className="space-y-6">
                    {[
                      "Save Results",
                      "Return to your Library",
                      "Use deeper context",
                      "Invite privately",
                      "Work across Defrag and Covenant",
                      "Keep continuity instead of starting over every time something repeats"
                    ].map((val, i) => (
                      <li key={i} className="flex items-start gap-4 text-[#A1A1AA]">
                        <svg className="w-6 h-6 text-[#FDFDFD] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{val}</span>
                      </li>
                    ))}
                  </ul>
               </Card>
             </div>
          </div>
        </Container>
      </Section>

      {/* 10. Final CTA */}
      <Section className="w-full bg-[#0A0A0A] border-t border-white/5 py-32">
        <Container className="text-center space-y-10 max-w-3xl">
          <Badge variant="outline">SOVEREIGN.OS</Badge>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tighter">
              Healing isn’t optional.<br />
              <span className="text-[#A1A1AA]">Holding the pain is.</span>
            </h2>
          </div>
          <div className="text-xl text-[#A1A1AA] font-medium space-y-2">
            <p>See what is shaping the pattern.</p>
            <p className="text-[#FDFDFD]">Choose what changes next.</p>
          </div>
          <div className="pt-8">
            <Link href="/login">
              <Button size="lg">Enter Sovereign.os</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  )
}
