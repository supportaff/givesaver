import Link from 'next/link';

export default function SafetyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 text-white">
        <div className="section-wrapper py-16 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-5xl font-bold mb-4">Trust &amp; Safety</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            GiveSaver is built for genuine need. Every item donated here must reach
            someone who truly needs it — not a marketplace.
          </p>
        </div>
      </div>

      <div className="section-wrapper py-14 space-y-10 max-w-3xl mx-auto">

        {/* Core Warning */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 flex gap-4 items-start">
          <span className="text-4xl shrink-0">⛔</span>
          <div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Zero Tolerance: Commercial Resale</h2>
            <p className="text-red-700 leading-relaxed">
              Donating or receiving items through GiveSaver for the purpose of resale,
              profit, or commercial gain is <strong>strictly prohibited</strong> and is a
              violation of our Terms &amp; Conditions. Strict action will be taken against
              any individual or organisation found doing this, including permanent ban and
              legal referral.
            </p>
          </div>
        </div>

        {/* Who Can Receive */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span>✅</span> Who Can Receive Donations
          </h2>
          <p className="text-gray-600 mb-5 leading-relaxed">
            Books and clothes donations are for individuals and families in genuine need.
            Priority is given to verified NGOs, registered welfare organisations, and
            community volunteers with an established track record.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '🤝', label: 'Registered NGOs',        desc: 'Verified non-profit organisations with active operations' },
              { icon: '🙋', label: 'Community Volunteers',   desc: 'Individuals vouched for by a recognised welfare body' },
              { icon: '🏫', label: 'Schools & Institutions', desc: 'Government or recognised schools for underprivileged children' },
              { icon: '🏠', label: 'Shelters & Homes',       desc: 'Old-age homes, orphanages, women\'s shelters, refugee centres' },
              { icon: '👨‍👩‍👧', label: 'Families in Need',     desc: 'Individuals/families verified by a local welfare contact' },
            ].map((r) => (
              <div key={r.label} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{r.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules for Recipients */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span>📜</span> Recipient Rules
          </h2>
          <div className="space-y-3">
            {[
              { rule: 'Items must be used personally or distributed to those in need — never resold.', severity: 'critical' },
              { rule: 'Books must be used for reading, learning, or educational purposes only.', severity: 'normal' },
              { rule: 'Clothes must be worn or distributed to individuals, not stocked for commercial trade.', severity: 'normal' },
              { rule: 'You must not claim more than you can distribute or use within a reasonable time.', severity: 'normal' },
              { rule: 'Recipients must be contactable by GiveSaver for follow-up verification.', severity: 'normal' },
              { rule: 'Any misuse discovered will result in immediate account ban and legal action.', severity: 'critical' },
            ].map((item) => (
              <div
                key={item.rule}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                  item.severity === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <span className={`font-bold text-lg shrink-0 ${item.severity === 'critical' ? 'text-red-500' : 'text-green-500'}`}>
                  {item.severity === 'critical' ? '⚠️' : '✓'}
                </span>
                <p className={`text-sm leading-relaxed ${
                  item.severity === 'critical' ? 'text-red-700 font-medium' : 'text-gray-600'
                }`}>
                  {item.rule}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Process */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span>🔍</span> How We Verify Trust
          </h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'NGO Registration Check',     desc: 'All NGOs must provide their registration number (NGO Darpan / 12A / 80G) before claiming large-volume donations.' },
              { step: '02', title: 'Volunteer Vouching System',  desc: 'Individual volunteers must be vouched for by a registered NGO or a community leader known to GiveSaver.' },
              { step: '03', title: 'Claim Limits',               desc: 'Unverified users can claim a maximum of 1 donation at a time. Verified NGOs have higher limits.' },
              { step: '04', title: 'Follow-up Reports',          desc: 'GiveSaver may request a photo or short update confirming items reached the intended beneficiaries.' },
              { step: '05', title: 'Community Reporting',        desc: 'Any user can report suspicious activity. All reports are reviewed within 24 hours.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{s.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consequences */}
        <div className="bg-gray-900 text-white rounded-2xl p-7">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⚖️</span> Consequences of Misuse
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🚫', label: 'Immediate Ban',    desc: 'Account and phone number permanently blocked from the platform' },
              { icon: '📢', label: 'Public Reporting',  desc: 'Misuse cases may be reported to partner NGOs and community networks' },
              { icon: '⚖️', label: 'Legal Action',     desc: 'Commercial resale of donated goods may attract civil and criminal liability under Indian law' },
            ].map((c) => (
              <div key={c.label} className="bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{c.icon}</div>
                <p className="font-bold text-white text-sm">{c.label}</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report Box */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🚨</div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">Report Suspicious Activity</h2>
          <p className="text-amber-700 text-sm mb-5 leading-relaxed">
            If you suspect someone is reselling donated items or misusing the platform,
            please report it immediately. Every report is confidential and reviewed within 24 hours.
          </p>
          <a
            href="mailto:report@givesaver.in?subject=Misuse Report"
            className="btn-primary bg-amber-600 hover:bg-amber-700"
          >
            📧 Report Misuse →
          </a>
        </div>

        {/* Pledge CTA */}
        <div className="bg-green-700 text-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🤍</div>
          <h2 className="text-2xl font-bold mb-3">This Platform is Built on Trust</h2>
          <p className="text-green-100 mb-6 leading-relaxed max-w-xl mx-auto">
            Every donation here is an act of kindness. Every recipient is someone who
            truly needs it. Together we keep this community honest, safe, and full of
            dignity. Thank you for being part of GiveSaver.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/donate" className="bg-white text-green-700 font-bold py-3 px-8 rounded-xl hover:bg-green-50 transition-colors">
              Donate Now
            </Link>
            <Link href="/terms" className="border-2 border-white/60 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition-colors">
              Read Our Terms
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
