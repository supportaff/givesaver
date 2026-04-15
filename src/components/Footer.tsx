import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="section-wrapper py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">♻️</span>
              <span className="font-extrabold text-white text-lg">DontWaste</span>
            </div>
            <p className="text-sm leading-relaxed">
              Doorstep scrap collection in Chennai. We pick up your scrap and pay you fair market rates.
            </p>
            <a href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20schedule%20a%20scrap%20pickup"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20b958] text-white font-semibold text-sm transition-colors">
              📲 Chat on WhatsApp
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['/schedule',      'Schedule Pickup'],
                ['/rates',         'Scrap Rates'],
                ['/how-it-works',  'How It Works'],
                ['/contact',       'Contact Us'],
              ].map(([href, label]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* We collect */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">We Collect</h4>
            <ul className="space-y-2 text-sm">
              {['Newspapers & Cardboard', 'Plastic Bottles & Cans', 'Iron & Steel', 'Copper & Aluminium', 'E-Waste & Appliances'].map((i) => (
                <li key={i} className="flex items-center gap-1.5">• {i}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📍 Chennai, Tamil Nadu</li>
              <li>📱 <a href="tel:+919999999999" className="hover:text-white">+91 99999 99999</a></li>
              <li>📧 <a href="mailto:hello@dontwaste.in" className="hover:text-white">hello@dontwaste.in</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} DontWaste. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
