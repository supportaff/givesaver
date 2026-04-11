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
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function DonationCard({ donation: d }: { donation: DonationRow }) {
  const cat        = CATEGORY_META[d.category as keyof typeof CATEGORY_META];
  const statusMeta = STATUS_META[d.status as keyof typeof STATUS_META];

  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ name: '', phone: '', message: '' });
  const [agreed,     setAgreed]     = useState(false);
  const [err,        setErr]        = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  function shareOnWhatsApp() {
    const url  = `${window.location.origin}/donation/${d.id}`;
    const text = `🌱 Free ${cat?.label} available in ${d.city}!\n\n*${d.title}*\nQty: ${d.quantity}\nArea: ${d.address}, ${d.city}\n\nClaim it free on DontWaste → ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function handleOpenWhatsApp() {
    if (!form.name.trim())  { setErr('Please enter your name.');          return; }
    const phoneErr = validateIndianPhone(form.phone.trim());
    if (phoneErr)           { setErr(phoneErr);                           return; }
    if (!agreed)            { setErr('Please accept the disclaimer below.'); return; }
    setErr('');
    setSubmitting(true);
    try {
      const res  = await fetch('/api/claims/init', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId:    d.id,
          receiverName:  form.name.trim(),
          receiverPhone: form.phone.trim(),
          message:       form.message.trim(),
        }),
      });
      const data = await res.json() as { waURL?: string; error?: string };
      if (!res.ok || !data.waURL) { setErr(data.error ?? 'Failed. Please try again.'); return; }
      setSubmitted(true);
      window.open(data.waURL, '_blank', 'noopener,noreferrer');
    } catch { setErr('Something went wrong. Please try again.'); }
    finally  { setSubmitting(false); }
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200 flex flex-col gap-3 group overflow-hidden">

      {/* Photo — with aspect ratio box and emoji fallback */}
      <Link href={`/donation/${d.id}`} className="block -mx-5 -mt-5 mb-1">
        {d.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.photo_url}
            alt={d.title}
            className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-32 flex items-center justify-center text-5xl ${
            d.category === 'FOOD' ? 'bg-orange-50' :
            d.category === 'CLOTHES' ? 'bg-blue-50' : 'bg-purple-50'
          }`}>
            {cat?.emoji}
          </div>
        )}
      </Link>

      {/* Title + status */}
      <div className="flex justify-between items-start gap-2">
        <Link href={`/donation/${d.id}`} className="flex items-start gap-2.5 min-w-0 hover:text-green-700 transition-colors">
          <h3 className="font-semibold text-gray-800 leading-snug group-hover:text-green-700 transition-colors break-words">{d.title}</h3>
        </Link>
        <span className={`badge ${statusMeta?.color} shrink-0 whitespace-nowrap text-xs`}>{statusMeta?.label}</span>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <span className={`badge ${cat?.color} text-xs`}>{cat?.label}</span>
        <span className="badge bg-gray-100 text-gray-500 text-xs">{d.item_type}</span>
        <span className="badge bg-gray-50 text-gray-400 text-xs">{d.donor_type}</span>
      </div>

      {d.description && (
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{d.description}</p>
      )}

      {/* Details row */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">📦</span>
          <span className="text-gray-500 text-xs">Qty:</span>
          <span className="font-medium text-gray-700 text-xs">{d.quantity}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">📍</span>
          <span className="text-gray-500 text-xs">Area:</span>
          <span className="font-medium text-gray-700 text-xs truncate">{d.city}</span>
        </div>
      </div>

      {d.expires_at && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
          <span>⏰</span> Expires: {d.expires_at}
        </div>
      )}

      {(d.category === 'CLOTHES' || d.category === 'BOOKS') && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          <span className="shrink-0">⛔</span>
          <span>For personal/charity use only. Resale is strictly prohibited.</span>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 truncate">{d.address}, {d.city}</p>
          <p className="text-xs mt-0.5">
            <span className="text-gray-500">By </span>
            <span className="font-medium text-gray-700">{d.donor_name}</span>
            <span className="text-gray-400"> · {timeAgo(d.created_at)}</span>
          </p>
        </div>
        {/* Share + detail link */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={shareOnWhatsApp}
            title="Share on WhatsApp"
            className="text-xs text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1">
            📤 Share
          </button>
          <Link
            href={`/donation/${d.id}`}
            className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors font-semibold">
            Details →
          </Link>
        </div>
      </div>

      {/* ─── AVAILABLE CTAs ─── */}
      {d.status === 'AVAILABLE' && (
        <div className="flex flex-col gap-2 mt-1">
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm font-bold text-green-800">WhatsApp opened!</p>
              <p className="text-xs text-green-700 mt-1">Send the message to the donor. They&apos;ll confirm pickup with you.</p>
            </div>
          )}

          {!showForm && !submitted && (
            <button
              onClick={() => { setShowForm(true); setErr(''); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all shadow-sm active:scale-95">
              {WA_ICON} I want this — Contact Donor
            </button>
          )}

          {showForm && !submitted && (
            <div className="flex flex-col gap-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-sm font-bold text-gray-800">💬 Tell the donor who you are</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  We&apos;ll open WhatsApp with a ready message to the donor.
                  <strong className="text-gray-700"> The donor&apos;s number is never shown here.</strong>
                </p>
                {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
                <input
                  placeholder="Your Full Name *"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field text-sm"
                />
                <div>
                  <input
                    placeholder="Your WhatsApp number (10 digits) *"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-field text-sm"
                    maxLength={13}
                  />
                  <p className="text-xs text-gray-400 mt-1">e.g. 9876543210 — must be a valid Indian mobile number</p>
                </div>
                <textarea
                  placeholder="Message (optional) — e.g. I can pick up today by 6 PM"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="input-field text-sm resize-none"
                  rows={2}
                />
                <label className="flex items-start gap-2 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                  <span className="text-xs text-amber-800 leading-relaxed">
                    I understand DontWaste is a <strong>free, non-commercial platform</strong> and is not responsible for item quality.
                    I will inspect items before accepting and use this only for genuine, non-commercial purposes.
                  </span>
                </label>
                <button onClick={handleOpenWhatsApp} disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all active:scale-95 shadow disabled:opacity-50">
                  {WA_ICON} {submitting ? 'Opening WhatsApp...' : 'Open WhatsApp to Contact Donor'}
                </button>
                <button onClick={() => { setShowForm(false); setErr(''); setAgreed(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 text-center py-1 transition-colors">
                  ✕ Cancel
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                <p className="font-semibold text-gray-600 mb-1">🛡️ Safety &amp; Disclaimer</p>
                <ul className="space-y-1">
                  <li>• Always meet in a <strong>safe, public place</strong> for pickup.</li>
                  <li>• DontWaste does <strong>not verify</strong> donors or item quality.</li>
                  <li>• <strong>Inspect items</strong> before accepting. Reject anything unsafe.</li>
                  <li>• Never pay money. All donations are <strong>100% free</strong>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {d.status !== 'AVAILABLE' && (
        <div className="text-center py-2">
          <span className={`badge text-sm ${statusMeta?.color}`}>
            {d.status === 'CLAIMED' ? '🤝 Claimed — Pickup in progress' : '📦 Collected'}
          </span>
        </div>
      )}
    </div>
  );
}
