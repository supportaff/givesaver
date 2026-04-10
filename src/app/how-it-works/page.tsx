import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01', icon: '📦', title: 'Post a Donation',
      desc: 'Any individual, restaurant, business, or institution can post a donation in under 2 minutes. Select your category (Food, Clothes, or Books), fill in the details, and submit.',
      tips: ['Be specific about quantity and condition', 'Add a clear description so NGOs know what to expect', 'Food donations require an expiry time — be accurate', 'Clothes and books have no expiry requirement'],
    },
    {
      step: '02', icon: '🔔', title: 'NGOs & Volunteers Browse',
      desc: 'Registered NGOs and verified volunteers can browse all available donations filtered by category, city, and status. When they find what they need, they express interest with one click.',
      tips: ['NGOs can filter by category, city, and item type', 'First to express interest gets priority', 'Donors are notified when interest is expressed', 'Multiple items can be claimed in one session'],
    },
    {
      step: '03', icon: '🚗', title: 'Pickup & Distribution',
      desc: 'The NGO or volunteer contacts the donor directly to coordinate a pickup time. Once collected, the donation status is updated and items are distributed to shelters, families, or individuals.',
      tips: ['Pickup is coordinated directly between donor and recipient', 'GiveSaver does not arrange or provide transport', 'Status updates keep records transparent', 'Collected items reach those who need them most'],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-14 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">How GiveSaver Works</h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">A simple three-step process to connect donors with those in need.</p>
        </div>
      </div>

      <div className="section-wrapper py-16">
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={s.step} className="card flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center text-4xl">{s.icon}</div>
                <div className="text-xs font-bold text-green-500 mt-3">STEP {s.step}</div>
                {i < steps.length - 1 && <div className="hidden md:block w-0.5 h-12 bg-green-100 mt-3" />}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-5">{s.desc}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {s.tips.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-green-500 font-bold mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/donate" className="btn-primary text-lg px-10 py-4">Start Donating →</Link>
        </div>
      </div>
    </div>
  );
}
