import { useReducedMotion } from 'framer-motion';

/**
 * SpaceGlow — per-space ambient color temperature.
 *
 * Defrag:    neutral warm amber   (default OS glow)
 * Covenant:  warmer golden amber  (deeper, more grounded)
 * Alignment: cooler blue-indigo   (sharper, more analytical)
 * Archive:   cool neutral         (quieter, archived)
 *
 * Fixed behind all space content. Hidden under prefers-reduced-motion.
 */

export type SpaceVariant = 'defrag' | 'covenant' | 'alignment' | 'archive';

const GLOW: Record<SpaceVariant, { a: string; b: string }> = {
  defrag: {
    a: 'rgba(224,116,58,0.055)',
    b: 'rgba(224,116,58,0.022)',
  },
  covenant: {
    // Warmer — golden-amber temperature
    a: 'rgba(218,150,55,0.065)',
    b: 'rgba(200,120,40,0.028)',
  },
  alignment: {
    // Cooler — blue-indigo shift
    a: 'rgba(80,120,210,0.055)',
    b: 'rgba(60,100,190,0.022)',
  },
  archive: {
    // Quiet cool-neutral
    a: 'rgba(100,115,155,0.04)',
    b: 'rgba(80,95,135,0.018)',
  },
};

export function SpaceGlow({ variant }: { variant: SpaceVariant }) {
  const prefersReduced = useReducedMotion();

  const c = GLOW[variant];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <div
        className="absolute -top-48 right-0 w-[900px] h-[900px]"
        style={{
          background: `radial-gradient(circle, ${c.a} 0%, transparent 65%)`,
          animation: prefersReduced ? 'none' : 'ambientDrift 28s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute bottom-0 -left-48 w-[600px] h-[600px]"
        style={{
          background: `radial-gradient(circle, ${c.b} 0%, transparent 65%)`,
          animation: prefersReduced ? 'none' : 'ambientDrift 36s ease-in-out infinite reverse',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
