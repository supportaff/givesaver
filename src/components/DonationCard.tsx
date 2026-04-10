import Link from 'next/link';
import type { Donation } from '@/lib/data';
import { CATEGORY_META, STATUS_META } from '@/lib/data';

function buildWhatsAppURL(donation: Donation): string {
  const phone = donation.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
  const e164  = phone.startsWith('91') ? phone : `91${phone}`;
  const expiry = donation.expiresAt ? `\n⏰ Expiry: ${donation.expiresAt}` : '';

  const msg = [
    `👋 Hi ${donation.donorName},`,
    ``,
    `I am contacting you through *GiveSaver* (Chennai) regarding your donation listing.`,
    `I would like to collect the following item on behalf of our NGO / community:`,
    ``,
    `📋 *Donation Details*`,
    `• Item      : ${donation.title}`,
    `• Category  : ${donation.category}`,
    `• Type      : ${donation.itemType}`,
    `• Quantity  : ${donation.quantity}`,
    `• Location  : ${donation.address}, ${donation.city}${expiry}`,
    ``,
    `👤 *Receiver Details*`,
    `• Name        : [Your Full Name]`,
    `• Organisation: [NGO / Trust Name]`,
    `• Designation : [Your Role]`,
    `• Purpose     : [Brief description of who will benefit]`,
    ``,
    `🤝 *Our Commitment*`,
    `We confirm that these items will be distributed FREE OF COST to individuals in genuine need.`,
    `We pledge NOT to resell or commercially use any donated goods.`,
    ``,
    `Could we arrange a pickup at your convenience? Thank you for your generosity! 🙏`,
    ``,
    `――――――――――――――――――――――`,
    `⚠️ *Disclaimer:* This message is sent via *GiveSaver* (givesaver.in), a free community`,
    `donation coordination platform serving Chennai. GiveSaver does not verify the identity`,
    `of all users and is not responsible for the outcome of this transaction. Donors and`,
    `recipients interact at their own discretion. Donated items must not be resold or used`,
    `for commercial gain. Any misuse should be reported to report@givesaver.in.`,
    `――――――――――――――――――――――`,
  ].join('\n');

  return `https://wa.me/${e164}?text=${encodeURIComponent(msg)}`;
}

export default function DonationCard({ donation }: { donation: Donation }) {
  const cat         = CATEGORY_META[donation.category];
  const status      = STATUS_META[donation.status];
  const needsPledge = donation.category === 'CLOTHES' || donation.category === 'BOOKS';
  const waURL       = buildWhatsAppURL(donation);

  return (
    <div className="card hover:shadow-md transition-all duration-200 flex flex-col gap-3 group">

      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-2xl shrink-0 mt-0.5">{cat.emoji}</span>
          <h3 className="font-semibold text-gray-800 leading-snug group-hover:text-green-700 transition-colors">
            {donation.title}
          </h3>
        </div>
        <span className={`badge ${status.color} shrink-0 whitespace-nowrap`}>{status.label}</span>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <span className={`badge ${cat.color}`}>{cat.label}</span>
        <span className="badge bg-gray-100 text-gray-500">{donation.itemType}</span>
        <span className="badge bg-gray-50 text-gray-400">{donation.donorType}</span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{donation.description}</p>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300">📦</span>
          <span className="text-gray-500">Qty:</span>
          <span className="font-medium text-gray-700">{donation.quantity}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300">📍</span>
          <span className="text-gray-500">City:</span>
          <span className="font-medium text-gray-700">{donation.city}</span>
        </div>
      </div>

      {/* Expiry */}
      {donation.expiresAt && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
          <span>⏰</span> {donation.expiresAt}
        </div>
      )}

      {/* Anti-resale warning */}
      {needsPledge && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          <span className="shrink-0">⛔</span>
          <span>For personal/charity use only. Resale is strictly prohibited.</span>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-50 pt-3">
        <p className="text-xs text-gray-400">{donation.address}, {donation.city}</p>
        <p className="text-xs mt-0.5">
          <span className="text-gray-500">By </span>
          <span className="font-medium text-gray-700">{donation.donorName}</span>
          <span className="text-gray-400"> · {donation.postedAgo}</span>
        </p>
      </div>

      {/* CTA Buttons */}
      {donation.status === 'AVAILABLE' && (
        <div className="flex flex-col gap-2 mt-1">
          {/* WhatsApp */}
          <a
            href={waURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm bg-[#25D366] hover:bg-[#20b958] active:bg-[#1a9e4c] text-white transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Message Donor on WhatsApp
          </a>

          {/* Pledge / Express Interest */}
          <Link
            href={needsPledge ? '/pledge' : `/donate?interest=${donation.id}`}
            className="btn-primary w-full text-sm text-center py-2.5"
          >
            {needsPledge ? '🤝 Sign Pledge & Claim' : '✋ Express Interest'}
          </Link>
        </div>
      )}
    </div>
  );
}
