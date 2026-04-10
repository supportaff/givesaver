'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Donation {
  id: string; title: string; category: string; status: string;
  flagged: boolean; flagged_reason: string | null; collected_at: string | null;
  donor_name: string; phone: string; city: string; address: string;
  quantity: string; created_at: string; photo_url: string | null;
}
interface Claim {
  id: string; donation_id: string; receiver_name: string;
  receiver_phone: string; message: string | null; status: string; created_at: string;
}
interface Stats {
  totalDonations: number; available: number; claimed: number;
  collected: number; flagged: number; totalClaims: number; totalNGOs: number;
}
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  CLAIMED:   'bg-blue-100 text-blue-700',
  COLLECTED: 'bg-gray-100 text-gray-500',
};
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [ready,     setReady]     = useState(false);
  const [tab,       setTab]       = useState<'donations' | 'claims'>('donations');
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims,    setClaims]    = useState<Claim[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [filter,    setFilter]    = useState('');
  const [search,    setSearch]    = useState('');
  const [flagOnly,  setFlagOnly]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState<string | null>(null);

  // Auth probe — if 401, middleware already blocked; redirect to login
  useEffect(() => {
    fetch('/api/admin/stats').then((r) => {
      if (r.status === 401) {
        // Get current slug from URL to redirect to correct login page
        const slug = window.location.pathname.split('/')[1];
        router.replace(`/${slug}/login`);
        return;
      }
      r.json().then(setStats);
      setReady(true);
    }).catch(() => {
      const slug = window.location.pathname.split('/')[1];
      router.replace(`/${slug}/login`);
    });
  }, [router]);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (filter)   p.set('status',  filter);
    if (flagOnly) p.set('flagged', '1');
    if (search)   p.set('search',  search);
    const res = await fetch(`/api/admin/donations?${p}`);
    if (res.status === 401) { const slug = window.location.pathname.split('/')[1]; router.replace(`/${slug}/login`); return; }
    const data = await res.json();
    setDonations(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filter, flagOnly, search, router]);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/claims?page=${page}`);
    if (res.status === 401) { const slug = window.location.pathname.split('/')[1]; router.replace(`/${slug}/login`); return; }
    const data = await res.json();
    setClaims(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, router]);

  useEffect(() => {
    if (!ready) return;
    if (tab === 'donations') loadDonations();
    else loadClaims();
  }, [ready, tab, loadDonations, loadClaims]);

  async function patchDonation(id: string, patch: Record<string, unknown>) {
    setActionId(id);
    await fetch(`/api/admin/donations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    await loadDonations();
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
    setActionId(null);
  }

  async function deleteDonation(id: string) {
    if (!confirm('Delete this donation permanently?')) return;
    setActionId(id);
    await fetch(`/api/admin/donations/${id}`, { method: 'DELETE' });
    await loadDonations();
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
    setActionId(null);
  }

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    const slug = window.location.pathname.split('/')[1];
    router.replace(`/${slug}/login`);
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400 animate-pulse">Verifying access…</p>
      </div>
    );
  }

  const pages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-none">GiveSaver Admin</h1>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200">Logout</button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Total',      value: stats.totalDonations, color: 'bg-white' },
              { label: 'Available',  value: stats.available,      color: 'bg-green-50' },
              { label: 'Claimed',    value: stats.claimed,        color: 'bg-blue-50' },
              { label: 'Collected',  value: stats.collected,      color: 'bg-gray-100' },
              { label: '🚩 Flagged', value: stats.flagged,        color: 'bg-red-50' },
              { label: 'Claims',     value: stats.totalClaims,    color: 'bg-purple-50' },
              { label: 'NGOs',       value: stats.totalNGOs,      color: 'bg-amber-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-xl border border-gray-100 p-4 text-center shadow-sm`}>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {(['donations', 'claims'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}>{t}</button>
          ))}
        </div>

        {tab === 'donations' && (
          <div className="flex flex-wrap gap-2 items-center">
            <input placeholder="🔍 Search title…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field text-sm w-48" />
            {['', 'AVAILABLE', 'CLAIMED', 'COLLECTED'].map((s) => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  filter === s ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}>{s || 'All'}</button>
            ))}
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-1">
              <input type="checkbox" checked={flagOnly} onChange={(e) => { setFlagOnly(e.target.checked); setPage(1); }} className="accent-red-500" />
              Flagged only
            </label>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm animate-pulse">Loading…</div>
          ) : tab === 'donations' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Donation</th>
                    <th className="px-4 py-3 text-left">Donor</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Posted</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {donations.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No donations found</td></tr>}
                  {donations.map((d) => (
                    <tr key={d.id} className={`hover:bg-gray-50 transition-colors ${d.flagged ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 max-w-[180px] truncate">{d.title}</div>
                        <div className="text-xs text-gray-400">{d.quantity} · {d.category}</div>
                        {d.flagged && <div className="text-xs text-red-600 mt-0.5">🚩 {d.flagged_reason ?? 'Flagged'}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-700">{d.donor_name}</div>
                        <div className="text-xs text-gray-400">{d.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{d.city}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${STATUS_COLORS[d.status] ?? 'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(d.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {d.status !== 'COLLECTED' && (
                            <button disabled={actionId === d.id} onClick={() => patchDonation(d.id, { status: 'COLLECTED', collected_at: new Date().toISOString() })} className="px-2 py-1 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40">✅ Collected</button>
                          )}
                          {!d.flagged ? (
                            <button disabled={actionId === d.id} onClick={async () => { const r = prompt('Flag reason:') ?? 'Abuse reported'; await patchDonation(d.id, { flagged: true, flagged_reason: r }); }} className="px-2 py-1 rounded-lg text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 disabled:opacity-40">🚩 Flag</button>
                          ) : (
                            <button disabled={actionId === d.id} onClick={() => patchDonation(d.id, { flagged: false, flagged_reason: null })} className="px-2 py-1 rounded-lg text-xs bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40">✅ Unflag</button>
                          )}
                          <button disabled={actionId === d.id} onClick={() => deleteDonation(d.id)} className="px-2 py-1 rounded-lg text-xs bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40">🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Receiver</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Donation ID</th>
                    <th className="px-4 py-3 text-left">Message</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No claims yet</td></tr>}
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{c.receiver_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.receiver_phone}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{c.donation_id.slice(0,8)}…</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{c.message ?? '—'}</td>
                      <td className="px-4 py-3"><span className="badge bg-blue-50 text-blue-700 text-xs">{c.status}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
              <p className="text-xs text-gray-400">{total} total</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">← Prev</button>
                <span className="text-xs text-gray-500 px-2 py-1.5">{page} / {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
