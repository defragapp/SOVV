"use client";

import Link from "next/link";
import { FadeUp, FadeIn } from "@/components/ui/fade-up";
import { Card } from "@/components/marketing/card";
import { MotionSection } from "@/components/marketing/motion-section";

const BENTO_ITEMS = [
  {
    title: "The message is not just the message.",
    body: "You have reread it too many times. Before you send it, understand the pattern.",
    size: "col-span-1",
  },
  {
    title: "The role is older than the argument.",
    body: "The conversation pulled you back into something older than the argument. Some family roles survive long after childhood.",
    size: "col-span-1 md:col-span-2",
  },
  {
    title: "The boundary is not the problem.",
    body: "Clear in your body. Impossible in your mouth. A boundary is not a punishment — it is a return to alignment.",
    size: "col-span-1 md:col-span-2",
  },
  {
    title: "Grief changes how everything lands.",
    body: "Grief changes how everything lands. The same words hit differently.",
    size: "col-span-1",
  },
  {
    title: "The other side may not be lying. They may be living from another map.",
    body: "Two people can live through the same conversation and leave with completely different truths. The other side is not always the enemy. Sometimes it is another nervous system, another history, another map.",
    size: "col-span-1 md:col-span-3",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 surface-glass border-b border-border flex items-center">
        <div className="container-platform w-full flex items-center justify-between">
          <Link href="/" className="text-label text-foreground hover:text-white transition-colors">
            SOVEREIGN.OS
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/product", label: "Product" },
              { href: "/pricing", label: "Pricing" },
              { href: "/covenant", label: "Covenant" },
            ].map(item => (
              <Link key={item.href} href={item.href} className="text-body-sm text-foreground-muted hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="hidden md:block text-body-sm text-foreground-disabled hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="https://app.defrag.app/app/login" className="btn-primary py-2 px-5 text-sm">
              Enter
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <MotionSection className="relative min-h-[90vh] flex flex-col items-center justify-center text-center section-gap px-6 border-b border-border overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-glow opacity-60" />
        <FadeIn className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-label text-foreground-disabled mb-8 tracking-[0.25em]">Sovereign.os</p>
          <h1 className="text-display mb-8">
            Healing isn’t optional.<br/>
            Holding the pain is.
          </h1>
          <p className="text-body text-foreground-muted max-w-2xl mx-auto mb-10">
            For the moments you keep replaying, the patterns you keep meeting, and the responses you are ready to change.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="https://app.defrag.app/app/login" className="btn-primary">
              Enter Sovereign.os
            </Link>
            <Link href="/product" className="btn-ghost">
              Explore the system →
            </Link>
          </div>
        </FadeIn>
      </MotionSection>

      {/* ── 2. The Real Moments ──────────────────────────────────────────────── */}
      <MotionSection className="section-gap container-platform">
        <div className="max-w-2xl mb-16">
          <FadeUp>
            <h2 className="text-headline mb-6">
              The moment happened once. The pattern keeps happening until you can see it.
            </h2>
            <p className="text-body text-foreground-muted">
              This is not about “getting insights.” This is about the moment you keep replaying. The message you should not send. The family role you keep stepping back into. The version of you that learned to survive — and now needs another option.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENTO_ITEMS.map((item, i) => (
            <FadeUp key={i} delay={i * 0.1} className={item.size}>
              <Card className="h-full">
                <h3 className="text-title mb-4">{item.title}</h3>
                <p className="text-body-sm text-foreground-muted">{item.body}</p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </MotionSection>

      {/* ── 4. Baseline Design ─────────────────────────────────────────── */}
      <MotionSection className="section-gap border-y border-border bg-surface">
        <div className="container-platform">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="text-label mb-6 text-foreground-disabled">The Source Map</p>
              <h2 className="text-headline mb-6">Your Baseline Design is the source.</h2>
              <div className="space-y-6 text-body text-foreground-muted">
                <p>
                  It gives the system a starting point for how you tend to process pressure, conflict, connection, timing, repair, and alignment.
                </p>
                <p>
                  Not as a label. Not as an excuse. As context.
                </p>
                <p>
                  So the work does not begin with “what is wrong with me?” It begins with “what pattern is active, and what response would actually change it?”
                </p>
              </div>
              <div className="mt-10">
                <Link href="https://app.defrag.app/settings" className="btn-secondary">
                  Start Baseline Design
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.2} className="relative h-[400px] w-full rounded-2xl border border-border bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden flex items-center justify-center glow-hero">
              <div className="text-center p-8">
                 <p className="text-label text-foreground-disabled mb-4">Baseline Active</p>
                 <div className="flex gap-2 justify-center mb-6">
                   <div className="w-16 h-1 bg-white/20 rounded-full" />
                   <div className="w-8 h-1 bg-white/40 rounded-full" />
                   <div className="w-24 h-1 bg-white/10 rounded-full" />
                 </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </MotionSection>

      {/* ── 5. Defrag ──────────────────────────────────────────────────── */}
      <MotionSection className="section-gap container-platform">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp className="order-2 lg:order-1 relative h-[400px] w-full rounded-2xl border border-border bg-gradient-to-tr from-white/[0.03] to-transparent overflow-hidden flex items-center justify-center glow-sm">
             <div className="space-y-4 w-full max-w-sm px-6">
                <div className="w-full h-12 rounded-xl border border-white/10 bg-white/5" />
                <div className="w-3/4 h-12 rounded-xl border border-white/10 bg-white/5" />
             </div>
          </FadeUp>
          <FadeUp delay={0.2} className="order-1 lg:order-2">
            <p className="text-label mb-6 text-foreground-disabled">Defrag Space</p>
            <h2 className="text-headline mb-6">Defrag is for the moment that will not leave you alone.</h2>
            <div className="space-y-6 text-body text-foreground-muted">
              <p>
                A conversation. A message. A family pattern. A boundary. A loss. A role you keep carrying. A reaction that felt bigger than the situation.
              </p>
              <p>
                Defrag helps you slow the moment down, separate what happened from what repeated, and find the next response that does not keep feeding the same pattern.
              </p>
              <p>
                <strong>The conversation is not just about the words.</strong>
              </p>
            </div>
            <div className="mt-10">
              <Link href="https://app.defrag.app/apps/defrag" className="btn-secondary">
                Explore Defrag
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 7. Invite Privately ────────────────────────────────────────── */}
      <MotionSection className="section-gap border-y border-border bg-surface">
        <div className="container-platform max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-headline mb-6">Some patterns need both sides.</h2>
            <div className="space-y-6 text-body text-foreground-muted max-w-2xl mx-auto">
              <p>
                Two people can live through the same conversation and leave with completely different truths.
              </p>
              <p>
                With permission, Sovereign.os can help compare two Baseline Designs — not to decide who is right, not to score compatibility, and not to diagnose the relationship. To show how each person may be receiving, protecting, assuming, fearing, or reaching from a different internal map.
              </p>
              <p className="text-foreground">
                When both sides matter, invite privately.
              </p>
            </div>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 6. Covenant ────────────────────────────────────────────────── */}
      <MotionSection className="section-gap container-platform">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <p className="text-label mb-6 text-foreground-disabled">Covenant Space</p>
            <h2 className="text-headline mb-6">Faith, reflection, responsibility, and grounded discernment.</h2>
            <div className="space-y-6 text-body text-foreground-muted">
              <p>
                Covenant is for the user who wants faith to stay connected to the work. Not as certainty. Not as performance. Not as a spiritual shortcut.
              </p>
              <p>
                Covenant helps bring faith, reflection, responsibility, repair, and grounded discernment into what you are walking through — so the next step can be honest, not just emotional.
              </p>
            </div>
            <div className="mt-10">
              <Link href="/covenant" className="btn-secondary">
                Explore Covenant
              </Link>
            </div>
          </FadeUp>
          <FadeUp delay={0.2} className="relative h-[400px] w-full rounded-2xl border border-border bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden flex items-center justify-center glow-sm">
             <div className="w-16 h-16 rounded-full border border-white/20" />
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 8. Library & Pro ───────────────────────────────────────────── */}
      <MotionSection className="section-gap border-t border-border">
        <div className="container-platform grid grid-cols-1 md:grid-cols-2 gap-8">
          <FadeUp>
            <Card className="h-full bg-surface" glow>
              <p className="text-label mb-4 text-foreground-disabled">The Library</p>
              <h3 className="text-title mb-4">Save what you learn before you lose it.</h3>
              <p className="text-body-sm text-foreground-muted">
                Your Library keeps what the moment taught you. The response you found. The pattern you finally saw. The boundary that became clear. Save to Sovereign before the moment disappears.
              </p>
            </Card>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Card className="h-full bg-surface" glow>
              <p className="text-label mb-4 text-foreground-disabled">Sovereign.os Pro</p>
              <h3 className="text-title mb-4">For the work that needs continuity.</h3>
              <p className="text-body-sm text-foreground-muted">
                Free is for beginning the work. Pro is for the patterns that need more than one pass. Build continuity instead of starting over every time something hurts.
              </p>
              <div className="mt-6">
                <Link href="/pricing" className="text-sm text-foreground hover:text-white underline underline-offset-4 transition-colors">
                  View Pro details →
                </Link>
              </div>
            </Card>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── 10. Final CTA ──────────────────────────────────────────────── */}
      <MotionSection className="section-gap border-t border-border bg-hero-glow">
        <div className="container-platform text-center max-w-3xl mx-auto">
          <FadeUp>
            <h2 className="text-display mb-8">
              Healing isn’t optional.<br/>
              Holding the pain is.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link href="https://app.defrag.app/app/login" className="btn-primary">
                Enter Sovereign.os
              </Link>
            </div>
          </FadeUp>
        </div>
      </MotionSection>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-black py-16">
        <div className="container-platform flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-foreground-disabled">
          <div className="flex items-center gap-6">
            <span className="text-label">SOVEREIGN.OS</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
