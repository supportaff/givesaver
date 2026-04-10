import Link from 'next/link';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using DontWaste (\"Platform\"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Platform.',
  },
  {
    title: '2. Nature of the Platform',
    body: 'DontWaste is a free, non-commercial discovery and coordination platform that facilitates connections between donors and recipients of surplus goods. DontWaste does not take possession of, own, transport, inspect, or guarantee any donated items. All arrangements are made directly between donors and recipients.',
  },
  {
    title: '3. Eligibility',
    body: 'You must be at least 18 years of age to use this platform, or use it under the supervision of a parent or guardian. By using DontWaste you confirm that you meet this requirement.',
  },
  {
    title: '4. Donor Responsibilities',
    list: [
      'Ensure all donated items are safe, hygienic, and fit for their intended use.',
      'Food must be fresh, properly stored, and within a safe consumption window.',
      'Clothing must be clean, washed, and in wearable condition.',
      'Books must be complete and in usable condition.',
      'Provide accurate descriptions, quantities, expiry details, and pickup information.',
      'Be available to coordinate pickup with the recipient.',
      'Donors are solely responsible for any harm caused by unsafe or misrepresented donations.',
    ],
  },
  {
    title: '5. Recipient Responsibilities',
    list: [
      'Verify item condition before accepting any donation.',
      'Do not claim donations you cannot collect within a reasonable timeframe.',
      'Coordinate pickup respectfully and punctually with donors.',
      'NGOs must ensure items are used solely for their stated charitable purpose.',
    ],
  },
  {
    title: '6. Prohibited Conduct',
    list: [
      'Posting fake, misleading, or fraudulent donation listings.',
      'Donating expired, unsafe, contaminated, or prohibited items.',
      'Using the platform to commercially resell donated goods.',
      'Harassing, threatening, or impersonating other users.',
      'Attempting to use the platform for personal financial gain.',
      'Scraping, crawling, or reverse-engineering any part of the platform.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    body: 'DontWaste and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Platform, including illness from donated food, injury from donated goods, or disputes between donors and recipients.',
  },
  {
    title: '8. No Verification Guarantee',
    body: 'DontWaste does not verify the identity, credentials, or trustworthiness of all users. Users interact at their own risk. We strongly recommend meeting in accessible, public locations for all pickups.',
  },
  {
    title: '9. Intellectual Property',
    body: 'All content, branding, and design on DontWaste is proprietary and may not be reproduced without explicit written permission.',
  },
  {
    title: '10. Modifications',
    body: 'DontWaste reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.',
  },
];

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📜</span>
            <h1 className="text-4xl font-bold text-gray-800">Terms &amp; Conditions</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Last updated: April 2026 &nbsp;·&nbsp; DontWaste</p>
        </div>
      </div>

      <div className="section-wrapper py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-3">{s.title}</h2>
              {s.body && <p className="text-gray-600 leading-relaxed text-sm">{s.body}</p>}
              {s.list && (
                <ul className="space-y-2 mt-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="card bg-gray-800 text-white">
            <h2 className="font-bold mb-2">Contact</h2>
            <p className="text-gray-300 text-sm">
              For questions about these Terms, email{' '}
              <a href="mailto:legal@dontwaste.in" className="text-green-400 underline">legal@dontwaste.in</a>
            </p>
          </div>

          <div className="text-xs text-gray-400 text-center space-x-4 pt-2">
            <Link href="/disclaimer" className="hover:text-gray-700 underline">Disclaimer</Link>
            <Link href="/privacy" className="hover:text-gray-700 underline">Privacy Policy</Link>
            <Link href="/safety" className="hover:text-gray-700 underline">Safety Guidelines</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
