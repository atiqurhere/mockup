'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/exports', label: 'Exports', icon: '📤' },
  { href: '/admin/sessions', label: 'Sessions', icon: '👤' },
  { href: '/admin/templates', label: 'Templates', icon: '🎨' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-forge-bg flex flex-col">
      {/* Top nav */}
      <header className="border-b border-forge-border bg-forge-surface px-4 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-forge-accent flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L6 2L10 10H2Z" fill="white" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm">MockupForge Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/editor" className="text-xs text-forge-subtle hover:text-forge-text transition-colors">
            ← Editor
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs bg-forge-muted hover:bg-forge-border text-forge-subtle px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 border-r border-forge-border bg-forge-surface flex-shrink-0 hidden sm:block">
          <nav className="p-3 space-y-1">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-forge-accent/10 text-forge-accent font-semibold'
                    : 'text-forge-subtle hover:text-forge-text hover:bg-forge-muted'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile bottom nav */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-forge-surface border-t border-forge-border flex z-50">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-[10px] transition-colors ${
                pathname === item.href ? 'text-forge-accent' : 'text-forge-subtle'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
