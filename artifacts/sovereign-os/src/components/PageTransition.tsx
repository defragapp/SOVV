import { motion, useReducedMotion } from 'framer-motion';

/**
 * Cinematic ease — ease-out-quad. Feels like breath, not a spring.
 */
const EASE_CINEMA: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * 'push'      — Marketing / auth: pages arrive from below like a revelation.
   * 'crossfade' — App spaces: opacity + gentle lift, like the next breath.
   */
  variant?: 'push' | 'crossfade';
}

/**
 * Crossfade variants with per-variant transition timing.
 * Framer Motion reads the `transition` key inside each variant when animating to it.
 * Distinct enter (550ms) vs. exit (250ms) so exits feel decisive, not lingering.
 */
const crossfadeVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.25, ease: EASE_CINEMA },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_CINEMA },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: EASE_CINEMA },
  },
} as const;

export function PageTransition({ children, variant = 'push' }: PageTransitionProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        style={{ minHeight: '100dvh' }}
      >
        {children}
      </motion.div>
    );
  }

  // App spaces: feel like consulting the same consciousness, just shifted.
  if (variant === 'crossfade') {
    return (
      <motion.div
        variants={crossfadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ minHeight: '100dvh' }}
      >
        {children}
      </motion.div>
    );
  }

  // Marketing / auth: pages arrive from below. No lateral snap — immersion over navigation.
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.5, ease: EASE_CINEMA }}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </motion.div>
  );
}
