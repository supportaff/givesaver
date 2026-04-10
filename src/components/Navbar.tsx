'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/browse',        label: 'Browse' },
  { href: '/donate',        label: 'Donate' },
  { href: '/register-ngo',  label: '🤝 Register NGO', highlight: false },
  { href: '/how-it-works',  label: 'How It Works' },
  { href: '/safety',        label: '🛡️ Safety', highlight: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="section-wrapper h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <span className="text-2xl">🌱</span>
          <span>GiveSaver</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'text-green-700 bg-green-50'
                  : l.highlight
                  ? 'text-red-600 hover:bg-red-50 font-semibold'
                  : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/donate" className="btn-primary text-sm px-4 py-2">+ Post Donation</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Toggle menu">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium mt-1 ${
                pathname === l.href ? 'text-green-700 bg-green-50' :
                l.highlight ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {l.label}
            </Link>
          ))}
          <Link href="/donate" onClick={() => setOpen(false)} className="btn-primary w-full mt-3 text-sm text-center block">+ Post Donation</Link>
        </div>
      )}
    </header>
  );
}
