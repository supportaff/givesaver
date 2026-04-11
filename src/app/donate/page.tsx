'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ITEM_TYPES } from '@/lib/data';
import type { Category } from '@/lib/data';

const AddressPicker = dynamic(() => import('@/components/AddressPicker'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 h-24 flex items-center justify-center">
      <p className="text-sm text-gray-400 animate-pulse">🗺️ Loading address picker…</p>
    </div>
  ),
});

const CATEGORIES: { value: Category; label: string; emoji: string; hint: string }[] = [
  { value: 'FOOD',    label: 'Food',    emoji: '🍱', hint: 'e.g. Fresh vegetables, cooked meals, packaged goods' },
  { value: 'CLOTHES', label: 'Clothes', emoji: '👕', hint: "e.g. Men's jackets, children's school uniforms" },
  { value: 'BOOKS',   label: 'Books',   emoji: '📚', hint: 'e.g. CBSE textbooks, English novels' },
];

export default function DonatePage() {
  const [category,   setCategory]   = useState<Category>('FOOD');
  const [agreed,     setAgreed]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [preview,    setPreview]    = useState<string | null>(null);
  const [photoFile,  setPhotoFile]  = useState<File | null>(null);
  const [address,    setAddress]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cat = CATEGORIES.find((c) => c.value === category)!;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5 MB.'); return; }
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!address.trim()) { setError('Please select or enter a pickup address.'); return; }
    setLoading(true); setError('');
    const form = e.currentTarget;
    const fd   = new FormData(form);
    const phone = fd.get('phone') as string;
    try {
      const res = await fetch('/api/donations', {
        method:  'POST',
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
          phone,
          address,
          city:        fd.get('city') || 'Chennai',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const donation = await res.json();
      if (photoFile && donation.id) {
        const photoForm = new FormData();
        photoForm.append('file', photoFile);
        photoForm.append('donationId', donation.id);
        await fetch('/api/donations/upload-photo', { method: 'POST', body: photoForm });
      }
      setDonorPhone(phone);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  }

  /* ─── SUCCESS SCREEN ─── */
  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800">Donation Posted!</h2>
          <p className="text-gray-500 mt-2 text-sm">Your listing is now live and visible to everyone nearby.</p>
        </div>
        <div className="card mb-4">
          <h3 className="font-bold text-gray-800 mb-4">📱 What happens next?</h3>
          <div className="space-y-4">
            {[
              ['1', 'Someone will contact you on WhatsApp', `Receivers will message you on ${donorPhone} to arrange pickup.`],
              ['2', 'Update your donation status', 'Go to My Donations and enter your phone number to find your listing.'],
              ['3', 'Mark as Collected', 'After handing over the item, mark it Collected so the listing closes.'],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center shrink-0">{num}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 mb-5">
          ⚠️ Arrange pickup in a safe, visible public spot. Never share your home address.
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/browse" className="btn-primary flex-1 text-center py-3">🔍 Browse Donations</Link>
          <Link href="/donate" className="btn-secondary flex-1 text-center py-3">➕ Post Another</Link>
        </div>
      </div>
    </div>
  );

  /* ─── FORM ─── */
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Post a Donation</h1>
          <p className="text-gray-500 mt-1 text-sm">Share your surplus with communities in your city</p>
        </div>
      </div>

      <div className="section-wrapper py-8">
        <div className="max-w-2xl mx-auto">

          {/* Category selector */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Select Category</p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                  className={`flex flex-col items-center py-4 px-2 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 ${
                    category === c.value
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                  }`}>
                  <span className="text-3xl mb-1.5">{c.emoji}</span>
                  <span className="text-xs">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Donation Title *</label>
                <input name="title" required placeholder={cat.hint} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea name="description" rows={3} placeholder="Describe the items in detail..." className="input-field resize-none" />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Photo <span className="text-gray-400 font-normal text-xs">(optional, max 5 MB)</span>
                </label>
                <div onClick={() => fileRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
                    preview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-green-400'
                  } flex flex-col items-center justify-center overflow-hidden`}
                  style={{ minHeight: preview ? 0 : '100px' }}>
                  {preview ? (
                    <div className="relative w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setPreview(null); setPhotoFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="absolute top-2 right-2 bg-white/90 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center shadow text-sm">✕</button>
                    </div>
                  ) : (
                    <div className="py-6 text-center px-4">
                      <div className="text-3xl mb-1">📸</div>
                      <p className="text-sm font-medium text-gray-600">Tap to upload a photo</p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity *</label>
                  <input name="quantity" required
                    placeholder={category === 'FOOD' ? 'e.g. 5 kg' : category === 'CLOTHES' ? 'e.g. 10 pieces' : 'e.g. 20 books'}
                    className="input-field" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp / Phone *</label>
                <input name="phone" required placeholder="+91 XXXXX XXXXX" type="tel" className="input-field" />
                <p className="text-xs text-gray-400 mt-1">Receivers will contact you on this number.</p>
              </div>

              {/* ── Address Picker ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Pickup Address *
                  {address && <span className="ml-2 text-green-600 text-xs font-normal">✅ {address}</span>}
                </label>
                <AddressPicker value={address} onChange={setAddress} />
                {!address && (
                  <p className="text-xs text-red-400 mt-1">Please pick a location on the map or type an address.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                <input name="city" required defaultValue="Chennai" placeholder="City" className="input-field" />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                  <span className="text-sm text-amber-800 leading-relaxed">
                    I confirm items are <strong>safe, clean, and fit for use</strong>. I agree to the{' '}
                    <Link href="/disclaimer" target="_blank" className="underline font-semibold">Disclaimer</Link>.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={!agreed || loading || !address.trim()}
                className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform">
                {loading ? 'Posting...' : `${cat.emoji} Post ${cat.label} Donation`}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
