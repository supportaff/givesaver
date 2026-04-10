'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ReceiverVerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<{ status: string; message: string } | null>(null);
  const [error,   setError]   = useState('');

  async function handleVerify() {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/claims/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: id, otp, role: 'receiver' }),
      });
      const data = await res.json() as { status: string; message: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Verification failed'); return; }
      setResult(data);
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  if (result) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">{result.status === 'COLLECTED' ? '🎉' : '✅'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {result.status === 'COLLECTED' ? 'Donation Collected!' : 'OTP Verified!'}
        </h2>
        <p className="text-gray-500 mb-6">{result.message}</p>
        <Link href="/browse" className="btn-primary">Back to Browse</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🔑</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Verify Your OTP</h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter the 6-digit OTP sent to your Telegram. The donor will also verify their OTP on their side.
        </p>
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>}
        <input
          type="text" inputMode="numeric" maxLength={6} value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="input-field text-center text-2xl tracking-[0.5em] font-bold mb-4"
        />
        <button onClick={handleVerify} disabled={loading || otp.length !== 6}
          className="btn-primary w-full disabled:opacity-40">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <p className="text-xs text-gray-400 mt-4">OTP valid for 24 hours from claim time.</p>
      </div>
    </div>
  );
}
