'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PickupRequest {
  id: string; name: string; phone: string; address: string;
  category: string; time_slot: string; date: string; notes: string | null;
  city: string; status: string; partner_name: string | null;
  partner_phone: string | null; created_at: string;
}
interface ScrapRate {
  id: string; name: string; category: string; unit: string;
  price: number; city: string; active: boolean; updated_at: string;
}
interface Stats {
  totalPickups: number; pending: number; assigned: number;
  completed: number; cancelled: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  paper: 'bg-yellow-100 text-yellow-700',
  plastic: 'bg-blue-100 text-blue-700',
  metal: 'bg-gray-100 text-gray-700',
  ewaste: 'bg-purple-100 text-purple-700',
  appliances: 'bg-orange-100 text-orange-700',
  glass: 'bg-cyan-100 text-cyan-700',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

const CATEGORIES = ['paper','plastic','metal','ewaste','appliances','glass'];
const UNITS = ['kg','piece','ton'];

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'overview'|'pickups'|'rates'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [rates, setRates] = useState<ScrapRate[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<PickupRequest | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [rateModal, setRateModal] = useState(false);
  const [editRate, setEditRate] = useState<ScrapRate | null>(null);
  const [newRate, setNewRate] = useState({ name:'', category:'paper', unit:'kg', price:'', city:'Chennai' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => {
      if (r.status === 401) { router.replace('/__admin/login'); return; }
      r.json().then((d) => {
        // merge old stats shape with new pickup stats
        setStats({
          totalPickups: d.totalPickups ?? d.totalDonations ?? 0,
          pending: d.pending ?? 0,
          assigned: d.assigned ?? 0,
          completed: d.completed ?? d.collected ?? 0,
          cancelled: d.cancelled ?? 0,
        });
      });
      setReady(true);
    }).catch(() => router.replace('/__admin/login'));
  }, [router]);

  const loadPickups = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page) });
    if (statusFilter) p.set('status', statusFilter);
    const res = await fetch(`/api/admin/pickups?${p}`);
    if (res.status === 401) { router.replace('/__admin/login'); return; }
    const data = await res.json();
    setPickups(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, statusFilter, router]);

  const loadRates = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/scrap-rates');
    if (res.status === 401) { router.replace('/__admin/login'); return; }
    const data = await res.json();
    setRates(data.data ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (tab === 'pickups' || tab === 'overview') loadPickups();
    if (tab === 'rates') loadRates();
  }, [ready, tab, loadPickups, loadRates]);

  async function assignPartner() {
    if (!assignModal) return;
    setActionId(assignModal.id);
    await fetch(`/api/admin/pickups/${assignModal.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ASSIGNED', partner_name: partnerName, partner_phone: partnerPhone }),
    });
    setAssignModal(null); setPartnerName(''); setPartnerPhone('');
    await loadPickups();
    setActionId(null);
  }

  async function updatePickupStatus(id: string, status: string) {
    setActionId(id);
    await fetch(`/api/admin/pickups/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadPickups();
    setActionId(null);
  }

  async function saveRate() {
    const payload = editRate
      ? { ...editRate }
      : { ...newRate, price: parseFloat(newRate.price) };
    const url = editRate ? `/api/admin/scrap-rates/${editRate.id}` : '/api/admin/scrap-rates';
    const method = editRate ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setRateModal(false); setEditRate(null); setNewRate({ name:'', category:'paper', unit:'kg', price:'', city:'Chennai' });
    await loadRates();
  }

  async function deleteRate(id: string) {
    if (!confirm('Delete this rate?')) return;
    await fetch(`/api/admin/scrap-rates/${id}`, { method: 'DELETE' });
    await loadRates();
  }

  async function toggleActive(rate: ScrapRate) {
    await fetch(`/api/admin/scrap-rates/${rate.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !rate.active }),
    });
    await loadRates();
  }

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.replace('/__admin/login');
  }

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-400 animate-pulse">Verifying access…</p>
    </div>
  );

  const pages = Math.ceil(total / 20);
  const ratesByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = rates.filter(r => r.category === cat);
    return acc;
  }, {} as Record<string, ScrapRate[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">♻️</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-none">DontWaste Admin</h1>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200">
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stats KPI Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total Pickups', value: stats.totalPickups, color: 'bg-white', emoji: '📦' },
              { label: 'Pending',       value: stats.pending,      color: 'bg-yellow-50', emoji: '⏳' },
              { label: 'Assigned',      value: stats.assigned,     color: 'bg-blue-50',   emoji: '🚚' },
              { label: 'Completed',     value: stats.completed,    color: 'bg-green-50',  emoji: '✅' },
              { label: 'Cancelled',     value: stats.cancelled,    color: 'bg-red-50',    emoji: '❌' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-xl border border-gray-100 p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <span className="text-lg">{s.emoji}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['overview', 'pickups', 'rates'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}>
              {t === 'overview' ? '📊 Overview' : t === 'pickups' ? '📦 Pickup Requests' : '💰 Rate Card'}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB - Map + Recent */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Visual Map placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">📍 Pickup Locations — Chennai</h2>
                <span className="text-xs text-gray-400">Live requests map</span>
              </div>
              <div className="relative bg-green-50" style={{height: '320px'}}>
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=80.1698%2C12.9716%2C80.2697%2C13.0827&layer=mapnik"
                  className="w-full h-full border-0"
                  title="Chennai Pickup Map"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow text-xs text-gray-600 font-medium">
                  📍 {pickups.filter(p => p.status === 'PENDING').length} pending pickups
                </div>
              </div>
            </div>

            {/* Recent Requests Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-800">🕐 Recent Pickup Requests</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 text-sm animate-pulse">Loading…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Date / Slot</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Partner</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pickups.slice(0,10).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge text-xs ${CATEGORY_COLORS[p.category.toLowerCase().split(' ')[0]] ?? 'bg-gray-100 text-gray-600'}`}>{p.category}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            <div>{p.date}</div>
                            <div className="text-gray-400">{p.time_slot}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge text-xs ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {p.partner_name ? <div className="font-medium">{p.partner_name}</div> : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'PENDING' && (
                              <button onClick={() => { setAssignModal(p); setTab('pickups'); }}
                                className="px-2 py-1 rounded-lg text-xs bg-blue-50 hover:bg-blue-100 text-blue-600">Assign</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {pickups.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-400">No pickup requests yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PICKUPS TAB */}
        {tab === 'pickups' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {['', 'PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED'].map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    statusFilter === s ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}>{s || 'All'}</button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm animate-pulse">Loading…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Address</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Date / Slot</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Partner</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pickups.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-400">No pickup requests found</td></tr>
                      )}
                      {pickups.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.phone}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px]">
                            <div className="truncate">{p.address}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge text-xs ${CATEGORY_COLORS[p.category.toLowerCase().split(' ')[0]] ?? 'bg-gray-100 text-gray-600'}`}>{p.category}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            <div>{p.date}</div>
                            <div className="text-gray-400">{p.time_slot}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {p.partner_name ? (
                              <div>
                                <div className="font-medium">{p.partner_name}</div>
                                <div className="text-gray-400">{p.partner_phone}</div>
                              </div>
                            ) : <span className="text-gray-300">Not assigned</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {p.status === 'PENDING' && (
                                <button disabled={actionId === p.id}
                                  onClick={() => { setAssignModal(p); setPartnerName(''); setPartnerPhone(''); }}
                                  className="px-2 py-1 rounded-lg text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 disabled:opacity-40">Assign</button>
                              )}
                              {p.status === 'ASSIGNED' && (
                                <button disabled={actionId === p.id}
                                  onClick={() => updatePickupStatus(p.id, 'COMPLETED')}
                                  className="px-2 py-1 rounded-lg text-xs bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40">✅ Done</button>
                              )}
                              {(p.status === 'PENDING' || p.status === 'ASSIGNED') && (
                                <button disabled={actionId === p.id}
                                  onClick={() => updatePickupStatus(p.id, 'CANCELLED')}
                                  className="px-2 py-1 rounded-lg text-xs bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40">Cancel</button>
                              )}
                            </div>
                          </td>
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
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">← Prev</button>
                    <span className="text-xs text-gray-500 px-2 py-1.5">{page} / {pages}</span>
                    <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RATE CARD TAB */}
        {tab === 'rates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800">💰 Scrap Rate Card</h2>
              <button onClick={() => { setEditRate(null); setRateModal(true); }}
                className="btn-primary text-sm px-4 py-2">+ Add Item</button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm animate-pulse">Loading rates…</div>
            ) : (
              CATEGORIES.map((cat) => ratesByCategory[cat]?.length > 0 && (
                <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700 capitalize text-sm">
                      {cat === 'ewaste' ? '⚡ E-Waste' :
                       cat === 'paper' ? '📰 Paper' :
                       cat === 'plastic' ? '🛒 Plastic' :
                       cat === 'metal' ? '⚙️ Metal' :
                       cat === 'appliances' ? '🧹 Appliances' : '🍺 Glass'}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-500 uppercase tracking-wide">
                        <tr>
                          <th className="px-4 py-2 text-left">Item</th>
                          <th className="px-4 py-2 text-left">Unit</th>
                          <th className="px-4 py-2 text-left">Price (₹)</th>
                          <th className="px-4 py-2 text-left">City</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {ratesByCategory[cat].map((r) => (
                          <tr key={r.id} className={`hover:bg-gray-50 ${!r.active ? 'opacity-50' : ''}`}>
                            <td className="px-4 py-2.5 font-medium text-gray-800">{r.name}</td>
                            <td className="px-4 py-2.5 text-gray-500">/{r.unit}</td>
                            <td className="px-4 py-2.5 font-bold text-green-700">₹{Number(r.price).toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-gray-500 text-xs">{r.city}</td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => toggleActive(r)}
                                className={`badge text-xs cursor-pointer ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {r.active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex gap-1">
                                <button onClick={() => { setEditRate(r); setRateModal(true); }}
                                  className="px-2 py-1 rounded-lg text-xs bg-blue-50 hover:bg-blue-100 text-blue-600">Edit</button>
                                <button onClick={() => deleteRate(r.id)}
                                  className="px-2 py-1 rounded-lg text-xs bg-red-50 hover:bg-red-100 text-red-600">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Assign Partner Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 mb-1">Assign Partner</h3>
            <p className="text-sm text-gray-500 mb-4">Pickup for <strong>{assignModal.name}</strong> on {assignModal.date}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Partner Name *</label>
                <input value={partnerName} onChange={e => setPartnerName(e.target.value)}
                  placeholder="e.g. Ravi Kumar" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Partner Phone *</label>
                <input value={partnerPhone} onChange={e => setPartnerPhone(e.target.value)}
                  placeholder="e.g. 9876543210" className="input-field text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setAssignModal(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={assignPartner} disabled={!partnerName || !partnerPhone}
                className="flex-1 btn-primary text-sm py-2 disabled:opacity-40">Assign →</button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Add/Edit Modal */}
      {rateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 mb-4">{editRate ? 'Edit Rate' : 'Add New Rate'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Item Name *</label>
                <input value={editRate ? editRate.name : newRate.name}
                  onChange={e => editRate ? setEditRate({...editRate, name: e.target.value}) : setNewRate({...newRate, name: e.target.value})}
                  placeholder="e.g. Newspaper" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Category *</label>
                <select value={editRate ? editRate.category : newRate.category}
                  onChange={e => editRate ? setEditRate({...editRate, category: e.target.value}) : setNewRate({...newRate, category: e.target.value})}
                  className="input-field text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Unit *</label>
                  <select value={editRate ? editRate.unit : newRate.unit}
                    onChange={e => editRate ? setEditRate({...editRate, unit: e.target.value}) : setNewRate({...newRate, unit: e.target.value})}
                    className="input-field text-sm">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Price (₹) *</label>
                  <input type="number" min="0" step="0.01"
                    value={editRate ? editRate.price : newRate.price}
                    onChange={e => editRate ? setEditRate({...editRate, price: parseFloat(e.target.value)}) : setNewRate({...newRate, price: e.target.value})}
                    placeholder="0.00" className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">City</label>
                <input value={editRate ? editRate.city : newRate.city}
                  onChange={e => editRate ? setEditRate({...editRate, city: e.target.value}) : setNewRate({...newRate, city: e.target.value})}
                  className="input-field text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setRateModal(false); setEditRate(null); }}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={saveRate}
                className="flex-1 btn-primary text-sm py-2">Save Rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
