export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-12">
          <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: April 2026</p>
        </div>
      </div>
      <div className="section-wrapper py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { title: 'About This Policy',    body: 'GiveSaver currently operates as a static demonstration platform. This policy describes how a live version would handle your data.' },
            { title: 'Information Collected', body: 'In a live version, we would collect your name, contact number, city, and donation details solely to facilitate donation matching between donors and recipients.' },
            { title: 'How We Use It',         body: '', list: ['To display your donation listing to potential recipients', 'To coordinate pickup communication between donors and recipients', 'To improve platform experience and prevent abuse', 'We do not use your data for advertising purposes'] },
            { title: 'Data Sharing',          body: 'We do not sell your personal data. Contact information is shared only with verified NGOs or volunteers who express interest in your specific donation, and only for coordination purposes.' },
            { title: 'Data Retention',        body: 'Donation listings are retained for record-keeping. You may request deletion of your personal data at any time.' },
            { title: 'Your Rights',           body: 'You have the right to access, correct, or delete your data. Contact privacy@givesaver.in to exercise these rights.' },
            { title: 'Cookies',              body: 'This static demo does not use cookies or tracking scripts. A live version would use essential cookies only.' },
          ].map((s) => (
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
            <p className="text-gray-300 text-sm">Email <a href="mailto:privacy@givesaver.in" className="text-green-400 underline">privacy@givesaver.in</a> for any privacy-related requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
