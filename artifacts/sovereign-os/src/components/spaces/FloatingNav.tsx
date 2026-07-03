import { Link, useLocation } from 'wouter';
import { useUserTier } from '@/context/UserContext';

const ALL_SPACES = [
  { href: '/apps/defrag',    label: 'Defrag',    gated: false },
  { href: '/apps/covenant',  label: 'Covenant',  gated: true  },
  { href: '/apps/alignment', label: 'Alignment', gated: true  },
  { href: '/apps/archive',   label: 'Archive',   gated: true  },
] as const;

/** iOS Dynamic Island-style bottom tab bar. Mobile-only (hidden on lg+). */
export function FloatingNav() {
  const [location] = useLocation();
  const { isPremium } = useUserTier();

  // Hide premium-only tabs entirely when not premium (keeps nav clean)
  const SPACES = ALL_SPACES.filter(s => !s.gated || isPremium);

  const activeSpace = ALL_SPACES.find(s => location.startsWith(s.href))?.href ?? '';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center lg:hidden select-none pointer-events-none"
    >
      {/* safe-area wrapper so pill clears the home bar */}
      <div
        className="pointer-events-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="mb-3 flex items-center gap-0.5 px-1.5 py-1.5 rounded-full shadow-2xl"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset, 0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {SPACES.map(({ href, label }) => {
            const active = activeSpace === href;

            return (
              <Link key={href} href={href}>
                <span
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-mono text-[11px] tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-white/[0.15] text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
