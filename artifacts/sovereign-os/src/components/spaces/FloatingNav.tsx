import { Link, useLocation } from 'wouter';

const SPACES = [
  { href: '/apps/defrag',    label: 'Defrag'    },
  { href: '/apps/covenant',  label: 'Covenant'  },
  { href: '/apps/alignment', label: 'Alignment' },
] as const;

/** iOS Dynamic Island-style bottom tab bar. Mobile-only (hidden on lg+). */
export function FloatingNav() {
  const [location] = useLocation();

  const activeSpace = SPACES.find(s => location.startsWith(s.href))?.href ?? '';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center lg:hidden select-none pointer-events-none"
    >
      {/* safe-area wrapper so pill clears the home bar */}
      <div
        className="pointer-events-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mb-3 flex items-center gap-0.5 px-1.5 py-1.5 rounded-full shadow-2xl"
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
                  className={`block px-5 py-2 rounded-full font-mono text-[11px] tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer ${
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
