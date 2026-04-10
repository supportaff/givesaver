'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { ITEM_TYPES } from '@/lib/data';
import type { Category } from '@/lib/data';

const CATEGORIES: { value: Category; label: string; emoji: string; hint: string }[] = [
  { value: 'FOOD',    label: 'Food',    emoji: '🍱', hint: 'e.g. Fresh vegetables, cooked meals, packaged goods' },
  { value: 'CLOTHES', label: 'Clothes', emoji: '👕', hint: "e.g. Men's jackets, children's school uniforms" },
  { value: 'BOOKS',   label: 'Books',   emoji: '📚', hint: 'e.g. CBSE textbooks, English novels' },
];

export default function DonatePage() {
  const [category,  setCategory]  = useState<Category>('FOOD');
  const [agreed,    setAgreed]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donationId, setDonationId] = useState('');
  const [preview,   setPreview]   = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
    e.preventDefault(); setLoading(true); setError('');
    const form = e.currentTarget;
    const fd   = new FormData(form);
    const phone = fd.get('phone') as string;
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
          phone,
          address:     fd.get('address'),
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
      setDonationId(donation.id);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally { setLoading(false); }
  }

  if (submitted) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md w-full">
        <div className="text-7xl mb-5">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Donation Posted!</h2>
        <p className="text-gray-500 mb-6">Your listing is now live and visible to everyone in your city.</p>

        {/* How to check status */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5 text-left">
          <h3 className="font-bold text-green-800 mb-3">📱 How to check &amp; update your donation status</h3>
          <ol className="space-y-3 text-sm text-green-900">
            <li className="flex gap-2">
              <span className="font-bold shrink-0">1.</span>
              <span>Go to <Link href="/browse" className="underline font-semibold">Browse Donations</Link> and search for your donation title or look under your phone number.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0">2.</span>
              <span>When a receiver claims your donation, they will <strong>call or WhatsApp you</strong> on <strong className="text-green-700">{donorPhone}</strong> to arrange pickup.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold shrink-0">3.</span>
              <span>After handing over the item, open your donation and tap <strong>“Mark as Collected”</strong> to close the listing.</span>
            </li>
          </ol>
          <div className="mt-4 bg-white border border-green-200 rounded-xl px-4 py-3 text-xs text-gray-500">
            🔒 <strong>Your manage link</strong> (bookmark this):<br />
            <span className="font-mono text-green-700 text-xs break-all">givesaver.in/manage/{donationId}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 mb-6 text-left">
          ⚠️ Never share your personal address publicly. Arrange pickup in a visible, safe spot.
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/browse" className="btn-primary">Browse Donations</Link>
          <Link href="/donate" className="btn-secondary">Post Another</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b"><div className="section-wrapper py-10">
        <h1 className="text-4xl font-bold text-gray-800">Post a Donation</h1>
        <p className="text-gray-500 mt-2">Share your surplus with communities in your city</p>
      </div></div>
      <div className="section-wrapper py-10"><div className="max-w-2xl mx-auto">
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
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Donation Title *</label>
              <input name="title" required placeholder={cat.hint} className="input-field" /></div>

            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea name="description" rows={3} placeholder="Describe the items..." className="input-field resize-none" /></div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Photo <span className="text-gray-400 font-normal">(optional, max 5 MB)</span></label>
              <div onClick={() => fileRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
                  preview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                } flex flex-col items-center justify-center overflow-hidden`}
                style={{ minHeight: preview ? 0 : '120px' }}>
                {preview ? (
                  <div className="relative w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="w-full max-h-56 object-cover rounded-xl" />
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setPhotoFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-white/90 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center shadow text-sm">✕</button>
                  </div>
                ) : (
                  <div className="py-8 text-center px-4">
                    <div className="text-3xl mb-2">📸</div>
                    <p className="text-sm font-medium text-gray-600">Click to upload a photo</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 5 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity *</label>
                <input name="quantity" required placeholder={category === 'FOOD' ? 'e.g. 5 kg' : category === 'CLOTHES' ? 'e.g. 10 pieces' : 'e.g. 20 books'} className="input-field" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Type *</label>
                <select name="itemType" key={category} required className="input-field">
                  <option value="">Select type...</option>
                  {ITEM_TYPES[category].map((t) => <option key={t} value={t}>{t}</option>)}
                </select></div>
            </div>

            {category === 'FOOD' && (
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry / Best Before *</label>
                <input name="expiresAt" type="datetime-local" required className="input-field" />
                <p className="text-xs text-gray-400 mt-1">Required for food safety.</p></div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                <input name="donorName" required placeholder="Full name or organisation" className="input-field" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Donor Type *</label>
                <select name="donorType" required className="input-field">
                  <option value="Individual">Individual</option>
                  <option value="Business">Business / Restaurant</option>
                  <option value="NGO">NGO</option>
                  <option value="Institution">Institution / School</option>
                </select></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp / Phone *</label>
              <input name="phone" required placeholder="+91 XXXXX XXXXX" className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Receivers will contact you on this number to arrange pickup. Make sure it&apos;s reachable.</p>
            </div>

            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Address *</label>
              <input name="address" required placeholder="Street / Area" className="input-field" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
              <input name="city" required defaultValue="Chennai" placeholder="City" className="input-field" /></div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                <span className="text-sm text-amber-800 leading-relaxed">
                  I confirm items are <strong>safe, clean, and fit for use</strong>. I agree to the{' '}
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
      </div></div>
    </div>
  );
}
