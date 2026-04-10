'use client';
import { useState } from 'react';
import type { DonationRow } from '@/lib/supabase/types';
import { CATEGORY_META, STATUS_META } from '@/lib/data';

function buildWhatsAppURL(d: DonationRow): string {
  const phone = d.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
  const e164  = phone.startsWith('91') ? phone : `91${phone}`;
  const expiry = d.expires_at ? `\n⏰ Expiry: ${d.expires_at}` : '';
  const msg = [
    `👋 Hi ${d.donor_name},`,
    `I found your listing on *GiveSaver* and would like to collect: *${d.title}*`,
    `• Qty: ${d.quantity} • Location: ${d.address}, ${d.city}${expiry}`,
    `Can we arrange a pickup? Thank you 🙏`,
  ].join('\n');
  return `https://wa.me/${e164}?text=${encodeURIComponent(msg)}`;
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
  const waURL      = buildWhatsAppURL(d);

  const [showClaim, setShowClaim] = useState(false);
  const [form,      setForm]      = useState({ name: '', phone: '', message: '' });
  const [claiming,  setClaiming]  = useState(false);
  const [claimed,   setClaimed]   = useState<{ donorPhone: string; donorName: string } | null>(null);
  const [claimErr,  setClaimErr]  = useState('');
  const [agreed,    setAgreed]    = useState(false);

  async function submitClaim() {
    if (!form.name || !form.phone) { setClaimErr('Name and phone are required'); return; }
    if (!agreed) { setClaimErr('Please accept the disclaimer to proceed'); return; }
    setClaiming(true); setClaimErr('');
    try {
      const res  = await fetch('/api/claims/init', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ donationId: d.id, receiverName: form.name, receiverPhone: form.phone, message: form.message }),
      });
      const data = await res.json() as { donorPhone?: string; donorName?: string; error?: string };
      if (!res.ok) { setClaimErr(data.error ?? 'Failed to submit claim'); return; }
      setClaimed({ donorPhone: data.donorPhone ?? '', donorName: data.donorName ?? '' });
    } catch { setClaimErr('Something went wrong. Please try again.'); }
    finally   { setClaiming(false); }
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200 flex flex-col gap-3 group">

      {d.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.photo_url} alt={d.title} className="w-full h-40 object-cover rounded-xl -mt-1" />
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

      {d.description && <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{d.description}</p>}

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300">📦</span>
          <span className="text-gray-500 text-xs">Qty:</span>
          <span className="font-medium text-gray-700 text-xs">{d.quantity}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300">📍</span>
          <span className="text-gray-500 text-xs">City:</span>
          <span className="font-medium text-gray-700 text-xs">{d.city}</span>
        </div>
      </div>

      {d.expires_at && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
          <span>⏰</span> {d.expires_at}
        </div>
      )}

      {(d.category === 'CLOTHES' || d.category === 'BOOKS') && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          <span className="shrink-0">⛔</span>
          <span>For personal/charity use only. Resale is strictly prohibited.</span>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-50 pt-3">
        <p className="text-xs text-gray-400 truncate">{d.address}, {d.city}</p>
        <p className="text-xs mt-0.5">
          <span className="text-gray-500">By </span>
          <span className="font-medium text-gray-700">{d.donor_name}</span>
          <span className="text-gray-400"> · {timeAgo(d.created_at)}</span>
        </p>
      </div>

      {/* CTAs */}
      {d.status === 'AVAILABLE' && (
        <div className="flex flex-col gap-2 mt-1">

          {/* WhatsApp CTA */}
          {!showClaim && !claimed && (
            <>
              <a href={waURL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-[#25D366] hover:bg-[#20b958] text-white transition-all shadow-sm active:scale-95">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Donor
              </a>
              <button onClick={() => setShowClaim(true)}
                className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-green-500 text-green-700 hover:bg-green-50 transition-all active:scale-95">
                🤝 Register My Claim
              </button>
            </>
          )}

          {/* Simple Claim Form */}
          {showClaim && !claimed && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm font-bold text-gray-800">🤝 Claim This Donation</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter your details below. The donor&apos;s contact number will be shared with you so you can arrange pickup directly.
              </p>
              {claimErr && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{claimErr}</p>}
              <input placeholder="Your Full Name *" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-field text-sm" />
              <input placeholder="Your Phone / WhatsApp *" type="tel" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field text-sm" />
              <textarea placeholder="Message to donor (optional) — e.g. I can pick up by 5 PM" value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="input-field text-sm resize-none" rows={2} />

              {/* Mini disclaimer */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I understand GiveSaver is not responsible for item quality. I will inspect items before accepting.
                </span>
              </label>

              <div className="flex gap-2">
                <button onClick={() => { setShowClaim(false); setClaimErr(''); }}
                  className="btn-secondary text-sm flex-1 py-2.5">Cancel</button>
                <button onClick={submitClaim} disabled={claiming || !agreed}
                  className="btn-primary text-sm flex-1 py-2.5 disabled:opacity-40">
                  {claiming ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </div>
          )}

          {/* Claim Success */}
          {claimed && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-bold text-sm mb-2">✅ Claim Registered!</p>
              <div className="bg-white border border-green-100 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">Contact the donor to arrange pickup:</p>
                <p className="font-semibold text-gray-800 text-sm">{claimed.donorName}</p>
                <a href={`tel:${claimed.donorPhone}`}
                  className="text-green-700 font-bold text-sm hover:underline">
                  📞 {claimed.donorPhone}
                </a>
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Meet in a safe, public place. Inspect items before accepting.
              </p>
            </div>
          )}
        </div>
      )}

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
