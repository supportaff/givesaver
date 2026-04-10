import Link from 'next/link';
import DonationCard from '@/components/DonationCard';
import { STATS, CATEGORY_META, NGOS } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/server';
import type { DonationRow } from '@/lib/supabase/types';

export const revalidate = 60; // ISR: refresh every 60s

async function getRecentDonations(): Promise<DonationRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data as DonationRow[]) ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const recent = await getRecentDonations();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🌱</div>
          <div className="absolute bottom-10 right-20 text-8xl">🍱</div>
          <div className="absolute top-20 right-40 text-7xl">📚</div>
        </div>
        <div className="section-wrapper relative py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            Trusted by {STATS.ngoPartners} NGOs across {STATS.citiesCovered} cities
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Give More.<br />
            <span className="text-green-200">Waste Less.</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Donate surplus food 🍱, clothes 👕, and books 📚 to verified NGOs and
            volunteers who deliver them to families in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate" className="bg-white text-green-700 font-bold py-4 px-10 rounded-xl hover:bg-green-50 transition-colors shadow-lg text-lg">
              Donate Now →
            </Link>
            <Link href="/browse" className="border-2 border-white/60 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-colors text-lg">
              Browse Donations
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section className="bg-gray-900 text-white py-8">
        <div className="section-wrapper grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {[
            { label: 'Total Donations',  value: STATS.totalDonations,   suffix: '' },
            { label: 'Available Now',    value: STATS.activeDonations,   suffix: '' },
            { label: 'NGO Partners',     value: STATS.ngoPartners,       suffix: '' },
            { label: 'Cities',           value: STATS.citiesCovered,     suffix: '' },
            { label: 'Lives Impacted',   value: STATS.livesImpacted,     suffix: '+' },
            { label: 'Food Saved',       value: STATS.foodSaved,         suffix: '' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-green-400">{s.value}{s.suffix}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Cards ─────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="section-wrapper">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">What would you like to donate?</h2>
            <p className="text-gray-500 mt-2">Every item you share makes a real difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(CATEGORY_META) as [string, typeof CATEGORY_META[keyof typeof CATEGORY_META]][]).map(([key, c]) => (
              <Link
                key={key}
                href={`/browse?category=${key}`}
                className={`flex flex-col items-center p-8 rounded-2xl border-2 ${c.border} hover:shadow-md transition-all group bg-white`}
              >
                <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
                <h3 className="text-xl font-bold text-gray-800">{c.label}</h3>
                <p className="text-sm text-gray-500 mt-1 text-center">{c.desc}</p>
                <span className={`badge ${c.color} mt-4`}>{c.count} available</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Donations ───────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="section-wrapper">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Latest Donations</h2>
              <p className="text-gray-500 text-sm mt-1">Freshly listed – claim before they&apos;re gone!</p>
            </div>
            <Link href="/browse" className="btn-outline text-sm hidden md:inline-block">View All →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-gray-500">No donations yet — be the first to post one!</p>
              <Link href="/donate" className="btn-primary mt-4 inline-block">Post a Donation</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((d) => <DonationCard key={d.id} donation={d} />)}
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link href="/browse" className="btn-secondary">View All Donations →</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="section-wrapper">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📦', step: '01', title: 'Post a Donation',      desc: 'List food, clothes, or books with quantity, type, and pickup address. Takes less than 2 minutes.' },
              { icon: '🔔', step: '02', title: 'NGOs Get Notified',    desc: 'Verified NGOs and volunteers nearby see your listing and can claim it immediately.' },
              { icon: '🚗', step: '03', title: 'Collect & Distribute', desc: 'Volunteers coordinate pickup with the donor and ensure items reach families who need them.' },
            ].map((s, i) => (
              <div key={s.title} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200 z-0" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-3xl mb-4">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-green-500 mb-1">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/how-it-works" className="btn-outline">Learn More →</Link>
          </div>
        </div>
      </section>

      {/* ── NGO Partners ───────────────────────────────────── */}
      <section className="bg-green-50 py-16">
        <div className="section-wrapper">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Our NGO Partners</h2>
            <p className="text-gray-500 mt-2">Verified organisations making the last-mile delivery happen</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {NGOS.map((n) => (
              <div key={n.name} className="card flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl shrink-0">🤝</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{n.name}</h3>
                  <p className="text-sm text-gray-500">{n.city} · {n.focus}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{n.donations} donations facilitated</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer Banner ──────────────────────────────── */}
      <section className="bg-amber-50 border-y border-amber-200 py-5">
        <div className="section-wrapper flex gap-3 items-start">
          <span className="text-xl shrink-0 mt-0.5">⚠️</span>
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> GiveSaver is a coordination platform only. We do not verify item quality,
            handle transport, or guarantee the condition of donated goods.
            Donors and recipients are solely responsible for item safety.{' '}
            <Link href="/disclaimer" className="underline font-semibold">Read full disclaimer →</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
