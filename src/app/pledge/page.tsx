'use client';
import { useState } from 'react';
import Link from 'next/link';

const pledgeLines = [
  'I am receiving this donation for personal use or to distribute to individuals genuinely in need.',
  'I will NOT resell, trade, or use these donated items for any commercial or financial gain.',
  'I understand that misuse is a violation of GiveSaver\'s Terms and may result in legal action.',
  'I confirm that I represent a legitimate need — personal, community, or organisational.',
  'I agree to provide proof of distribution if requested by GiveSaver within 30 days.',
];

export default function PledgePage() {
  const [checked, setChecked] = useState<boolean[]>(pledgeLines.map(() => false));
  const [done, setDone] = useState(false);
  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => idx === i ? !v : v));

  if (done) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-5">🤍</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Pledge Accepted</h2>
        <p className="text-gray-500 leading-relaxed mb-8">
          Thank you for your commitment. You may now browse and claim donations
          on GiveSaver. We trust you to honour this pledge.
        </p>
        <Link href="/browse" className="btn-primary">Browse Donations →</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-10 text-center">
          <div className="text-4xl mb-3">📜</div>
          <h1 className="text-4xl font-bold text-gray-800">Recipient Pledge</h1>
          <p className="text-gray-500 mt-2">Before claiming a donation, please read and accept the following</p>
        </div>
      </div>

      <div className="section-wrapper py-10">
        <div className="max-w-xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-3 items-start">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Important:</strong> This pledge is a moral and legal commitment.
              GiveSaver exists for genuine giving — not for commercial gain.
              Reselling donated items is a violation of our terms and may attract legal action.
            </p>
          </div>

          <div className="card space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">I hereby solemnly pledge that:</h2>
            {pledgeLines.map((line, i) => (
              <label key={i} className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                checked[i] ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => toggle(i)}
                  className="mt-0.5 w-4 h-4 accent-green-600 shrink-0"
                />
                <span className="text-sm text-gray-700 leading-relaxed">{line}</span>
              </label>
            ))}

            <button
              disabled={!allChecked}
              onClick={() => setDone(true)}
              className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {allChecked ? '🤍 I Accept This Pledge' : `Accept all ${checked.filter(Boolean).length}/${pledgeLines.length} to continue`}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            By accepting, you agree to our{' '}
            <Link href="/terms" className="underline">Terms &amp; Conditions</Link> and{' '}
            <Link href="/safety" className="underline">Trust &amp; Safety policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
