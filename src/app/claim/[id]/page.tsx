'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { DonationRow } from '@/lib/supabase/types';

export default function ClaimPage() {
  const { id }                          = useParams<{ id: string }>();
  const [donation,   setDonation]       = useState<DonationRow | null>(null);
  const [loading,    setLoading]        = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [done,       setDone]           = useState(false);
  const [donorInfo,  setDonorInfo]      = useState<{ name: string; phone: string } | null>(null);
  const [error,      setError]          = useState('');
  const [agreed,     setAgreed]         = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    fetch(`/api/donations/${id}`)
      .then((r) => r.json())
      .then((d) => { setDonation(d as DonationRow); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError('Please read and accept the disclaimer to proceed.'); return; }
    setSubmitting(true); setError('');
    try {
      const res  = await fetch('/api/claims/init', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ donationId: id, receiverName: form.name, receiverPhone: form.phone, message: form.message }),
      });
      const data = await res.json() as { claimId?: string; donorPhone?: string; donorName?: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to submit claim'); return; }
      setDonorInfo({ name: data.donorName ?? '', phone: data.donorPhone ?? '' });
      setDone(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally  { setSubmitting(false); }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-gray-400 animate-pulse">Loading...</p></div>;
  if (!donation) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-gray-500">Donation not found.</p></div>;

  if (donation.status !== 'AVAILABLE' && !done) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-gray-700">Already Claimed</h2>
        <p className="text-gray-500 mt-2">This donation is no longer available.</p>
        <Link href="/browse" className="btn-primary mt-4 inline-block">Browse Other Donations</Link>
      </div>
    </div>
  );

  if (done && donorInfo) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Claim Submitted!</h2>
        <p className="text-gray-500 text-sm mb-5">
          Contact the donor directly to arrange pickup.
        </p>
        <div className="bg-green-50 rounded-xl p-4 mb-5 text-left">
          <p className="text-sm font-semibold text-gray-700 mb-1">👤 Donor Details</p>
          <p className="text-sm text-gray-700">{donorInfo.name}</p>
          <p className="text-sm text-green-700 font-bold">📞 {donorInfo.phone}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
          <p className="text-xs text-amber-800">
            ⚠️ GiveSaver only connects donors and receivers. We do not verify item quality or handle transport.
            Meet in a safe, public place and inspect items before accepting.
          </p>
        </div>
        <Link href="/browse" className="btn-secondary text-sm">Back to Browse</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-8">
          <Link href="/browse" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Claim Donation</h1>
        </div>
      </div>
      <div className="section-wrapper py-8 max-w-lg">
        {/* Donation summary */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-800 text-lg">{donation.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{donation.quantity} · {donation.city} · {donation.address}</p>
          <p className="text-xs text-gray-400 mt-1">Posted by {donation.donor_name} ({donation.donor_type})</p>
        </div>

        <form onSubmit={handleClaim} className="card space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="Full name" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Phone *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field" placeholder="+91 XXXXX XXXXX" type="tel" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message to Donor <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input-field" rows={2} placeholder="e.g. I can pick up by 5 PM today" />
          </div>

          {/* Disclaimer checkbox */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 mb-3 leading-relaxed">
              <strong>⚠️ Disclaimer:</strong> GiveSaver is a free coordination platform. We do not verify the
              quality, safety, or condition of donated items. By claiming, you agree to meet the donor
              in a safe location, inspect items yourself, and acknowledge that GiveSaver bears no
              responsibility for the items received.{' '}
              <Link href="/disclaimer" className="underline" target="_blank">Read full disclaimer</Link>
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-green-600" />
              <span className="text-sm font-medium text-gray-700">I have read and accept the disclaimer</span>
            </label>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2">{error}</div>}

          <button type="submit" disabled={submitting || !agreed}
            className="btn-primary w-full disabled:opacity-40">
            {submitting ? 'Submitting...' : '🤝 Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
}
