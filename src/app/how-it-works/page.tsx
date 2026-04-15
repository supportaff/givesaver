import Link from 'next/link';

const STEPS = [
  {
    num: '01', emoji: '📅',
    title: 'Schedule Your Pickup',
    desc: 'Fill our simple online form with your name, address, scrap type, and preferred time slot. No registration or login required. Takes less than a minute.',
  },
  {
    num: '02', emoji: '🚚',
    title: 'We Arrive at Your Door',
    desc: 'Our trained agent arrives at your doorstep within the booked time slot. We carry all necessary equipment including calibrated digital weighing scales.',
  },
  {
    num: '03', emoji: '⚖️',
    title: 'Transparent Weighing',
    desc: 'All your scrap items are sorted and weighed on our certified digital scale in front of you. No hidden deductions. What you see on the screen is what you get paid for.',
  },
  {
    num: '04', emoji: '💰',
    title: 'Instant Payment',
    desc: 'Receive your payment immediately — cash or UPI, your choice. No cheques, no delays, no follow-up needed.',
  },
];

const FAQS = [
  { q: 'Is there a minimum quantity for pickup?', a: 'No minimum. We collect even if you have just a few kilograms of paper or a single broken appliance.' },
  { q: 'What payment methods do you accept?', a: 'We pay on the spot via cash or UPI (GPay, PhonePe, Paytm). Your choice.' },
  { q: 'How accurate are your weighing scales?', a: 'We use certified digital scales that are regularly calibrated. All weighing is done transparently in front of you.' },
  { q: 'Do you collect from apartments and high-rises?', a: 'Yes. We collect from individual homes, apartments, and gated communities across Chennai. Mention floor/building details in the address.' },
  { q: 'What items do you NOT collect?', a: 'We do not collect hazardous materials like batteries with acid leaks, chemicals, or medical waste. For everything else, just reach out.' },
  { q: 'How quickly will you confirm my booking?', a: 'Within 15 minutes of submitting the form, you will receive a WhatsApp confirmation with your agent details and slot time.' },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">How It Works</h1>
          <p className="text-gray-500 mt-1">Selling scrap has never been simpler. Here’s the exact process.</p>
        </div>
      </div>

      <div className="section-wrapper py-12">

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {STEPS.map((s) => (
            <div key={s.num} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 relative overflow-hidden">
              <div className="text-7xl font-extrabold text-green-50 absolute top-3 right-5 select-none leading-none">{s.num}</div>
              <div className="text-4xl mb-4">{s.emoji}</div>
              <h2 className="text-xl font-extrabold text-gray-800 mb-2">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
                <p className="font-bold text-gray-800 mb-1">{f.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-green-700 rounded-2xl px-6 py-10 text-white text-center">
          <h3 className="text-2xl font-extrabold mb-2">Ready to get started?</h3>
          <p className="text-green-100 mb-6">Book your pickup in under 60 seconds. No login required.</p>
          <Link href="/schedule"
            className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-10 py-4 rounded-2xl text-base shadow transition-all">
            📅 Schedule Pickup Now
          </Link>
        </div>
      </div>
    </div>
  );
}
