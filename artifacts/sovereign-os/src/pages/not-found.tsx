import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08070a]">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#4f4b47] mb-6">404</p>
        <h1 className="font-serif text-4xl text-[#f4efe9] mb-4">Page not found.</h1>
        <p className="text-[#76716b] text-sm mb-8">This moment doesn't exist — yet.</p>
        <Link href="/" className="btn-primary">Return home</Link>
      </div>
    </div>
  );
}
