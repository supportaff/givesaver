'use client';
import { useState, useMemo } from 'react';

const FOCUS_COLORS: Record<string, string> = {
  'Food':          'bg-orange-100 text-orange-700',
  'Clothes':       'bg-blue-100 text-blue-700',
  'Books':         'bg-purple-100 text-purple-700',
  'Food & Clothes':'bg-red-100 text-red-700',
  'Food & Books':  'bg-yellow-100 text-yellow-700',
  'All':           'bg-green-100 text-green-700',
  'Education':     'bg-indigo-100 text-indigo-700',
  'Healthcare':    'bg-pink-100 text-pink-700',
  'Women':         'bg-fuchsia-100 text-fuchsia-700',
  'Children':      'bg-cyan-100 text-cyan-700',
};

type NGO = {
  name: string; city: string; focus: string;
  phone: string | null; website: string | null; desc: string;
};

export default function NGOList({ ngos, cities, focuses }: { ngos: NGO[]; cities: string[]; focuses: string[] }) {
  const [city,   setCity]   = useState('All');
  const [focus,  setFocus]  = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => ngos.filter((n) => {
    const matchCity  = city  === 'All' || n.city  === city;
    const matchFocus = focus === 'All' || n.focus === focus;
    const q = search.toLowerCase();
    const matchSearch = !q || n.name.toLowerCase().includes(q) || n.city.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q);
    return matchCity && matchFocus && matchSearch;
  }), [ngos, city, focus, search]);

  return (
    <div className="section-wrapper py-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search NGO or city..." className="input-field pl-9" />
        </div>
        <select value={city}  onChange={(e) => setCity(e.target.value)}  className="input-field max-w-[160px]">
          {cities.map((c)  => <option key={c}  value={c}>{c}</option>)}
        </select>
        <select value={focus} onChange={(e) => setFocus(e.target.value)} className="input-field max-w-[180px]">
          {focuses.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {(city !== 'All' || focus !== 'All' || search) && (
          <button onClick={() => { setCity('All'); setFocus('All'); setSearch(''); }}
            className="btn-secondary text-sm">Clear</button>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-5">{filtered.length} organisation{filtered.length !== 1 ? 's' : ''} found</p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">No NGOs match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((n) => (
            <div key={n.name} className="card hover:shadow-md transition-all flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 leading-snug">{n.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {n.city}, Tamil Nadu</p>
                </div>
                <span className={`badge shrink-0 text-xs ${
                  FOCUS_COLORS[n.focus] ?? 'bg-gray-100 text-gray-600'
                }`}>{n.focus}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{n.desc}</p>
              <div className="flex flex-col gap-1.5 mt-auto">
                {n.phone && (
                  <a href={`tel:${n.phone}`}
                    className="text-sm text-green-700 font-medium hover:underline">
                    📞 {n.phone}
                  </a>
                )}
                {n.website && (
                  <a href={n.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate">
                    🌐 {n.website.replace('https://', '')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
