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
  const [waURL,      setWaURL]          = useState('');
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
      const data = await res.json() as { waURL?: string; error?: string };
      if (!res.ok || !data.waURL) { setError(data.error ?? 'Failed to submit claim'); return; }
      setWaURL(data.waURL);
      setDone(true);
      window.open(data.waURL, '_blank', 'noopener,noreferrer');
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

  if (done) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Opened!</h2>
        <p className="text-gray-500 text-sm mb-5">
          A pre-filled message has been sent to your WhatsApp. Send it to the donor to arrange pickup.
        </p>
        <div className="bg-green-50 rounded-xl p-4 mb-4 text-left">
          <p className="text-xs text-green-800 leading-relaxed">
            📌 <strong>What happens next:</strong> The donor will reply to arrange a time and place.
            Once you collect the item, the donor will mark it as <strong>Collected</strong> on their end.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>DontWaste</strong> only connects donors and receivers. We do not verify item quality or handle transport.
            Meet in a safe, public place and inspect items before accepting.
          </p>
        </div>
        {waURL && (
          <a href={waURL} target="_blank" rel="noopener noreferrer"
            className="btn-primary text-sm w-full flex items-center justify-center gap-2 mb-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Re-open WhatsApp Message
          </a>
        )}
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your WhatsApp / Phone *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field" placeholder="+91 XXXXX XXXXX" type="tel" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message to Donor <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input-field" rows={2} placeholder="e.g. I can pick up by 5 PM today" />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 mb-3 leading-relaxed">
              <strong>⚠️ Disclaimer:</strong> DontWaste is a free coordination platform. We do not verify the
              quality, safety, or condition of donated items. By claiming, you agree to meet the donor
              in a safe location, inspect items yourself, and acknowledge that DontWaste bears no
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
            className="btn-primary w-full disabled:opacity-40 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {submitting ? 'Opening WhatsApp...' : '📲 Submit & Open WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  );
}
