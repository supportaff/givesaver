'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DonationCard from '@/components/DonationCard';
import { CATEGORY_META } from '@/lib/data';
import type { Category, Status } from '@/lib/data';
import type { DonationRow } from '@/lib/supabase/types';

const DonationMap = dynamic(() => import('@/components/DonationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-3">
      <div className="text-5xl animate-pulse">📍</div>
      <p className="text-gray-400 text-sm font-medium">Loading map...</p>
    </div>
  ),
});

export default function BrowsePage() {
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState<Category | 'ALL'>('ALL');
  const [status,    setStatus]    = useState<Status | 'ALL'>('AVAILABLE');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    fetch('/api/donations')
      .then((r) => r.json())
      .then((data) => { setDonations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => donations.filter((d) => {
    const matchCat    = category === 'ALL' || d.category === category;
    const matchStatus = status   === 'ALL' || d.status   === status;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.title.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      d.item_type.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  }), [donations, category, status, search]);

  const tabs: { key: Category | 'ALL'; emoji: string; label: string }[] = [
    { key: 'ALL',     emoji: '🌟', label: 'All' },
    { key: 'FOOD',    emoji: CATEGORY_META.FOOD.emoji,    label: CATEGORY_META.FOOD.label },
    { key: 'CLOTHES', emoji: CATEGORY_META.CLOTHES.emoji, label: CATEGORY_META.CLOTHES.label },
    { key: 'BOOKS',   emoji: CATEGORY_META.BOOKS.emoji,   label: CATEGORY_META.BOOKS.label },
  ];

  const hasActiveFilter = category !== 'ALL' || status !== 'AVAILABLE' || search;

  return (
    // Full viewport height minus the navbar — use min-h-screen, overflow hidden so only inner panels scroll
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', minHeight: 600 }}>

      {/* ── Top filter bar ── */}
      <div className="bg-white border-b border-gray-100 shrink-0 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center gap-3">

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setCategory(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                  category === t.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                }`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item, area..."
              className="pl-8 pr-4 py-2 text-sm bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-green-400 w-52"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | 'ALL')}
            className="text-sm bg-gray-100 rounded-xl border-0 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 font-medium"
          >
            <option value="AVAILABLE">✅ Available only</option>
            <option value="ALL">All statuses</option>
            <option value="CLAIMED">Claimed</option>
            <option value="COLLECTED">Collected</option>
          </select>

          {/* Clear */}
          {hasActiveFilter && (
            <button
              onClick={() => { setCategory('ALL'); setStatus('AVAILABLE'); setSearch(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              ✕ Clear
            </button>
          )}

          {/* Result count — pushed right */}
          <div className="ml-auto flex items-center gap-2">
            {!loading && (
              <span className="text-xs text-gray-400 font-medium">
                <span className="text-gray-700 font-bold">{filtered.length}</span> listing{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Split pane: Map left | Cards right ── */}
      <div className="flex flex-1 overflow-hidden max-w-screen-2xl w-full mx-auto">

        {/* LEFT — sticky map pane (hidden on mobile, visible md+) */}
        <div className="hidden md:flex flex-col" style={{ width: '48%', minWidth: 360 }}>
          <div className="h-full relative">
            {loading ? (
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-3">
                <div className="text-5xl animate-pulse">📍</div>
                <p className="text-gray-400 text-sm">Loading map...</p>
              </div>
            ) : (
              <DonationMap donations={filtered} fullHeight />
            )}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block w-px bg-gray-200 shrink-0" />

        {/* RIGHT — scrollable cards pane */}
        <div className="flex-1 overflow-y-auto bg-gray-50">

          {/* Mobile-only map banner */}
          <div className="md:hidden bg-green-50 border-b border-green-100 px-4 py-3 text-xs text-green-700 font-medium flex items-center gap-2">
            <span>📍</span> Map view available on tablet and desktop
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-5xl mb-4 animate-pulse">⏳</div>
                <p className="text-gray-400">Loading donations...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl font-semibold text-gray-700">
                  {donations.length === 0 ? 'No donations yet' : 'No matches found'}
                </p>
                <p className="text-gray-400 mt-1 text-sm">
                  {donations.length === 0
                    ? 'Be the first to post something!'
                    : 'Try a different category or clear your filters'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((d) => <DonationCard key={d.id} donation={d} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
