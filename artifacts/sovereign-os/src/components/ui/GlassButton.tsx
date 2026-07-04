import { motion, useReducedMotion } from 'framer-motion';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * The platform glass-slab button standard.
 * Variant 'primary' — cream fill, dark text (LoginScreen derivation).
 * Variant 'glass'   — frosted glass, light text (interior spaces derivation).
 * Never rounded-full. Always rounded-2xl.
 */
export type GlassButtonVariant = 'primary' | 'glass';

const STYLE: Record<GlassButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#f4efe9',
    color: '#08070a',
  },
  glass: {
    background: 'rgba(255,255,255,0.06)',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: '#f4efe9',
  },
};

interface GlassButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: GlassButtonVariant;
}

export function GlassButton({
  variant = 'primary',
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: GlassButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={prefersReducedMotion || disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
      style={STYLE[variant]}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
