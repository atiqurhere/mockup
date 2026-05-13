import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen forge-gradient dot-grid flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-forge-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-forge-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L8 3L13 13H3Z" fill="white" />
              <circle cx="8" cy="9" r="2" fill="#FF4D00" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">MockupForge</span>
        </div>
        <Link
          href="/editor"
          className="text-sm font-medium bg-forge-accent hover:bg-forge-accent-dim text-white px-4 py-2 rounded-md transition-colors"
        >
          Open Editor
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-forge-surface border border-forge-border rounded-full px-4 py-1.5 text-xs font-mono text-forge-subtle mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse-slow inline-block" />
          No sign-in required — start instantly
        </div>

        <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6 max-w-4xl">
          Create mockups
          <br />
          <span className="shine-text">in seconds.</span>
        </h1>

        <p className="text-forge-subtle text-lg sm:text-xl max-w-xl mb-10 font-body leading-relaxed">
          Upload your design, choose a product template, and download a professional mockup.
          Free, fast, no account needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-dim text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-forge-accent/20"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor" opacity="0.5" />
            </svg>
            Start Designing Free
          </Link>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-12">
          {['T-Shirts', 'Posters', 'Mugs', 'Signboards', 'Hoodies', 'Tote Bags'].map(cat => (
            <span key={cat} className="bg-forge-surface border border-forge-border text-forge-subtle text-sm px-3 py-1 rounded-full font-body">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-forge-border bg-forge-surface/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-forge-border">
          {[
            { icon: '⚡', label: 'Instant editor', sub: 'No account needed' },
            { icon: '🎨', label: '8+ templates', sub: 'More coming soon' },
            { icon: '📤', label: 'PNG / PDF export', sub: 'Multiple formats' },
            { icon: '💾', label: 'Auto-save', sub: 'Your browser stores it' },
          ].map(f => (
            <div key={f.label} className="flex flex-col items-center py-6 px-4 text-center gap-1">
              <span className="text-2xl mb-1">{f.icon}</span>
              <span className="font-semibold text-sm text-forge-text">{f.label}</span>
              <span className="text-forge-subtle text-xs">{f.sub}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
