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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [attempts, setAttempts] = useState(0);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (attempts >= 5) {
      setError('Too many failed attempts. Refresh the page to try again.');
      return;
    }
    setLoading(true); setError('');
    const res  = await fetch('/api/admin/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAttempts((a) => a + 1);
      setError(data.error ?? 'Invalid credentials');
      setLoading(false);
      return;
    }
    router.push(next || adminPath);
  }

  const locked = attempts >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
            🛡️
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-xs text-gray-400 mt-1">GiveSaver — restricted area</p>
        </div>

        {/* Lockout banner */}
        {locked && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-xs text-red-700 text-center font-medium">
            🔒 Too many failed attempts. Please refresh.
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          {error && !locked && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error}
              {attempts > 1 && (
                <span className="block text-red-400 mt-0.5">{5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining</span>
              )}
            </p>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">User ID</label>
            <input
              type="text"
              placeholder="Enter your user ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field text-sm"
              autoComplete="username"
              autoFocus
              disabled={locked}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-sm"
              autoComplete="current-password"
              disabled={locked}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password || locked}
            className="btn-primary py-3 mt-1 disabled:opacity-40 font-semibold">
            {loading ? 'Verifying…' : 'Enter Dashboard →'}
          </button>
        </form>

        <p className="text-xs text-gray-300 text-center mt-6">Authorised access only</p>
      </div>
    </div>
  );
}
