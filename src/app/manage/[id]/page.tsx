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
  const { id }                    = useParams<{ id: string }>();
  const [donation, setDonation]   = useState<DonationRow | null>(null);
  const [claim,    setClaim]      = useState<ClaimRow | null>(null);
  const [loading,  setLoading]    = useState(true);
  const [msg,      setMsg]        = useState('');

  useEffect(() => {
    fetch(`/api/donations/${id}`)
      .then((r) => r.json()).then((d) => { setDonation(d as DonationRow); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`/api/claims/by-donation/${id}`)
      .then((r) => r.json()).then((c) => { if (c?.id) setClaim(c as ClaimRow); })
      .catch(() => {});
  }, [id]);

  async function updateStatus(status: string) {
    setLoading(true); setMsg('');
    await fetch(`/api/donations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setDonation((prev) => prev ? { ...prev, status: status as DonationRow['status'] } : prev);
    setMsg(status === 'COLLECTED' ? '🎉 Marked as Collected!' : `Status updated to ${status}`);
    setLoading(false);
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-gray-400 animate-pulse">Loading...</p></div>;
  if (!donation) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-gray-500">Donation not found.</p></div>;

  const currentStatus = donation.status as string;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-8">
          <Link href="/browse" className="text-sm text-gray-400 hover:text-gray-600">← Back to Browse</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Manage Donation</h1>
        </div>
      </div>

      <div className="section-wrapper py-8 max-w-xl">
        {/* Donation summary */}
        <div className="card mb-5">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-800">{donation.title}</h2>
            <span className={`badge ${STATUS_STYLES[currentStatus]}`}>{currentStatus}</span>
          </div>
          <p className="text-sm text-gray-500">{donation.quantity} · {donation.city}</p>
          <p className="text-sm text-gray-400 mt-1">{donation.address}</p>
          <p className="text-xs text-gray-400 mt-2">Donor phone: <strong>{donation.phone}</strong></p>
        </div>

        {/* Claim info — shown when claimed */}
        {claim && currentStatus !== 'COLLECTED' && (
          <div className="card mb-5 border-2 border-yellow-200 bg-yellow-50">
            <h3 className="font-bold text-gray-800 mb-2">🤝 Claimed By</h3>
            <p className="text-sm text-gray-700"><strong>{claim.receiver_name}</strong></p>
            <p className="text-sm text-gray-600">📞 {claim.receiver_phone}</p>
            {(claim as any).message && (
              <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{(claim as any).message}&rdquo;</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              Contact the receiver directly to arrange pickup. Once handed over, mark as Collected below.
            </p>
          </div>
        )}

        {msg && (
          <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">{msg}</div>
        )}

        {/* Status buttons */}
        {currentStatus !== 'COLLECTED' ? (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">Update Status</h3>
            <div className="flex gap-3 flex-wrap">
              {currentStatus !== 'AVAILABLE' && (
                <button onClick={() => updateStatus('AVAILABLE')} className="btn-secondary text-sm">✅ Mark Available</button>
              )}
              {currentStatus !== 'CLAIMED' && (
                <button onClick={() => updateStatus('CLAIMED')} className="btn-secondary text-sm">🤝 Mark Claimed</button>
              )}
              <button onClick={() => updateStatus('COLLECTED')} className="btn-primary text-sm">📦 Mark Collected</button>
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-gray-800">Donation Collected!</p>
            <p className="text-gray-500 text-sm mt-1">Thank you for your generosity 🙏</p>
          </div>
        )}
      </div>
    </div>
  );
}
