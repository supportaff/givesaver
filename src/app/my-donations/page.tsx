'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { DonationRow } from '@/lib/supabase/types';

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  CLAIMED:   'bg-yellow-100 text-yellow-700',
  COLLECTED: 'bg-blue-100 text-blue-700',
};

const STATUS_EMOJI: Record<string, string> = {
  AVAILABLE: '🟢',
  CLAIMED:   '🟡',
  COLLECTED: '📦',
};

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD:    '🍱',
  CLOTHES: '👕',
  BOOKS:   '📚',
};

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins || 1}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function MyDonationsPage() {
  const [phone,    setPhone]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState<DonationRow[] | null>(null);
  const [error,    setError]    = useState('');

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = phone.replace(/[\s\-]/g, '');
    if (cleaned.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/donations/by-phone?phone=${encodeURIComponent(cleaned)}`);
      const data = await res.json() as DonationRow[] | { error: string };
      if (!res.ok || 'error' in data) { setError('No donations found for this number'); return; }
      setResults(data);
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-10">
          <h1 className="text-4xl font-bold text-gray-800">My Donations</h1>
          <p className="text-gray-500 mt-2">Enter your phone number to view and manage your listings</p>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 max-w-xl">
            <strong>📦 Donor tip:</strong> When a receiver contacts you and you hand over the item,
            come back here and mark the donation as <strong>Collected</strong>. Only you can do this.
          </div>
        </div>
      </div>

      <div className="section-wrapper py-10">
        <div className="max-w-xl mx-auto">

          {/* Phone lookup form */}
          <div className="card mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📞 Your Phone Number</label>
            <form onSubmit={handleLookup} className="flex gap-3">
              <input
                type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="input-field flex-1"
                required
              />
              <button type="submit" disabled={loading}
                className="btn-primary px-6 disabled:opacity-40">
                {loading ? 'Searching...' : 'Find'}
              </button>
            </form>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          {/* Results */}
          {results !== null && (
            <>
              {results.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-gray-500">No donations found for this number.</p>
                  <Link href="/donate" className="btn-primary mt-4 inline-block">Post a Donation</Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">{results.length} donation{results.length > 1 ? 's' : ''} found</p>
                  <div className="flex flex-col gap-4">
                    {results.map((d) => (
                      <div key={d.id} className="card hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl">{CATEGORY_EMOJI[d.category]}</span>
                            <h3 className="font-semibold text-gray-800 truncate">{d.title}</h3>
                          </div>
                          <span className={`badge shrink-0 ${STATUS_STYLES[d.status as string]}`}>
                            {STATUS_EMOJI[d.status as string]} {d.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
                            ID: {shortId(d.id)}
                          </span>
                          <span className="text-xs text-gray-400">{d.quantity} · {d.city} · {timeAgo(d.created_at)}</span>
                        </div>

                        {/* CLAIMED notice */}
                        {d.status === 'CLAIMED' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 mb-3 text-xs text-yellow-800">
                            🤝 Someone has contacted you for this item. Once you hand it over, click <strong>Manage → Mark Collected</strong>.
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          <Link href={`/manage/${d.id}`}
                            className="btn-primary text-xs px-4 py-2">
                            📝 Manage &amp; Mark Collected
                          </Link>
                          <button
                            onClick={() => navigator.clipboard.writeText(`https://dontwaste.in/manage/${d.id}`)}
                            className="btn-secondary text-xs px-4 py-2">
                            🔗 Copy Manage Link
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
