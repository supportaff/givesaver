import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="section-wrapper py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌱</span>
              <span className="text-white font-extrabold text-lg">DontWaste</span>
            </div>
            <p className="text-green-400 text-xs font-medium mb-3 tracking-wide">Don’t let good go to waste.</p>
            <p className="text-sm leading-relaxed">
              A free, non-commercial platform connecting surplus donors
              with people who need it most. No ads. No fees. Just good.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/browse',     label: 'Browse Donations' },
                { href: '/donate',     label: 'Post a Donation' },
                { href: '/ngos',       label: 'NGO Directory' },
                { href: '/about',      label: 'About DontWaste' },
                { href: '/disclaimer', label: 'Disclaimer' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Legal &amp; Safety</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms"      className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy"    className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/safety"     className="hover:text-white transition-colors">Safety Guidelines</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} DontWaste — Made with ❤️ for Tamil Nadu</p>
          <p className="text-gray-600">Not affiliated with any government body or commercial organisation.</p>
        </div>
      </div>
    </footer>
  );
}
