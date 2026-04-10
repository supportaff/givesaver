import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="section-wrapper py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <span className="text-2xl">🌱</span> GiveSaver
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Connecting donors with NGOs to reduce waste and support communities across India.
          </p>
          <div className="flex gap-3 mt-5">
            {['Food 🍱', 'Clothes 👕', 'Books 📚'].map((t) => (
              <span key={t} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: '/browse',       label: 'Browse Donations' },
              { href: '/donate',       label: 'Post a Donation' },
              { href: '/how-it-works', label: 'How It Works' },
              { href: '/about',        label: 'About Us' },
            ].map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: '/browse?category=FOOD',    label: '🍱 Food Donations' },
              { href: '/browse?category=CLOTHES', label: '👕 Clothes Donations' },
              { href: '/browse?category=BOOKS',   label: '📚 Books Donations' },
            ].map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: '/terms',      label: 'Terms & Conditions' },
              { href: '/disclaimer', label: 'Disclaimer' },
              { href: '/privacy',    label: 'Privacy Policy' },
            ].map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
            ))}
          </ul>
          <div className="mt-6 text-sm">
            <p className="text-gray-500">Support</p>
            <a href="mailto:support@givesaver.in" className="text-green-400 hover:text-green-300 transition-colors">
              support@givesaver.in
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="section-wrapper py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} GiveSaver. Built with ❤️ to reduce waste and help communities.</p>
          <p>Made in Chennai, India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
