'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '';
  const adminPath    = typeof window !== 'undefined'
    ? window.location.pathname.replace('/login', '')
    : '/admin';

  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res  = await fetch('/api/admin/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Wrong password'); setLoading(false); return; }
    router.push(next || adminPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🛡️</div>
          <h1 className="text-xl font-bold text-gray-800">Admin Access</h1>
          <p className="text-xs text-gray-400 mt-1">GiveSaver — restricted area</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>
          )}
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary py-3 disabled:opacity-40">
            {loading ? 'Verifying…' : 'Enter Dashboard'}
          </button>
        </form>
        <p className="text-xs text-gray-300 text-center mt-6">Only authorised personnel</p>
      </div>
    </div>
  );
}
