'use client';
import { useState, useEffect } from 'react';

interface ScrapRate {
  id:       string;
  name:     string;
  category: string;
  unit:     string;
  price:    number;
  city:     string;
  active:   boolean;
  updated_at: string;
}

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  paper:      { label: 'Paper & Cardboard', emoji: '📰', color: 'bg-yellow-50 border-yellow-200' },
  plastic:    { label: 'Plastic',           emoji: '🛒', color: 'bg-blue-50 border-blue-200' },
  metal:      { label: 'Metal',             emoji: '⚙️',  color: 'bg-gray-50 border-gray-200' },
  ewaste:     { label: 'E-Waste',           emoji: '💻', color: 'bg-purple-50 border-purple-200' },
  appliances: { label: 'Appliances',        emoji: '🧹', color: 'bg-red-50 border-red-200' },
  glass:      { label: 'Glass',             emoji: '🍺', color: 'bg-cyan-50 border-cyan-200' },
  other:      { label: 'Other',             emoji: '📦', color: 'bg-gray-50 border-gray-200' },
};

export default function RatesPage() {
  const [rates,    setRates]    = useState<ScrapRate[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [city,     setCity]     = useState('Chennai');
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scrap-rates?city=${encodeURIComponent(city)}&active=true`)
      .then((r) => r.json())
      .then((data: ScrapRate[]) => {
        setRates(Array.isArray(data) ? data : []);
        if (data.length) setLastSync(data[0].updated_at);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [city]);

  const grouped = rates.reduce<Record<string, ScrapRate[]>>((acc, r) => {
    const key = r.category.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const categoryOrder = ['paper', 'plastic', 'metal', 'appliances', 'ewaste', 'glass', 'other'];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="section-wrapper py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Today’s Scrap Rates</h1>
              <p className="text-gray-500 mt-1">Live rates updated by our team based on market conditions</p>
              {lastSync && (
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {new Date(lastSync).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="input-field w-40 text-sm">
                <option>Chennai</option>
                <option>Coimbatore</option>
                <option>Madurai</option>
                <option>Salem</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="section-wrapper py-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-5xl mb-4 animate-pulse">♻️</div>
            <p className="text-gray-400">Loading rates...</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-xl font-semibold text-gray-700">Rates not available yet</p>
            <p className="text-gray-400 mt-1 text-sm">Check back soon or contact us on WhatsApp.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {categoryOrder
              .filter((cat) => grouped[cat]?.length)
              .map((cat) => {
                const meta  = CATEGORY_META[cat] ?? CATEGORY_META.other;
                const items = grouped[cat];
                return (
                  <div key={cat} className={`rounded-2xl border ${meta.color} overflow-hidden`}>
                    {/* Category header */}
                    <div className="px-5 py-4 flex items-center gap-3">
                      <span className="text-3xl">{meta.emoji}</span>
                      <h2 className="text-lg font-extrabold text-gray-800">{meta.label}</h2>
                      <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length > 1 ? 's' : ''}</span>
                    </div>
                    {/* Rate table */}
                    <div className="bg-white">
                      <div className="grid grid-cols-3 px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <span>Item</span>
                        <span className="text-center">Unit</span>
                        <span className="text-right">Price</span>
                      </div>
                      {items.map((item, i) => (
                        <div key={item.id}
                          className={`grid grid-cols-3 px-5 py-3.5 items-center ${
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                          } border-b border-gray-50 last:border-0`}>
                          <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                          <span className="text-center text-xs text-gray-500 bg-gray-100 rounded-lg px-2 py-1 w-fit mx-auto">{item.unit}</span>
                          <span className="text-right font-extrabold text-green-700 text-base">
                            ₹{item.price.toFixed(0)}
                            <span className="text-xs text-gray-400 font-normal">/{item.unit}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800 leading-relaxed">
          <strong>⚠️ Disclaimer:</strong> Prices shown are indicative rates and may vary based on quantity, quality, and prevailing market conditions. Final payment is determined at the time of pickup after weighing and inspection.
        </div>

        {/* CTA */}
        <div className="mt-8 bg-green-700 rounded-2xl px-6 py-8 text-white text-center">
          <h3 className="text-2xl font-extrabold mb-2">Ready to sell your scrap?</h3>
          <p className="text-green-100 mb-6">Schedule a free doorstep pickup now and get paid on the spot.</p>
          <a href="/schedule" className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-2xl text-base shadow transition-all">
            📅 Schedule Pickup
          </a>
        </div>
      </div>
    </div>
  );
}
