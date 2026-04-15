'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  { emoji: '\uD83D\uDCF0', label: 'Paper & Cardboard',  desc: 'Newspapers, books, boxes' },
  { emoji: '\uD83D\uDED2', label: 'Plastic',             desc: 'Bottles, containers, PVC' },
  { emoji: '\u2699\uFE0F',  label: 'Metal',              desc: 'Iron, steel, copper, brass' },
  { emoji: '\uD83D\uDCBB', label: 'E-Waste',            desc: 'Phones, laptops, wires' },
  { emoji: '\uD83E\uDDF9', label: 'Appliances',         desc: 'Fans, fridges, washing machines' },
  { emoji: '\uD83C\uDF7A', label: 'Glass',              desc: 'Bottles, jars' },
];

const WHY_US = [
  { emoji: '\uD83D\uDCB0', title: 'Fair Market Rates',       desc: 'We pay you competitive prices updated weekly based on live scrap market rates.' },
  { emoji: '\uD83D\uDE9A', title: 'Doorstep Pickup',         desc: 'No carrying, no auto-rickshaw, no hassle. We come to your door at your preferred time.' },
  { emoji: '\u267B\uFE0F',  title: 'Responsible Recycling',  desc: 'All collected scrap goes to certified recycling partners. Zero landfill. Real impact.' },
  { emoji: '\u26A1',  title: 'Same-Day Availability',  desc: 'Book before noon, get a pickup slot the same day in most Chennai areas.' },
  { emoji: '\uD83E\uDD1D', title: 'No Login Required',       desc: 'Just fill a short form. No account, no app, no OTP needed to schedule.' },
  { emoji: '\uD83D\uDCF1', title: 'WhatsApp Confirmation',   desc: 'Get instant pickup confirmation and updates directly on WhatsApp.' },
];

const STEPS = [
  { num: '01', title: 'Schedule a Pickup',    desc: 'Fill the form with your address and preferred time. Takes under 60 seconds.' },
  { num: '02', title: 'We Come to You',       desc: 'Our team arrives at your doorstep at the booked time slot.' },
  { num: '03', title: 'Scrap is Weighed',     desc: 'We weigh all items on-site using calibrated digital scales. Transparent and fair.' },
  { num: '04', title: 'Instant Payment',      desc: 'Get paid immediately by cash or UPI \u2014 no delays, no negotiations.' },
];

interface RateItem { id: string; name: string; category: string; unit: string; price: number; }

const CALC_ITEMS = [
  { key: 'newspaper',  label: 'Newspaper',   unit: 'kg',    category: 'paper',    max: 100, step: 1  },
  { key: 'cardboard',  label: 'Cardboard',   unit: 'kg',    category: 'paper',    max: 100, step: 1  },
  { key: 'plastic',    label: 'Plastic',     unit: 'kg',    category: 'plastic',  max: 50,  step: 1  },
  { key: 'iron',       label: 'Iron/Steel',  unit: 'kg',    category: 'metal',    max: 200, step: 1  },
  { key: 'aluminium',  label: 'Aluminium',   unit: 'kg',    category: 'metal',    max: 50,  step: 0.5},
  { key: 'mobile',     label: 'Mobile Phone',unit: 'piece', category: 'ewaste',   max: 10,  step: 1  },
  { key: 'laptop',     label: 'Laptop',      unit: 'piece', category: 'ewaste',   max: 5,   step: 1  },
];

export default function HomePage() {
  const [rates, setRates] = useState<RateItem[]>([]);
  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(CALC_ITEMS.map(i => [i.key, 0]))
  );

  useEffect(() => {
    fetch('/api/scrap-rates?city=Chennai&active=true')
      .then(r => r.json())
      .then(d => setRates(d.data ?? []))
      .catch(() => {});
  }, []);

  function getRate(item: typeof CALC_ITEMS[0]): number {
    const match = rates.find(r =>
      r.category === item.category &&
      r.unit === item.unit &&
      r.name.toLowerCase().includes(item.label.toLowerCase().split('/')[0].toLowerCase())
    );
    if (match) return match.price;
    // fallback defaults
    const defaults: Record<string, number> = {
      newspaper: 14, cardboard: 8, plastic: 10, iron: 28,
      aluminium: 80, mobile: 200, laptop: 600
    };
    return defaults[item.key] ?? 0;
  }

  const total = CALC_ITEMS.reduce((sum, item) => sum + (qtys[item.key] * getRate(item)), 0);

  return (
    <div className="bg-white">

      {/* \u2500\u2500 HERO \u2500\u2500 */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="section-wrapper py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              \uD83D\uDCCD Now serving Chennai
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
              Turn Your Scrap<br />
              <span className="text-yellow-300">Into Cash.</span><br />
              At Your Doorstep.
            </h1>
            <p className="text-lg md:text-xl text-green-100 leading-relaxed mb-8 max-w-xl">
              We collect paper, plastic, metal, e-waste and appliances from your home and pay you fair scrap rates on the spot. No haggling. No middleman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/schedule"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95">
                \uD83D\uDCC5 Schedule Scrap Pickup
              </Link>
              <Link href="/rates"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 font-semibold px-8 py-4 rounded-2xl text-base transition-all">
                \uD83D\uDCB0 Check Today\u2019s Rates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 TRUST BAR \u2500\u2500 */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="section-wrapper py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-600">
            {[['\u2705', 'No minimum quantity'],['\u2705', 'Same-day slots available'],['\u2705', 'Digital scale on-site'],['\u2705', 'Cash or UPI payment'],['\u2705', 'Serving all Chennai areas']]
              .map(([icon, text]) => (
              <span key={text} className="flex items-center gap-1.5">{icon} {text}</span>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 CATEGORIES \u2500\u2500 */}
      <section className="section-wrapper py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">What We Collect</h2>
          <p className="text-gray-500 mt-2">We accept all common household and office scrap</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all cursor-default">
              <span className="text-4xl mb-3">{c.emoji}</span>
              <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
              <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/rates" className="btn-outline">\uD83D\uDCB5 See Today\u2019s Scrap Rates \u2192</Link>
        </div>
      </section>

      {/* \u2500\u2500 HOW IT WORKS \u2500\u2500 */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="section-wrapper py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">4 simple steps to turn scrap into money</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                <div className="text-5xl font-extrabold text-green-100 absolute top-4 right-5 select-none">{s.num}</div>
                <h3 className="font-bold text-gray-800 text-base mb-2 relative z-10">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/schedule" className="btn-primary px-10 py-4 text-base">\uD83D\uDCC5 Book a Pickup Now</Link>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 INTERACTIVE CALCULATOR \u2500\u2500 */}
      <section className="section-wrapper py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">\uD83E\uDDD2 Estimate Your Scrap Value</h2>
          <p className="text-gray-500 mt-2">Move the sliders to see how much you could earn from your scrap</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="space-y-5">
              {CALC_ITEMS.map((item) => {
                const rate = getRate(item);
                const qty  = qtys[item.key];
                const val  = qty * rate;
                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        {item.label}
                        <span className="ml-2 text-xs font-normal text-gray-400">(\u20b9{rate}/{item.unit})</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 w-16 text-right">{qty} {item.unit}</span>
                        <span className={`text-sm font-bold w-20 text-right transition-all ${ val > 0 ? 'text-green-600' : 'text-gray-300' }`}>
                          {val > 0 ? `\u20b9${val.toFixed(0)}` : '\u20b90'}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range" min={0} max={item.max} step={item.step}
                      value={qty}
                      onChange={e => setQtys(prev => ({ ...prev, [item.key]: parseFloat(e.target.value) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #16a34a ${(qty/item.max)*100}%, #e5e7eb ${(qty/item.max)*100}%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                      <span>0</span><span>{item.max} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Estimated Total</p>
                  <p className="text-xs text-gray-400 mt-0.5">Based on current Chennai rates</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-extrabold transition-all ${ total > 0 ? 'text-green-600' : 'text-gray-200' }`}>
                    \u20b9{total.toFixed(0)}
                  </p>
                </div>
              </div>
              <Link href="/schedule"
                className="mt-5 btn-primary w-full py-4 text-center block text-base font-bold">
                \uD83D\uDCC5 Schedule Pickup to Get Paid
              </Link>
              <p className="text-xs text-center text-gray-400 mt-2">
                Actual amount may vary based on condition and weight. Payment on-site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 WHY CHOOSE US \u2500\u2500 */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="section-wrapper py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose DontWaste?</h2>
            <p className="text-gray-500 mt-2">Built for Chennai households who want convenience and fair value</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_US.map((w) => (
              <div key={w.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-green-100 hover:bg-green-50/30 transition-all">
                <span className="text-3xl shrink-0">{w.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{w.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 RATES TEASER \u2500\u2500 */}
      <section className="bg-green-700 text-white">
        <div className="section-wrapper py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-extrabold mb-2">Check Live Scrap Rates</h2>
            <p className="text-green-100 text-lg">Rates updated weekly. Paper, plastic, metal, e-waste and more.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/rates" className="inline-flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-2xl text-base shadow transition-all">
              \uD83D\uDCB0 View Scrap Rates
            </Link>
            <Link href="/schedule" className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 font-semibold px-8 py-4 rounded-2xl text-base transition-all">
              \uD83D\uDCC5 Book Pickup
            </Link>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 WHATSAPP STICKY CTA \u2500\u2500 */}
      <a href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20schedule%20a%20scrap%20pickup"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20b958] text-white font-bold px-5 py-3.5 rounded-2xl shadow-xl transition-all active:scale-95">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp Us
      </a>
    </div>
  );
}
