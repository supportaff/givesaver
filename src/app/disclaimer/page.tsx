import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-amber-600 to-orange-500 text-white">
        <div className="section-wrapper py-16 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold mb-3">Disclaimer</h1>
          <p className="text-amber-100 max-w-xl mx-auto">
            Please read this carefully before using GiveSaver.
          </p>
        </div>
      </div>

      <div className="section-wrapper py-12 max-w-3xl">
        <div className="space-y-8">

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-3">📋 What GiveSaver Is</h2>
            <p className="text-gray-600 leading-relaxed">
              GiveSaver is a <strong>free, non-commercial coordination platform</strong> that connects
              people who have surplus food, clothes, or books with people who need them. We do not
              charge any fee, run any advertising, or profit from any transaction on this platform.
            </p>
          </div>

          <div className="card border-l-4 border-red-400">
            <h2 className="text-xl font-bold text-gray-800 mb-3">🚫 What GiveSaver Does NOT Do</h2>
            <ul className="space-y-2 text-gray-600 text-sm">
              {[
                'Verify, inspect, or guarantee the quality, safety, or condition of any donated item.',
                'Arrange, manage, or be responsible for pickup or delivery of any donation.',
                'Verify the identity, credentials, or intentions of any donor or receiver.',
                'Mediate or resolve disputes between donors and receivers.',
                'Take any responsibility for items that are expired, unsafe, damaged, or misrepresented.',
                'Guarantee that a listed item is still available at the time of claiming.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400 shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card border-l-4 border-green-400">
            <h2 className="text-xl font-bold text-gray-800 mb-3">✅ Donor Responsibilities</h2>
            <ul className="space-y-2 text-gray-600 text-sm">
              {[
                'Only donate items that are safe, clean, and fit for use or consumption.',
                'Ensure food items are within expiry date and properly stored.',
                'Accurately describe the item, quantity, and pickup location.',
                'Coordinate pickup directly with the receiver using contact details shown after claim.',
                'Update the donation status (Claimed / Collected) once the item is handed over.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-green-500 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card border-l-4 border-blue-400">
            <h2 className="text-xl font-bold text-gray-800 mb-3">👥 Receiver Responsibilities</h2>
            <ul className="space-y-2 text-gray-600 text-sm">
              {[
                'Inspect all items before accepting them.',
                'Meet donors in safe, public locations — never share your home address.',
                'Do not claim donations you do not genuinely need.',
                'Contact the donor directly and be respectful of their time.',
                'GiveSaver is not liable for any harm arising from items received.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-blue-500 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-amber-50 border-amber-200">
            <h2 className="text-xl font-bold text-gray-800 mb-3">🔒 Safety Tips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '📍', tip: 'Meet in a public place like a park, mall entrance, or temple.' },
                { icon: '📱', tip: 'Save the donor\'s number before meeting.' },
                { icon: '👁️',  tip: 'Inspect items on the spot before taking them.' },
                { icon: '⏰', tip: 'Arrange pickup at a reasonable time — daytime is safest.' },
                { icon: '🧴', tip: 'For food: check packaging, smell, and expiry date.' },
                { icon: '🚨', tip: 'Report misuse to us at support@givesaver.in.' },
              ].map((s) => (
                <div key={s.tip} className="flex gap-2 text-sm text-gray-700">
                  <span className="shrink-0">{s.icon}</span>
                  <span>{s.tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-3">⚖️ Limitation of Liability</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              GiveSaver, its creators, volunteers, and contributors are <strong>not liable</strong> for
              any loss, injury, illness, or damage arising from the use of this platform, including
              but not limited to items received through donations, interactions between users, or
              failure of any party to fulfill their commitments. Use of this platform constitutes
              acceptance of these terms.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-3">📧 Contact Us</h2>
            <p className="text-gray-600 text-sm">
              For concerns, misuse reports, or questions: <strong>support@givesaver.in</strong>
            </p>
          </div>

          <div className="text-center pt-4">
            <Link href="/" className="btn-secondary mr-3">Back to Home</Link>
            <Link href="/donate" className="btn-primary">Post a Donation</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
