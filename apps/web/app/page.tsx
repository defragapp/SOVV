
"use client";

import Link from "next/link";
import { FadeUp, FadeIn } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";
import { MotionSection } from "@/components/marketing/motion-section";
import { SiteShell } from "@/components/marketing/site-shell";

export default function LandingPage() {
  return (
    <SiteShell>
      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <MotionSection className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 border-b border-border overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-glow opacity-30" />
        <FadeIn className="relative z-10 w-full max-w-[760px] mx-auto flex flex-col items-center">
          <p className="text-label text-foreground-disabled mb-12 tracking-[0.25em]">Sovereign.os</p>
          <h1 className="text-display mb-10">
            Healing isn’t optional.<br/>
            Holding the pain is.
          </h1>
          <div className="text-title text-foreground-muted space-y-4 mb-16">
            <p>
              Understand what is shaping your relationships, family dynamics, grief, boundaries, and decisions — and get a clearer way forward.
            </p>
            <p className="text-foreground pt-4">
              See what is actually happening.<br/>
              Understand your role in it.<br/>
              Respond differently.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="https://app.defrag.app/app/login" className="btn-primary w-full sm:w-auto text-center">
              Enter Sovereign.os
            </Link>
            <Link href="https://app.defrag.app/settings" className="btn-secondary w-full sm:w-auto text-center">
              Start Baseline Design
            </Link>
          </div>
        </FadeIn>
      </MotionSection>

      {/* ── 2. What this helps with ──────────────────────────────────────────────── */}
      <MotionSection className="section-gap container-platform">
        <div className="max-w-[760px] mx-auto text-center mb-16">
          <FadeUp>
            <h2 className="text-headline mb-6">
              For the situations that keep repeating.
            </h2>
            <p className="text-body text-foreground-muted">
              Sovereign.os is built for the patterns that do not stay contained to a single moment.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { title: "Relationships", body: "The conversation is not just about the words." },
            { title: "Family dynamics", body: "Some roles survive long after childhood." },
            { title: "Boundaries", body: "Clear in your body. Impossible in your mouth." },
            { title: "Grief", body: "Grief changes how everything lands." },
            { title: "Communication", body: "You have reread it too many times." },
            { title: "Parenting", body: "When the reaction belongs to an older story." },
            { title: "Team dynamics", body: "The same tension. The same outcome." },
            { title: "Faith-context reflection", body: "Discernment without performative certainty." }
          ].map((item, i) => (
            <FadeUp key={i} delay={i * 0.05} className="h-full">
              <Card className="h-full p-6 text-center lg:text-left bg-surface border-border/50">
                <h3 className="text-body font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-caption text-foreground-muted">{item.body}</p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </MotionSection>

      {/* ── 3. What Sovereign.os does ──────────────────────────────────────────────── */}
      <MotionSection className="section-gap border-y border-border bg-surface/30">
        <div className="container-platform max-w-[760px] mx-auto">
          <FadeUp>
            <h2 className="text-headline mb-8 text-center md:text-left">Clarity that changes what happens next.</h2>
            <div className="text-body text-foreground-muted space-y-6">
              <p>Sovereign.os gives structure to what usually stays tangled.</p>
              <p>It helps you see:</p>
              <ul className="space-y-3 pl-4 border-l border-border/50">
                <li><span className="text-foreground-disabled mr-3">/</span>what is actually driving the situation</li>
                <li><span className="text-foreground-disabled mr-3">/</span>what part of it keeps repeating</li>
                <li><span className="text-foreground-disabled mr-3">/</span>how you tend to respond under pressure</li>
                <li><span className="text-foreground-disabled mr-3">/</span>where the pattern holds in place</li>
                <li><span className="text-foreground-disabled mr-3">/</span>what kind of next response could change it</li>
              </ul>
              
              <div className="pt-8 mt-8 border-t border-border/50 flex flex-col md:flex-row gap-8 justify-between text-caption font-mono uppercase tracking-widest text-foreground-disabled">
                <span>No diagnosis.</span>
                <span>No compatibility score.</span>
                <span>No verdict.</span>
              </div>
              <p className="text-body pt-6 text-foreground text-center md:text-left">
                Just a clearer understanding — and a better next move.
              </p>
            </div>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 4. Baseline Design ─────────────────────────────────────────── */}
      <MotionSection className="section-gap border-b border-border bg-surface">
        <div className="container-platform max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <h2 className="text-headline mb-6">Your Baseline Design is the source.</h2>
              <div className="space-y-6 text-body text-foreground-muted">
                <p>
                  Your Baseline Design gives Sovereign.os context for how you process pressure, conflict, connection, repair, timing, and alignment.
                </p>
                <div className="py-4 space-y-2 font-mono text-caption uppercase tracking-widest text-foreground">
                  <p>Not as a label.</p>
                  <p>Not as an excuse.</p>
                  <p>As context.</p>
                </div>
                <p>
                  It gives the platform a starting point for how you move through pressure, protection, repair, and response — so the output is more personal, more relevant, and more useful.
                </p>
              </div>
              <div className="mt-10">
                <Link href="https://app.defrag.app/settings" className="btn-secondary w-full sm:w-auto">
                  Start Baseline Design
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.2} className="relative h-[400px] w-full rounded-2xl border border-border bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden flex items-center justify-center glow-sm">
              <div className="text-center p-8">
                 <p className="text-label text-foreground-disabled mb-8">Active Context</p>
                 <div className="flex gap-4 justify-center">
                   <div className="w-16 h-px bg-white/20" />
                   <div className="w-8 h-px bg-white/40" />
                   <div className="w-24 h-px bg-white/10" />
                 </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </MotionSection>

      {/* ── 5. Defrag ──────────────────────────────────────────────────── */}
      <MotionSection className="section-gap container-platform max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <FadeUp className="order-2 md:order-1 relative h-[400px] w-full rounded-2xl border border-border bg-gradient-to-tr from-white/[0.02] to-transparent overflow-hidden flex items-center justify-center glow-sm">
             <div className="space-y-6 w-full max-w-[280px] px-6">
                <div className="w-full h-px bg-white/10" />
                <div className="w-3/4 h-px bg-white/20" />
                <div className="w-1/2 h-px bg-white/5" />
             </div>
          </FadeUp>
          <FadeUp delay={0.2} className="order-1 md:order-2">
            <h2 className="text-headline mb-6">Defrag is where the pattern becomes workable.</h2>
            <div className="space-y-6 text-body text-foreground-muted">
              <p>
                Defrag helps you make sense of conflict, family roles, grief, boundaries, communication breakdowns, parenting pressure, team dynamics, and relationship patterns.
              </p>
              <p>
                It separates what is happening right now from what has been repeating underneath it — so you can choose a response with more clarity instead of feeding the same outcome again.
              </p>
              <ul className="space-y-3 pl-4 border-l border-border/50 pt-4">
                <li><span className="text-foreground-disabled mr-3">/</span>See what is active.</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Spot what is repeating.</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Notice the role you step into under pressure.</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Get a clearer next response.</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Save what helped.</li>
              </ul>
            </div>
            <div className="mt-10">
              <Link href="https://app.defrag.app/apps/defrag" className="btn-secondary w-full sm:w-auto">
                Explore Defrag
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 6. Covenant ────────────────────────────────────────────────── */}
      <MotionSection className="section-gap border-y border-border bg-surface">
        <div className="container-platform max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <h2 className="text-headline mb-6">Faith connected to repair, responsibility, and the next honest step.</h2>
              <div className="space-y-6 text-body text-foreground-muted">
                <p>
                  Covenant is for users who want faith connected to the work.
                </p>
                <div className="py-4 space-y-2 font-mono text-caption uppercase tracking-widest text-foreground">
                  <p>Not as certainty.</p>
                  <p>Not as performance.</p>
                  <p>Not as a shortcut around responsibility.</p>
                </div>
                <p>
                  Covenant helps bring reflection and grounded discernment into what you are walking through, so the next step can stay honest, practical, and aligned with what you believe.
                </p>
              </div>
              <div className="mt-10">
                <Link href="/covenant" className="btn-secondary w-full sm:w-auto">
                  Explore Covenant
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.2} className="relative h-[400px] w-full rounded-2xl border border-border bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden flex items-center justify-center glow-sm">
               <div className="w-16 h-16 rounded-full border border-white/10" />
            </FadeUp>
          </div>
        </div>
      </MotionSection>

      {/* ── 7. When both sides matter ────────────────────────────────────────── */}
      <MotionSection className="section-gap border-b border-border bg-background">
        <div className="container-platform max-w-[760px] mx-auto text-center md:text-left">
          <FadeUp>
            <h2 className="text-headline mb-6">Some patterns need both sides.</h2>
            <div className="space-y-6 text-body text-foreground-muted">
              <p>
                Two people can move through the same situation and leave with completely different truths.
              </p>
              <p>
                With consent, Sovereign.os can compare two Baseline Designs — not to decide who is right, not to score the relationship, and not to diagnose anyone.
              </p>
              <p>
                It helps show how the same dynamic may be received, protected against, assumed about, feared, or interpreted differently from each side.
              </p>
              <div className="pt-8">
                <Link href="https://app.defrag.app/app/login" className="btn-secondary w-full sm:w-auto">
                  Invite Privately
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 8. Library & 9. Pro ───────────────────────────────────────────── */}
      <MotionSection className="section-gap border-b border-border bg-surface/50">
        <div className="container-platform grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <FadeUp>
            <Card className="h-full bg-surface border-border/50">
              <h3 className="text-headline mb-6">Your Library keeps the work worth returning to.</h3>
              <p className="text-body text-foreground-muted mb-6">
                Save Results, reflections, next responses, Covenant Briefs, and the patterns you do not want to lose once the pressure passes.
              </p>
              <p className="text-body text-foreground-muted mb-10">
                The work should not disappear when the moment changes. Library gives you one private place to return to what actually helped.
              </p>
              <div className="mt-auto">
                <Link href="https://app.defrag.app/app/login" className="btn-secondary w-full sm:w-auto">
                  Open Library
                </Link>
              </div>
            </Card>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Card className="h-full bg-elevated border-border glow-sm flex flex-col">
              <h3 className="text-headline mb-6">Free helps you begin.<br/>Pro helps you stay with it.</h3>
              <p className="text-body text-foreground-muted mb-8">
                Pro is for the patterns that need continuity.
              </p>
              <ul className="space-y-3 pl-4 border-l border-border/50 mb-10 text-body text-foreground-muted">
                <li><span className="text-foreground-disabled mr-3">/</span>Save Results</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Return to your Library</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Use deeper context</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Invite privately</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Work across Defrag and Covenant</li>
                <li><span className="text-foreground-disabled mr-3">/</span>Keep continuity instead of starting over</li>
              </ul>
              <div className="mt-auto">
                <Link href="/pricing" className="btn-primary w-full sm:w-auto">
                  Upgrade to Pro
                </Link>
              </div>
            </Card>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 10. Final CTA ──────────────────────────────────────────────── */}
      <MotionSection className="section-gap bg-hero-glow">
        <div className="container-platform text-center max-w-[760px] mx-auto">
          <FadeUp>
            <p className="text-label text-foreground-disabled mb-8 tracking-[0.25em]">Sovereign.os</p>
            <h2 className="text-display mb-10">
              Healing isn’t optional.<br/>
              Holding the pain is.
            </h2>
            <p className="text-title text-foreground-muted mb-12">
              See what is shaping the pattern.<br/>
              Choose what changes next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://app.defrag.app/app/login" className="btn-primary w-full sm:w-auto">
                Enter Sovereign.os
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>
    </SiteShell>
  );
}
