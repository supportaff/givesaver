'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { DonationRow } from '@/lib/supabase/types';
import { CATEGORY_META, STATUS_META } from '@/lib/data';
import { validateIndianPhone } from '@/lib/phone';

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins || 1} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function DonationDetailClient({ donation: d }: { donation: DonationRow }) {
  const cat        = CATEGORY_META[d.category as keyof typeof CATEGORY_META];
  const statusMeta = STATUS_META[d.status   as keyof typeof STATUS_META];

  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ name: '', phone: '', message: '' });
  const [agreed,     setAgreed]     = useState(false);
  const [err,        setErr]        = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  function shareOnWhatsApp() {
    const url  = `${window.location.origin}/donation/${d.id}`;
    const text = `🌱 Free ${cat?.label} in ${d.city}!\n\n*${d.title}*\nQty: ${d.quantity}\nArea: ${d.address}, ${d.city}\n\nClaim it free → ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function handleContact() {
    if (!form.name.trim()) { setErr('Please enter your name.'); return; }
    const phoneErr = validateIndianPhone(form.phone.trim());
    if (phoneErr)          { setErr(phoneErr);                  return; }
    if (!agreed)           { setErr('Please accept the disclaimer.'); return; }
    setErr(''); setSubmitting(true);
    try {
      const res  = await fetch('/api/claims/init', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: d.id, receiverName: form.name.trim(), receiverPhone: form.phone.trim(), message: form.message.trim() }),
      });
      const data = await res.json() as { waURL?: string; error?: string };
      if (!res.ok || !data.waURL) { setErr(data.error ?? 'Failed. Try again.'); return; }
      setSubmitted(true);
      window.open(data.waURL, '_blank', 'noopener,noreferrer');
    } catch { setErr('Something went wrong. Please try again.'); }
    finally  { setSubmitting(false); }
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="section-wrapper py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/browse" className="hover:text-green-600 transition-colors">Browse</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-xs">{d.title}</span>
        </div>
      </div>

      <div className="section-wrapper py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT — photo + details */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Photo */}
            {d.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.photo_url} alt={d.title}
                className="w-full rounded-2xl object-cover shadow-sm"
                style={{ maxHeight: 380 }} />
            ) : (
              <div className={`w-full rounded-2xl flex items-center justify-center text-8xl ${
                d.category === 'FOOD' ? 'bg-orange-50' :
                d.category === 'CLOTHES' ? 'bg-blue-50' : 'bg-purple-50'
              }`} style={{ height: 220 }}>
                {cat?.emoji}
              </div>
            )}

            {/* Title + status */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-800 leading-snug">{d.title}</h1>
              <span className={`badge ${statusMeta?.color} text-sm shrink-0`}>{statusMeta?.label}</span>
            </div>

            {/* Category badges */}
            <div className="flex gap-2 flex-wrap">
              <span className={`badge ${cat?.color}`}>{cat?.emoji} {cat?.label}</span>
              <span className="badge bg-gray-100 text-gray-600">{d.item_type}</span>
              <span className="badge bg-gray-100 text-gray-500">{d.donor_type}</span>
            </div>

            {/* Description */}
            {d.description && (
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">About this donation</p>
                <p className="text-gray-600 text-sm leading-relaxed">{d.description}</p>
              </div>
            )}

            {/* Info grid */}
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 grid grid-cols-2 gap-4">
              {[
                ['📦', 'Quantity',   d.quantity],
                ['📍', 'Area',       `${d.address}, ${d.city}`],
                ['👤', 'Donor',      `${d.donor_name} (${d.donor_type})`],
                ['🕒', 'Posted',     timeAgo(d.created_at)],
              ].map(([icon, label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{icon} {label}</p>
                  <p className="text-sm font-semibold text-gray-700">{val}</p>
                </div>
              ))}
            </div>

            {/* Expiry */}
            {d.expires_at && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-3 rounded-xl text-sm text-orange-700 font-medium">
                ⏰ Expires: <strong>{d.expires_at}</strong>
              </div>
            )}

            {/* No resale warning */}
            {(d.category === 'CLOTHES' || d.category === 'BOOKS') && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-xs text-red-600">
                <span>⛔</span> For personal/charity use only. Resale is strictly prohibited.
              </div>
            )}
          </div>

          {/* RIGHT — sticky contact + share panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 flex flex-col gap-4">

              {/* Share card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-700 mb-3">📤 Share this listing</p>
                <p className="text-xs text-gray-400 mb-4">Know someone who needs this? Share directly on WhatsApp.</p>
                <button onClick={shareOnWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all shadow-sm active:scale-95">
                  {WA_ICON} Share on WhatsApp
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/donation/${d.id}`); }}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                  🔗 Copy Link
                </button>
              </div>

              {/* Contact card */}
              {d.status === 'AVAILABLE' ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  {submitted ? (
                    <div className="text-center py-4">
                      <p className="text-3xl mb-2">✅</p>
                      <p className="font-bold text-green-800">WhatsApp opened!</p>
                      <p className="text-xs text-gray-500 mt-1">Send the pre-filled message to the donor to confirm pickup.</p>
                    </div>
                  ) : !showForm ? (
                    <>
                      <p className="text-sm font-bold text-gray-700 mb-1">This item is available!</p>
                      <p className="text-xs text-gray-400 mb-4">Contact the donor via WhatsApp to arrange a free pickup.</p>
                      <button onClick={() => { setShowForm(true); setErr(''); }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all shadow active:scale-95">
                        {WA_ICON} Contact Donor
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-bold text-gray-800">💬 Your details</p>
                      {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
                      <input placeholder="Your Full Name *" value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="input-field text-sm" />
                      <div>
                        <input placeholder="WhatsApp number (10 digits) *" type="tel" value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          className="input-field text-sm" maxLength={13} />
                        <p className="text-xs text-gray-400 mt-1">e.g. 9876543210 — valid Indian mobile only</p>
                      </div>
                      <textarea placeholder="Message (optional)" value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        className="input-field text-sm resize-none" rows={2} />
                      <label className="flex items-start gap-2 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                        <span className="text-xs text-amber-800 leading-relaxed">
                          I understand DontWaste is a <strong>free, non-commercial</strong> platform.
                          I will inspect items before accepting.
                        </span>
                      </label>
                      <button onClick={handleContact} disabled={submitting}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all active:scale-95 shadow disabled:opacity-50">
                        {WA_ICON} {submitting ? 'Opening...' : 'Open WhatsApp'}
                      </button>
                      <button onClick={() => { setShowForm(false); setErr(''); setAgreed(false); }}
                        className="text-xs text-gray-400 hover:text-gray-600 text-center py-1">✕ Cancel</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
                  <p className="text-3xl mb-2">{d.status === 'CLAIMED' ? '🤝' : '📦'}</p>
                  <p className="font-semibold text-gray-700">
                    {d.status === 'CLAIMED' ? 'Already Claimed' : 'Already Collected'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">This item is no longer available.</p>
                  <Link href="/browse" className="mt-4 inline-block btn-secondary text-sm">Browse other donations</Link>
                </div>
              )}

              {/* Safety note */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3 text-xs text-gray-500 leading-relaxed">
                <p className="font-semibold text-gray-600 mb-1">🛡️ Safety reminder</p>
                <ul className="space-y-1">
                  <li>• Meet in a <strong>public place</strong> for pickup</li>
                  <li>• All donations are <strong>100% free</strong> — never pay</li>
                  <li>• Inspect before accepting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
