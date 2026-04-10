import Link from 'next/link';

const tips = [
  {
    icon: '📍',
    title: 'Meet in Public',
    points: [
      'Always arrange pickup at a well-lit, public location — park entrance, temple, mall lobby, or busy street.',
      'Never invite strangers to your home or visit a stranger\'s home alone.',
      'Daytime pickups are strongly recommended.',
    ],
  },
  {
    icon: '📱',
    title: 'Verify Before You Go',
    points: [
      'Save the other person\'s contact number before leaving.',
      'Confirm the time, location, and item details over call or message before meeting.',
      'Share your plan with a friend or family member.',
    ],
  },
  {
    icon: '🥩',
    title: 'Food Safety',
    points: [
      'Check the expiry date and packaging before accepting food.',
      'Smell and inspect home-cooked food carefully before consuming.',
      'Do not accept food that looks, smells, or feels off — trust your instincts.',
      'Perishables should be collected and consumed promptly.',
    ],
  },
  {
    icon: '👕',
    title: 'Clothing & Books',
    points: [
      'Inspect clothes for damage, stains, or odour before accepting.',
      'Wash all clothing before use.',
      'Books should be checked for completeness.',
    ],
  },
  {
    icon: '🛡️',
    title: 'Personal Safety',
    points: [
      'Go with a friend or family member if you feel uncertain.',
      'Trust your instincts — if something feels wrong, leave.',
      'Do not share personal financial details with any user.',
      'DontWaste staff will never ask for money or your bank details.',
    ],
  },
  {
    icon: '🚨',
    title: 'Report Misuse',
    points: [
      'Report suspicious listings or behaviour to support@dontwaste.in.',
      'If you feel threatened or unsafe, contact local police immediately.',
      'Misuse of this platform for commercial resale or fraud is a violation of our Terms.',
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white">
        <div className="section-wrapper py-16 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-4xl font-bold mb-3">Safety Guidelines</h1>
          <p className="text-green-100 max-w-xl mx-auto">
            DontWaste connects real people. Follow these guidelines to stay safe during every exchange.
          </p>
        </div>
      </div>

      <div className="section-wrapper py-12 max-w-3xl">
        <div className="space-y-8">
          {tips.map((t) => (
            <div key={t.title} className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                <span className="mr-2">{t.icon}</span>{t.title}
              </h2>
              <ul className="space-y-2">
                {t.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="card bg-red-50 border border-red-200">
            <h2 className="font-bold text-red-700 mb-2">🚨 Emergency</h2>
            <p className="text-sm text-red-600">
              If you are in immediate danger, call <strong>112</strong> (India Emergency) immediately.
              Report platform misuse to <strong>support@dontwaste.in</strong>.
            </p>
          </div>

          <div className="text-xs text-gray-400 text-center space-x-4 pt-2">
            <Link href="/disclaimer" className="hover:text-gray-700 underline">Disclaimer</Link>
            <Link href="/terms" className="hover:text-gray-700 underline">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-gray-700 underline">Privacy Policy</Link>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="btn-secondary mr-3">Back to Home</Link>
            <Link href="/donate" className="btn-primary">Post a Donation</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
