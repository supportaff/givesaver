'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/browse',       label: 'Browse' },
  { href: '/donate',       label: 'Donate' },
  { href: '/my-donations', label: 'My Donations' },
  { href: '/ngos',         label: 'NGO Directory' },
  { href: '/disclaimer',   label: 'Disclaimer' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="section-wrapper flex items-center justify-between h-14 md:h-16">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-lg md:text-xl text-gray-800 tracking-tight">GiveSaver</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              {l.label}
            </Link>
          ))}
          <Link href="/donate" className="ml-2 btn-primary py-2 px-4">+ Post Donation</Link>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/donate"
            className="btn-primary py-2 px-3 text-xs"
            onClick={() => setOpen(false)}>
            + Donate
          </Link>
          <button onClick={() => setOpen((p) => !p)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200"
            aria-label="Menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`px-3 py-3 rounded-xl text-sm font-medium active:bg-gray-100 ${
                pathname === l.href ? 'bg-green-50 text-green-700' : 'text-gray-700'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
