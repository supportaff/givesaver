'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { DonationRow, ClaimRow } from '@/lib/supabase/types';

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  CLAIMED:   'bg-yellow-100 text-yellow-700',
  COLLECTED: 'bg-blue-100 text-blue-700',
};

export default function ManagePage() {
  const { id } = useParams<{ id: string }>();
  const [donation, setDonation] = useState<DonationRow | null>(null);
  const [claim,    setClaim]    = useState<ClaimRow | null>(null);
  const [otp,      setOtp]      = useState('');
  const [loading,  setLoading]  = useState(true);
  const [verifying,setVerifying]= useState(false);
  const [statusMsg,setStatusMsg]= useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetch(`/api/donations/${id}`)
      .then((r) => r.json()).then((d) => { setDonation(d as DonationRow); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`/api/claims/by-donation/${id}`)
      .then((r) => r.json()).then((c) => { if (c && c.id) setClaim(c as ClaimRow); })
      .catch(() => {});
  }, [id]);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/donations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setDonation((prev) => prev ? { ...prev, status: status as DonationRow['status'] } : prev);
    setLoading(false);
  }

  async function verifyDonorOtp() {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    if (!claim) return;
    setVerifying(true); setError('');
    try {
      const res  = await fetch('/api/claims/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id, otp, role: 'donor' }),
      });
      const data = await res.json() as { status: string; message: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Verification failed'); return; }
      setStatusMsg(data.message);
      if (data.status === 'COLLECTED') {
        setDonation((prev) => prev ? { ...prev, status: 'COLLECTED' } : prev);
      }
    } catch { setError('Something went wrong'); }
    finally { setVerifying(false); }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-gray-400 animate-pulse">Loading...</p></div>;
  if (!donation) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-gray-500">Donation not found.</p></div>;

  // Cast to string to prevent TypeScript narrowing issues in comparisons below
  const currentStatus = donation.status as string;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b"><div className="section-wrapper py-8">
        <Link href="/browse" className="text-sm text-gray-400 hover:text-gray-600">← Back to Browse</Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Manage Donation</h1>
      </div></div>

      <div className="section-wrapper py-8 max-w-xl">
        {/* Donation summary */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold text-gray-800">{donation.title}</h2>
            <span className={`badge ${STATUS_STYLES[currentStatus]}`}>{currentStatus}</span>
          </div>
          <p className="text-sm text-gray-500">{donation.quantity} · {donation.city}</p>
          <p className="text-sm text-gray-400 mt-1">{donation.address}</p>
        </div>

        {/* OTP Verification block — shown when CLAIMED */}
        {currentStatus === 'CLAIMED' && claim && (
          <div className="card mb-6 border-2 border-yellow-200 bg-yellow-50">
            <h3 className="font-bold text-gray-800 mb-1">🔑 Verify Receiver OTP</h3>
            <p className="text-sm text-gray-600 mb-3">
              The receiver got their OTP on Telegram. Ask them to share it with you at pickup, then enter it below.
            </p>
            {error     && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2 mb-3">{error}</div>}
            {statusMsg && <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-2 mb-3">{statusMsg}</div>}
            <div className="flex gap-2">
              <input
                type="text" inputMode="numeric" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Receiver’s 6-digit OTP"
                className="input-field flex-1 text-center text-xl tracking-widest font-bold"
              />
              <button onClick={verifyDonorOtp} disabled={verifying || otp.length !== 6}
                className="btn-primary px-5 disabled:opacity-40">
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Receiver details — <b>{claim.receiver_name}</b> · {claim.receiver_phone} · @{claim.receiver_telegram}
            </p>
          </div>
        )}

        {/* Manual status buttons */}
        {currentStatus !== 'COLLECTED' && (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">Update Status Manually</h3>
            <div className="flex gap-3 flex-wrap">
              {currentStatus !== 'AVAILABLE' && <button onClick={() => updateStatus('AVAILABLE')} className="btn-secondary text-sm">✅ Mark Available</button>}
              {currentStatus !== 'CLAIMED'   && <button onClick={() => updateStatus('CLAIMED')}   className="btn-secondary text-sm">🤝 Mark Claimed</button>}
              {currentStatus !== 'COLLECTED' && <button onClick={() => updateStatus('COLLECTED')} className="btn-primary  text-sm">📦 Mark Collected</button>}
            </div>
          </div>
        )}

        {currentStatus === 'COLLECTED' && (
          <div className="card text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-gray-800">Donation Collected!</p>
            <p className="text-gray-500 text-sm mt-1">Both parties verified. Thank you for your generosity!</p>
          </div>
        )}
      </div>
    </div>
  );
}
