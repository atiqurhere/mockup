'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen forge-gradient dot-grid flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-forge-accent flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 16L10 4L16 16H4Z" fill="white" />
            </svg>
          </div>
          <h1 className="font-display font-black text-2xl">MockupForge</h1>
          <p className="text-forge-subtle text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Form */}
        <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 shadow-2xl">
          <h2 className="font-display font-bold text-lg mb-5">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-forge-subtle font-semibold block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@mockupforge.com"
                className="w-full bg-forge-muted border border-forge-border rounded-lg px-3 py-2.5 text-sm text-forge-text placeholder:text-forge-subtle focus:outline-none focus:border-forge-accent/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-forge-subtle font-semibold block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-forge-muted border border-forge-border rounded-lg px-3 py-2.5 text-sm text-forge-text placeholder:text-forge-subtle focus:outline-none focus:border-forge-accent/50 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-forge-accent hover:bg-forge-accent-dim disabled:opacity-60 text-white font-bold transition-all"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
