import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="text-gray-500 mt-1">We’re available Monday to Saturday, 8 AM – 6 PM.</p>
        </div>
      </div>

      <div className="section-wrapper py-10">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {[
            { emoji: '📲', label: 'WhatsApp', value: '+91 99999 99999', href: 'https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20schedule%20a%20scrap%20pickup', cta: 'Chat Now' },
            { emoji: '📞', label: 'Phone', value: '+91 99999 99999', href: 'tel:+919999999999', cta: 'Call Now' },
            { emoji: '📧', label: 'Email', value: 'hello@dontwaste.in', href: 'mailto:hello@dontwaste.in', cta: 'Send Mail' },
            { emoji: '📍', label: 'Location', value: 'Chennai, Tamil Nadu', href: 'https://maps.google.com/?q=Chennai', cta: 'View Map' },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-3xl mb-3">{c.emoji}</div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{c.label}</p>
              <p className="font-bold text-gray-800 mb-3">{c.value}</p>
              <a href={c.href} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-xs px-4 py-2">{c.cta}</a>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-green-700 rounded-2xl px-6 py-8 text-white text-center">
          <h3 className="text-xl font-extrabold mb-2">Fastest way to reach us</h3>
          <p className="text-green-100 text-sm mb-5">Send us a WhatsApp message and we’ll respond within 15 minutes during business hours.</p>
          <a href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20schedule%20a%20scrap%20pickup"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-2xl text-sm shadow transition-all">
            📲 Open WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
