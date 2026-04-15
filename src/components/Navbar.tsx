'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',             label: 'Home' },
  { href: '/rates',        label: 'Scrap Rates' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact',      label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="section-wrapper h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">♻️</span>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">DontWaste</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                path === l.href
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20schedule%20a%20scrap%20pickup"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#25D366] hover:bg-[#20b958] text-white transition-colors shadow-sm">
            📲 WhatsApp Us
          </a>
          <Link href="/schedule" className="btn-primary">
            Schedule Pickup
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                path === l.href ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <a href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20schedule%20a%20scrap%20pickup"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#25D366] text-white">
              📲 WhatsApp Us
            </a>
            <Link href="/schedule" onClick={() => setOpen(false)} className="btn-primary w-full justify-center py-3">
              Schedule Pickup
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
