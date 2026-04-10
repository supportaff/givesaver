'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ITEM_TYPES } from '@/lib/data';
import type { Category } from '@/lib/data';

const CATEGORIES: { value: Category; label: string; emoji: string; hint: string }[] = [
  { value: 'FOOD',    label: 'Food',    emoji: '🍱', hint: 'e.g. Fresh vegetables, cooked meals, packaged goods' },
  { value: 'CLOTHES', label: 'Clothes', emoji: '👕', hint: 'e.g. Men\'s jackets, children\'s school uniforms' },
  { value: 'BOOKS',   label: 'Books',   emoji: '📚', hint: 'e.g. CBSE textbooks, English novels' },
];

export default function DonatePage() {
  const [category, setCategory] = useState<Category>('FOOD');
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,    setError]    = useState('');

  const cat = CATEGORIES.find((c) => c.value === category)!;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;
    const fd   = new FormData(form);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       fd.get('title'),
          description: fd.get('description'),
          quantity:    fd.get('quantity'),
          category,
          itemType:    fd.get('itemType'),
          expiresAt:   fd.get('expiresAt') || null,
          donorName:   fd.get('donorName'),
          donorType:   fd.get('donorType'),
          phone:       fd.get('phone'),
          address:     fd.get('address'),
          city:        fd.get('city') || 'Chennai',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Donation Posted!</h2>
        <p className="text-gray-500 leading-relaxed mb-8">
          Thank you for your generosity. Your listing is now live and
          NGOs in Chennai will be notified.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => { setSubmitted(false); setAgreed(false); }} className="btn-secondary">Post Another</button>
          <Link href="/browse" className="btn-primary">Browse Donations</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-10">
          <h1 className="text-4xl font-bold text-gray-800">Post a Donation</h1>
          <p className="text-gray-500 mt-2">Share your surplus with communities who need it in Chennai</p>
        </div>
      </div>
      <div className="section-wrapper py-10">
        <div className="max-w-2xl mx-auto">
          {/* Category */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select Category</p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                  className={`flex flex-col items-center py-5 px-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    category === c.value ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                  }`}>
                  <span className="text-4xl mb-2">{c.emoji}</span>{c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Donation Title *</label>
                <input name="title" required placeholder={cat.hint} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea name="description" rows={3} placeholder="Describe the items..." className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity *</label>
                  <input name="quantity" required placeholder={category === 'FOOD' ? 'e.g. 5 kg' : category === 'CLOTHES' ? 'e.g. 10 pieces' : 'e.g. 20 books'} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Type *</label>
                  <select name="itemType" key={category} required className="input-field">
                    <option value="">Select type...</option>
                    {ITEM_TYPES[category].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {category === 'FOOD' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry / Best Before *</label>
                  <input name="expiresAt" type="datetime-local" required className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">Required for food safety.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                  <input name="donorName" required placeholder="Full name or organisation" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Donor Type *</label>
                  <select name="donorType" required className="input-field">
                    <option value="Individual">Individual</option>
                    <option value="Business">Business / Restaurant</option>
                    <option value="NGO">NGO</option>
                    <option value="Institution">Institution / School</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp / Contact *</label>
                <input name="phone" required placeholder="+91 XXXXX XXXXX" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Address *</label>
                <input name="address" required placeholder="Street / Area" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                <input name="city" required defaultValue="Chennai" placeholder="City" className="input-field" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                  <span className="text-sm text-amber-800 leading-relaxed">
                    I confirm the donated items are <strong>safe, clean, and fit for use</strong>. I have read and agree to the{' '}
                    <Link href="/terms" target="_blank" className="underline font-semibold">Terms &amp; Conditions</Link>{' '}and{' '}
                    <Link href="/disclaimer" target="_blank" className="underline font-semibold">Disclaimer</Link>.
                  </span>
                </label>
              </div>
              <button type="submit" disabled={!agreed || loading}
                className="btn-primary w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Posting...' : `${cat.emoji} Post ${cat.label} Donation`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
