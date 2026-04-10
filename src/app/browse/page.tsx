'use client';

import { useState, useMemo, useEffect } from 'react';
import DonationCard from '@/components/DonationCard';
import { CATEGORY_META } from '@/lib/data';
import type { Category, Status } from '@/lib/data';
import type { DonationRow } from '@/lib/supabase/types';

export default function BrowsePage() {
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState<Category | 'ALL'>('ALL');
  const [status,    setStatus]    = useState<Status | 'ALL'>('ALL');
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="section-wrapper py-10">
          <h1 className="text-4xl font-bold text-gray-800">Browse Donations</h1>
          <p className="text-gray-500 mt-2">Find available food, clothes, and books near you in Chennai</p>
        </div>
      </div>

      <div className="section-wrapper py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setCategory(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                category === t.key
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'
              }`}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, city, type..." className="input-field pl-9" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status | 'ALL')} className="input-field max-w-[180px]">
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="CLAIMED">Claimed</option>
            <option value="COLLECTED">Collected</option>
          </select>
          {(category !== 'ALL' || status !== 'ALL' || search) && (
            <button onClick={() => { setCategory('ALL'); setStatus('ALL'); setSearch(''); }} className="btn-secondary text-sm">Clear Filters</button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-500">Loading donations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-gray-700">
              {donations.length === 0 ? 'No donations yet' : 'No donations found'}
            </p>
            <p className="text-gray-400 mt-1">
              {donations.length === 0 ? 'Be the first to post a donation!' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> donation{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((d) => <DonationCard key={d.id} donation={d} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
