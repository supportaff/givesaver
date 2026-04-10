import Link from 'next/link';
import type { Donation } from '@/lib/data';
import { CATEGORY_META, STATUS_META } from '@/lib/data';

export default function DonationCard({ donation }: { donation: Donation }) {
  const cat    = CATEGORY_META[donation.category];
  const status = STATUS_META[donation.status];

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

      {/* Meta grid */}
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

      {/* Footer */}
      <div className="border-t border-gray-50 pt-3 flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-400">{donation.address}, {donation.city}</p>
          <p className="text-xs mt-0.5">
            <span className="text-gray-500">By </span>
            <span className="font-medium text-gray-700">{donation.donorName}</span>
            <span className="text-gray-400"> · {donation.postedAgo}</span>
          </p>
        </div>
      </div>

      {donation.status === 'AVAILABLE' && (
        <Link
          href={`/donate?interest=${donation.id}`}
          className="btn-primary w-full text-sm text-center py-2.5 mt-1"
        >
          ✋ Express Interest
        </Link>
      )}
    </div>
  );
}
