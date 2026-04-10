'use client';
import { useState } from 'react';
import type { DonationRow } from '@/lib/supabase/types';
import { CATEGORY_META, STATUS_META } from '@/lib/data';

function buildClaimWhatsAppURL(
  d: DonationRow,
  receiverName: string,
  receiverPhone: string,
  customMsg: string
): string {
  const phone = d.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
  const e164  = phone.startsWith('91') ? phone : `91${phone}`;
  const expiry = d.expires_at ? `\n⏰ Expiry: ${d.expires_at}` : '';
  const lines = [
    `👋 Hi ${d.donor_name},`,
    `I saw your donation on *GiveSaver* and would like to collect:`,
    `*${d.title}* — ${d.quantity}${expiry}`,
    `📍 Pickup: ${d.address}, ${d.city}`,
    ``,
    `👤 My name: ${receiverName}`,
    `📞 My phone: ${receiverPhone}`,
    customMsg ? `💬 ${customMsg}` : `Can we arrange a pickup? Thank you 🙏`,
    ``,
    `— Sent via GiveSaver`,
  ];
  return `https://wa.me/${e164}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins || 1} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function DonationCard({ donation: d }: { donation: DonationRow }) {
  const cat        = CATEGORY_META[d.category as keyof typeof CATEGORY_META];
  const statusMeta = STATUS_META[d.status as keyof typeof STATUS_META];

  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name: '', phone: '', message: '' });
  const [agreed,   setAgreed]   = useState(false);
  const [err,      setErr]      = useState('');

  function handleOpenWhatsApp() {
    if (!form.name.trim())  { setErr('Please enter your name');          return; }
    if (!form.phone.trim()) { setErr('Please enter your phone number');   return; }
    if (!agreed)            { setErr('Please accept the disclaimer below'); return; }
    setErr('');

    // Save claim in background (fire & forget — WhatsApp opens regardless)
    fetch('/api/claims/init', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donationId:    d.id,
        receiverName:  form.name,
        receiverPhone: form.phone,
        message:       form.message,
      }),
    }).catch(() => {/* silent */});

    const url = buildClaimWhatsAppURL(d, form.name.trim(), form.phone.trim(), form.message.trim());
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200 flex flex-col gap-3 group">

      {/* Photo */}
      {d.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.photo_url} alt={d.title} className="w-full h-44 object-cover rounded-xl -mt-1" />
      )}

      {/* Title + status */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-2xl shrink-0 mt-0.5">{cat?.emoji}</span>
          <h3 className="font-semibold text-gray-800 leading-snug group-hover:text-green-700 transition-colors break-words">{d.title}</h3>
        </div>
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
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-400 truncate">{d.address}, {d.city}</p>
        <p className="text-xs mt-0.5">
          <span className="text-gray-500">By </span>
          <span className="font-medium text-gray-700">{d.donor_name}</span>
          <span className="text-gray-400"> · {timeAgo(d.created_at)}</span>
        </p>
      </div>

      {/* ─── AVAILABLE CTAs ─── */}
      {d.status === 'AVAILABLE' && (
        <div className="flex flex-col gap-2 mt-1">

          {/* Step 1 — show button to open form */}
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setErr(''); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all shadow-sm active:scale-95">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              I want this — Contact Donor
            </button>
          )}

          {/* Step 2 — fill details form */}
          {showForm && (
            <div className="flex flex-col gap-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-sm font-bold text-gray-800">💬 Tell the donor who you are</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Fill in your details. We&apos;ll open WhatsApp with a ready-to-send message to the donor.
                  <strong className="text-gray-700"> Your info goes in the message — the donor&apos;s number is never shown here.</strong>
                </p>

                {err && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>
                )}

                <input
                  placeholder="Your Full Name *"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field text-sm"
                />
                <input
                  placeholder="Your WhatsApp / Phone *"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field text-sm"
                />
                <textarea
                  placeholder="Message (optional) — e.g. I can pick up today by 6 PM"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="input-field text-sm resize-none"
                  rows={2}
                />

                {/* Disclaimer checkbox */}
                <label className="flex items-start gap-2 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-green-600 shrink-0"
                  />
                  <span className="text-xs text-amber-800 leading-relaxed">
                    I understand that <strong>GiveSaver is a free, non-commercial platform</strong> and is not responsible
                    for the quality, condition, or safety of donated items. I will inspect all items before accepting.
                    I agree to use this platform only for genuine, non-commercial purposes.
                  </span>
                </label>

                <button
                  onClick={handleOpenWhatsApp}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all active:scale-95 shadow">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Open WhatsApp to Contact Donor
                </button>

                <button
                  onClick={() => { setShowForm(false); setErr(''); setAgreed(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 text-center py-1 transition-colors">
                  ✕ Cancel
                </button>
              </div>

              {/* Bottom disclaimer note */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                <p className="font-semibold text-gray-600 mb-1">🛡️ Safety &amp; Disclaimer</p>
                <ul className="space-y-1">
                  <li>• Always meet in a <strong>safe, public place</strong> for pickup.</li>
                  <li>• GiveSaver does <strong>not verify</strong> donors or item quality.</li>
                  <li>• <strong>Inspect items</strong> before accepting. Reject anything unsafe.</li>
                  <li>• Never pay money for any listed item. All donations are <strong>100% free</strong>.</li>
                  <li>• Report misuse to us. This platform is for <strong>genuine good use only</strong>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Not available */}
      {d.status !== 'AVAILABLE' && (
        <div className="text-center py-2">
          <span className={`badge text-sm ${statusMeta?.color}`}>
            {d.status === 'CLAIMED' ? '🤝 Claimed' : '📦 Collected'}
          </span>
        </div>
      )}
    </div>
  );
}
