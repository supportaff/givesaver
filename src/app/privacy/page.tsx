import Link from 'next/link';

const sections = [
  {
    title: '1. About This Policy',
    body: 'This Privacy Policy explains how DontWaste (\"we\", \"us\", \"our\") collects, uses, and protects information provided by users of our platform. By using DontWaste, you agree to this policy.',
  },
  {
    title: '2. Information We Collect',
    list: [
      'Donor name and contact number (used only to coordinate donation pickup).',
      'City and locality (displayed publicly so receivers can find nearby donations).',
      'Donation details: title, category, quantity, description, and photo.',
      'Recipient name and contact number (shared only with the relevant donor after a claim).',
      'IP address and browser info (collected automatically for abuse prevention only).',
    ],
  },
  {
    title: '3. How We Use Your Information',
    list: [
      'To display your donation listing to potential recipients.',
      'To share contact details between donor and recipient after a successful claim.',
      'To moderate the platform and prevent misuse.',
      'To improve platform features and user experience.',
      'We do NOT use your data for advertising or sell it to third parties.',
    ],
  },
  {
    title: '4. Data Sharing',
    body: 'We do not sell your personal data. Contact information is shared only between the specific donor and recipient involved in a claim, and only for pickup coordination. We do not share your data with any commercial entity.',
  },
  {
    title: '5. Data Retention',
    body: 'Donation listings are retained for record-keeping and transparency. You may request deletion of your personal data at any time by contacting us. Deleted listings will be removed from public view within 48 hours.',
  },
  {
    title: '6. Your Rights',
    list: [
      'Right to access: request a copy of data we hold about you.',
      'Right to correction: request we fix inaccurate data.',
      'Right to deletion: request your personal data be deleted.',
      'Right to object: object to how your data is used.',
      'To exercise any of these rights, contact privacy@dontwaste.in.',
    ],
  },
  {
    title: '7. Cookies & Tracking',
    body: 'DontWaste uses only essential cookies required for admin session management. We do not use any advertising, analytics, or third-party tracking cookies. No user behaviour is sold or shared with advertisers.',
  },
  {
    title: '8. Children\'s Privacy',
    body: 'DontWaste is not intended for use by persons under the age of 18 without parental supervision. We do not knowingly collect data from minors.',
  },
  {
    title: '9. Security',
    body: 'We take reasonable measures to protect your data. However, no internet platform can guarantee absolute security. Please do not share sensitive financial or government ID information on this platform.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date. Continued use of the platform constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Governing Law',
    body: 'This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔐</span>
            <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Last updated: April 2026 &nbsp;·&nbsp; DontWaste</p>
        </div>
      </div>

      <div className="section-wrapper py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="card">
              <h2 className="font-bold text-gray-800 mb-2">{s.title}</h2>
              {s.body && <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>}
              {s.list && (
                <ul className="space-y-1.5 mt-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold shrink-0">✓</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="card bg-gray-800 text-white">
            <h2 className="font-bold mb-2">Privacy Contact</h2>
            <p className="text-gray-300 text-sm">
              Email{' '}
              <a href="mailto:privacy@dontwaste.in" className="text-green-400 underline">privacy@dontwaste.in</a>{' '}
              for any privacy-related requests.
            </p>
          </div>

          <div className="text-xs text-gray-400 text-center space-x-4 pt-2">
            <Link href="/disclaimer" className="hover:text-gray-700 underline">Disclaimer</Link>
            <Link href="/terms" className="hover:text-gray-700 underline">Terms &amp; Conditions</Link>
            <Link href="/safety" className="hover:text-gray-700 underline">Safety Guidelines</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
