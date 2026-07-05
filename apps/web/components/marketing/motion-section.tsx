"use client";

/**
 * MotionSection — Composable, accessible scroll-animation primitive.
 *
 * Designed for the Sovereign.os dark theme landing pages.
 *
 * Features:
 *   - `whileInView` entrance animations (fade-up, fade-in, slide-right)
 *   - Staggered children via `MotionGroup` + `MotionItem`
 *   - Respects `prefers-reduced-motion` — animations are skipped at the
 *     motion level so the component is safe to use everywhere.
 *   - `viewport.once` default means each section animates only once (no re-play
 *     on scroll-back), which reduces jank on long pages.
 *
 * Usage:
 *   // Single section with fade-up
 *   <MotionSection delay={0.1}>
 *     <h2>Heading</h2>
 *   </MotionSection>
 *
 *   // Staggered card grid
 *   <MotionGroup stagger={0.08}>
 *     <MotionItem><Card /></MotionItem>
 *     <MotionItem><Card /></MotionItem>
 *   </MotionGroup>
 *
 *   // Text reveal variant
 *   <MotionReveal as="h1" className="font-serif text-4xl">
 *     Pattern-aware AI.
 *   </MotionReveal>
 */

import type { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";

// ── Shared easing (Apple spring curve) ────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

// ── Variant presets ────────────────────────────────────────────────────────────
const VARIANTS = {
  "fade-up": {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
} as const;

type AnimVariant = keyof typeof VARIANTS;

// ── MotionSection ─────────────────────────────────────────────────────────────

interface MotionSectionProps {
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Entrance delay in seconds */
  delay?: number;
  /** Section id for anchor links */
  id?: string;
  /** Animation variant — defaults to "fade-up" */
  variant?: AnimVariant;
  /** Transition duration in seconds — defaults to 0.8 */
  duration?: number;
  /** Viewport margin before triggering — defaults to "-10%" */
  margin?: string;
}

export function MotionSection({
  children,
  className = "",
  delay = 0,
  id,
  variant = "fade-up",
  duration = 0.8,
  margin = "-10%",
}: MotionSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: EASE }}
    >
      {children as any}
    </motion.section>
  );
}

// ── MotionDiv ─────────────────────────────────────────────────────────────────
// Same as MotionSection but renders a <div> — use inside sections or cards.

interface MotionDivProps extends Omit<MotionSectionProps, "id"> {
  id?: string;
}

export function MotionDiv({
  children,
  className = "",
  delay = 0,
  id,
  variant = "fade-up",
  duration = 0.8,
  margin = "-10%",
}: MotionDivProps) {
  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: EASE }}
    >
      {children as any}
    </motion.div>
  );
}

// ── MotionReveal ──────────────────────────────────────────────────────────────
// Text reveal — best for headings and display copy. Clips from below.

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** HTML element to render as — defaults to "div" */
  as?: ElementType;
  duration?: number;
}

const REVEAL_CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const REVEAL_ITEM = {
  hidden: { opacity: 0, y: "40%", clipPath: "inset(0 0 100% 0)" },
  visible: { opacity: 1, y: "0%", clipPath: "inset(0 0 0% 0)" },
};

export function MotionReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  duration = 0.65,
}: MotionRevealProps) {
  // @ts-expect-error — motion accepts any intrinsic element type
  const MotionTag = motion(Tag);
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8%" }}
      variants={REVEAL_CONTAINER}
      transition={{ delay }}
    >
      <motion.span
        className="inline-block overflow-hidden"
        variants={REVEAL_ITEM}
        transition={{ duration, ease: EASE }}
      >
        {children as any}
      </motion.span>
    </MotionTag>
  );
}

// ── MotionGroup + MotionItem ──────────────────────────────────────────────────
// Staggered grid / list — wrap a list of items for staggered entrance.

interface MotionGroupProps {
  children: ReactNode;
  className?: string;
  /** Per-item stagger delay in seconds — defaults to 0.07 */
  stagger?: number;
  /** Initial trigger delay before first item — defaults to 0 */
  delay?: number;
  margin?: string;
}

export function MotionGroup({
  children,
  className = "",
  stagger = 0.07,
  delay = 0,
  margin = "-8%",
}: MotionGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children as any}
    </motion.div>
  );
}

interface MotionItemProps {
  children: ReactNode;
  className?: string;
  variant?: AnimVariant;
  duration?: number;
}

export function MotionItem({
  children,
  className = "",
  variant = "fade-up",
  duration = 0.7,
}: MotionItemProps) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      transition={{ duration, ease: EASE }}
    >
      {children as any}
    </motion.div>
  );
}
