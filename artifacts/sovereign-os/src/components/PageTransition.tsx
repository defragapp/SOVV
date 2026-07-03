import { motion, useReducedMotion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * 'push'      — iOS push/pop: x offset right→center (in) and center→left (out).
   *               Used for all marketing and auth pages.
   * 'crossfade' — Opacity + subtle scale. Used for interior app spaces
   *               (Defrag ↔ Covenant ↔ Alignment) to signal context-switch
   *               rather than stack navigation.
   */
  variant?: 'push' | 'crossfade';
}

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

  if (variant === 'crossfade') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -4 }}
        transition={{ duration: 0.32, ease: EASE }}
        style={{ minHeight: '100dvh' }}
      >
        {children}
      </motion.div>
    );
  }

  // Default: iOS push/pop with vertical float-in
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: -20, y: -4 }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </motion.div>
  );
}
