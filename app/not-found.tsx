import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen forge-gradient dot-grid flex items-center justify-center p-6 text-center">
      <div>
        <p className="font-mono text-forge-accent text-sm mb-2">404</p>
        <h1 className="font-display font-black text-4xl mb-3">Page not found</h1>
        <p className="text-forge-subtle mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-dim text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          ← Back to MockupForge
        </Link>
      </div>
    </div>
  );
}
