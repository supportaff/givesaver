const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using GiveSaver ("Platform"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Platform.' },
  { title: '2. Nature of the Platform', body: 'GiveSaver is a discovery and coordination platform that facilitates connections between donors and recipients of surplus goods. GiveSaver does not take possession of, own, transport, inspect, or guarantee any donated items. All arrangements are directly between donors and recipients.' },
  { title: '3. Donor Responsibilities', body: '', list: ['Ensure all donated items are safe, hygienic, and fit for their intended use.', 'Food must be fresh, properly stored, and within a safe consumption window.', 'Clothing must be clean, washed, and in wearable condition.', 'Books must be complete and in usable condition.', 'Provide accurate descriptions, quantities, expiry details, and pickup information.', 'Be available to coordinate pickup with the recipient.', 'Donors are solely responsible for any harm caused by unsafe or misrepresented donations.'] },
  { title: '4. Recipient Responsibilities', body: '', list: ['Verify item condition before accepting any donation.', 'Do not claim donations you cannot collect within a reasonable timeframe.', 'Coordinate pickup respectfully and punctually with donors.', 'NGOs must ensure items are used for their stated charitable purpose.'] },
  { title: '5. Prohibited Conduct', body: '', list: ['Posting fake, misleading, or fraudulent donation listings.', 'Donating expired, unsafe, contaminated, or prohibited items.', 'Using the platform to commercially resell donated goods.', 'Harassing, threatening, or impersonating other users.', 'Attempting to use the platform for personal financial gain.'] },
  { title: '6. Limitation of Liability', body: 'GiveSaver and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Platform, including illness from donated food, injury from donated goods, or disputes between donors and recipients.' },
  { title: '7. No Verification Guarantee', body: 'GiveSaver does not verify the identity, credentials, or trustworthiness of all users. Users interact at their own risk. We recommend meeting in accessible, public locations for pickups.' },
  { title: '8. Intellectual Property', body: 'All content, branding, and design on GiveSaver is proprietary and may not be reproduced without explicit written permission.' },
  { title: '9. Modifications', body: 'GiveSaver reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms.' },
  { title: '10. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.' },
];

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-12">
          <h1 className="text-4xl font-bold text-gray-800">Terms &amp; Conditions</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: April 2026</p>
        </div>
      </div>
      <div className="section-wrapper py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-3">{s.title}</h2>
              {s.body && <p className="text-gray-600 leading-relaxed">{s.body}</p>}
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
            <p className="text-gray-300 text-sm">For questions about these Terms, email <a href="mailto:legal@givesaver.in" className="text-green-400 underline">legal@givesaver.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
