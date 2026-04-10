'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Status = 'AVAILABLE' | 'CLAIMED' | 'COLLECTED';

type Donation = {
  id: string;
  title: string;
  category: string;
  status: Status;
  quantity: string;
  city: string;
  donor_name: string;
  photo_url: string | null;
  created_at: string;
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: string; desc: string }> = {
  AVAILABLE:  { label: 'Available',  color: 'bg-green-100 text-green-700 border-green-300',  icon: '✅', desc: 'Listing is live and visible to NGOs' },
  CLAIMED:    { label: 'Claimed',    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🤝', desc: 'Someone has agreed to collect it' },
  COLLECTED:  { label: 'Collected',  color: 'bg-blue-100 text-blue-700 border-blue-300',     icon: '📦', desc: 'Items have been picked up — thank you!' },
};

export default function ManageDonationPage() {
  const { id }          = useParams<{ id: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    fetch(`/api/donations/${id}`)
      .then((r) => r.json())
      .then((d) => { setDonation(d); setLoading(false); })
      .catch(() => { setError('Could not load donation.'); setLoading(false); });
  }, [id]);

  async function updateStatus(status: Status) {
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/donations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setDonation(updated);
      setSuccess(`Status updated to ${STATUS_CONFIG[status].label} ✔️`);
    } catch {
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3 animate-pulse">⏳</div><p className="text-gray-500">Loading your listing...</p></div>
    </div>
  );

  if (!donation || error) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Listing not found</h2>
        <p className="text-gray-500 mb-6">The donation ID in this link may be incorrect.</p>
        <Link href="/browse" className="btn-primary">Browse Donations</Link>
      </div>
    </div>
  );

  const current = STATUS_CONFIG[donation.status];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-8">
          <p className="text-sm text-gray-400 mb-1">Managing your donation</p>
          <h1 className="text-3xl font-bold text-gray-800">{donation.title}</h1>
          <p className="text-gray-500 mt-1">{donation.quantity} · {donation.city} · by {donation.donor_name}</p>
        </div>
      </div>

      <div className="section-wrapper py-10">
        <div className="max-w-xl mx-auto space-y-6">

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">{success}</div>
          )}

          {/* Photo */}
          {donation.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={donation.photo_url} alt={donation.title} className="w-full rounded-2xl object-cover max-h-56 shadow-sm" />
          )}

          {/* Current status */}
          <div className="card">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Status</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm ${current.color}`}>
              <span>{current.icon}</span> {current.label}
            </div>
            <p className="text-sm text-gray-500 mt-2">{current.desc}</p>
          </div>

          {/* Update status */}
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Update Status</p>
            <div className="space-y-3">
              {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([s, cfg]) => (
                <button
                  key={s}
                  disabled={donation.status === s || updating}
                  onClick={() => updateStatus(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    donation.status === s
                      ? `${cfg.color} border-current font-bold`
                      : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <span className="text-xl">{cfg.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{cfg.label}</p>
                    <p className="text-xs text-gray-500">{cfg.desc}</p>
                  </div>
                  {donation.status === s && <span className="ml-auto text-xs font-bold text-green-600">← Current</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            🔒 <strong>Save this page URL.</strong> This is the only way to manage your listing.
            Bookmark it or note your donation ID: <code className="bg-amber-100 px-1 rounded text-xs">{id}</code>
          </div>

          <Link href="/browse" className="btn-secondary w-full text-center block py-3">← Back to Browse</Link>
        </div>
      </div>
    </div>
  );
}
