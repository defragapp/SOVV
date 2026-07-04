import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08070a]">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4f4b47] mb-8">404</p>
        <h1 className="font-serif text-4xl text-[#f4efe9] mb-3">Page not found.</h1>
        <p className="text-[#76716b] text-sm mb-10 font-sans">This moment doesn&apos;t exist — yet.</p>
        <Link href="/">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4f4b47] hover:text-[#76716b] transition-colors">
            ← Return home
          </span>
        </Link>
      </div>
    </div>
  );
}
