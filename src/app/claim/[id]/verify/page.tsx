'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ReceiverVerifyPage() {
  const { id }              = useParams<{ id: string }>();
  const [otp,     setOtp]   = useState('');
  const [loading, setLoad]  = useState(false);
  const [result,  setResult]= useState<{ status: string; message: string } | null>(null);
  const [error,   setError] = useState('');

  async function handleVerify() {
    if (otp.length !== 6) { setError('Enter the full 6-digit OTP'); return; }
    setLoad(true); setError('');
    try {
      const res  = await fetch('/api/claims/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ claimId: id, otp, role: 'receiver' }),
      });
      const data = await res.json() as { status: string; message: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Verification failed'); return; }
      setResult(data);
    } catch { setError('Something went wrong. Please try again.'); }
    finally  { setLoad(false); }
  }

  if (result) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">{result.status === 'COLLECTED' ? '🎉' : '✅'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {result.status === 'COLLECTED' ? 'Donation Collected!' : 'OTP Verified!'}
        </h2>
        <p className="text-gray-500 mb-2">{result.message}</p>
        {result.status === 'PARTIAL' && (
          <p className="text-sm text-yellow-600 bg-yellow-50 rounded-xl px-4 py-3 mb-4">
            ⏳ Waiting for the donor to verify their side. You’ll both get a Telegram confirmation once complete.
          </p>
        )}
        <Link href="/browse" className="btn-primary">Back to Browse</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🔑</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Verify Donor OTP</h2>
        <p className="text-gray-500 text-sm mb-6">
          The donor shared a 6-digit OTP with you at pickup. Enter it below to confirm the handoff.
        </p>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>
        )}
        <input
          type="text" inputMode="numeric" maxLength={6} value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="input-field text-center text-2xl tracking-[0.5em] font-bold mb-4"
        />
        <button onClick={handleVerify} disabled={loading || otp.length !== 6}
          className="btn-primary w-full disabled:opacity-40">
          {loading ? 'Verifying...' : 'Confirm Pickup'}
        </button>
        <p className="text-xs text-gray-400 mt-4">OTP is valid for 24 hours from claim time.</p>
      </div>
    </div>
  );
}
