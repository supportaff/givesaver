import Link from 'next/link';
import DonationCard from '@/components/DonationCard';
import { CATEGORY_META } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/server';
import FoodCalculator from '@/components/FoodCalculator';
import type { DonationRow } from '@/lib/supabase/types';

export const revalidate = 60;

interface LiveStats {
  total: number;
  available: number;
  collected: number;
  food: number;
  clothes: number;
  books: number;
}

async function getLiveStats(): Promise<LiveStats> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('donations').select('status, category');
    const rows = (data ?? []) as { status: string; category: string }[];
    return {
      total:     rows.length,
      available: rows.filter((r) => r.status === 'AVAILABLE').length,
      collected: rows.filter((r) => r.status === 'COLLECTED').length,
      food:      rows.filter((r) => r.category === 'FOOD').length,
      clothes:   rows.filter((r) => r.category === 'CLOTHES').length,
      books:     rows.filter((r) => r.category === 'BOOKS').length,
    };
  } catch { return { total: 0, available: 0, collected: 0, food: 0, clothes: 0, books: 0 }; }
}

async function getRecentDonations(): Promise<DonationRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations').select('*').eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false }).limit(6);
    if (error) throw error;
    return (data as DonationRow[]) ?? [];
  } catch { return []; }
}

export default async function HomePage() {
  const [recent, stats] = await Promise.all([getRecentDonations(), getLiveStats()]);

  const liveStatCards = [
    { label: 'Total Donations',   value: stats.total,     emoji: '📦' },
    { label: 'Available Now',     value: stats.available, emoji: '🟢' },
    { label: 'Already Collected', value: stats.collected, emoji: '✅' },
    { label: 'Food Listings',     value: stats.food,      emoji: '🍱' },
    { label: 'Clothes Listings',  value: stats.clothes,   emoji: '👕' },
    { label: 'Book Listings',     value: stats.books,     emoji: '📚' },
  ];

  return (
    <div>

      {/* ── Good-Cause Banner ──────────────────────── */}
      <div className="bg-green-700 text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide">
        💚 DontWaste is <strong>100% free</strong> and non-commercial. We make no money here.
        This platform exists purely for a good cause — please use it responsibly and don&apos;t misuse it.
      </div>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-10 left-10 text-9xl">🌱</div>
          <div className="absolute bottom-10 right-20 text-8xl">🍱</div>
          <div className="absolute top-20 right-40 text-7xl">📚</div>
        </div>
        <div className="section-wrapper relative py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            {stats.available > 0 ? `${stats.available} donations available right now` : 'Live donation platform'}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Give More.<br />
            <span className="text-green-200">Waste Less.</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Post surplus food 🍱, clothes 👕, or books 📚 in under 2 minutes.
            Receivers claim directly — no middlemen, no delays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate"
              className="bg-white text-green-700 font-bold py-4 px-10 rounded-xl hover:bg-green-50 transition-colors shadow-lg text-lg">
              Post a Donation →
            </Link>
            <Link href="/browse"
              className="border-2 border-white/60 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-colors text-lg">
              Browse Donations
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Stats ─────────────────────────────── */}
      <section className="bg-gray-900 text-white py-8">
        <div className="section-wrapper">
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-5">Live numbers from our database</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {liveStatCards.map((s) => (
              <div key={s.label}>
                <p className="text-2xl mb-1">{s.emoji}</p>
                <p className="text-2xl font-bold text-green-400">{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section className="bg-white py-16">
        <div className="section-wrapper">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">How DontWaste Works</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              No sign-up. No approval process. Post in 2 minutes and let receivers claim directly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: '📝', step: '1',
                title: 'Post Your Donation',
                desc: 'Fill in what you\'re donating — food, clothes, or books — along with the quantity, pickup address, and your phone number. Takes under 2 minutes.',
              },
              {
                icon: '🔍', step: '2',
                title: 'Receiver Browses & Claims',
                desc: 'Anyone can search listings and claim your item. They provide their name and phone number to register the claim.',
              },
              {
                icon: '📞', step: '3',
                title: 'Direct Contact',
                desc: 'Once claimed, the donor\'s phone number is shown to the receiver. They call or WhatsApp each other to agree on a pickup time and place.',
              },
              {
                icon: '✅', step: '4',
                title: 'Mark as Collected',
                desc: 'After the handoff, the donor marks the donation as Collected. Simple, honest, and done — no app, no OTP, no fuss.',
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl shrink-0">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Step {s.step}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Cards ─────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="section-wrapper">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">What would you like to donate?</h2>
            <p className="text-gray-500 mt-2">Tap a category to see live listings or post your own</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(CATEGORY_META) as [string, typeof CATEGORY_META[keyof typeof CATEGORY_META]][]).map(([key, c]) => (
              <Link key={key} href={`/browse?category=${key}`}
                className={`flex flex-col items-center p-8 rounded-2xl border-2 ${c.border} hover:shadow-md transition-all group bg-white`}>
                <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
                <h3 className="text-xl font-bold text-gray-800">{c.label}</h3>
                <p className="text-sm text-gray-500 mt-1 text-center">{c.desc}</p>
                <span className={`badge ${c.color} mt-4`}>Browse listings →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Food Calculator ────────────────────────── */}
      <section className="bg-white py-16">
        <div className="section-wrapper">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">🧮 Food Waste Calculator</h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              See how much food you could save by donating instead of throwing away.
            </p>
          </div>
          <FoodCalculator />
        </div>
      </section>

      {/* ── Recent Donations ───────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="section-wrapper">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Available Now</h2>
              <p className="text-gray-500 text-sm mt-1">Freshly posted — claim before they&apos;re gone!</p>
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
          <div className="text-center mt-8">
            <Link href="/browse" className="btn-secondary">See All Donations →</Link>
          </div>
        </div>
      </section>

      {/* ── Misuse Warning ─────────────────────────── */}
      <section className="bg-green-900 text-white py-8">
        <div className="section-wrapper max-w-3xl text-center">
          <p className="text-2xl mb-3">🙏</p>
          <h2 className="text-xl font-bold mb-2">Built for Good. Keep it that way.</h2>
          <p className="text-green-200 text-sm leading-relaxed">
            DontWaste is a <strong>free, non-profit platform</strong> run by volunteers.
            We earn nothing from this. No ads. No fees. No subscriptions.
            Every listing is a real act of generosity — please don&apos;t misuse it.
            Fake listings, spam, or exploitation of donors or receivers will be removed immediately.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-5">
            <Link href="/disclaimer" className="text-sm underline text-green-300 hover:text-white">Read our Disclaimer →</Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer Bar ─────────────────────────── */}
      <section className="bg-amber-50 border-y border-amber-200 py-5">
        <div className="section-wrapper flex gap-3 items-start">
          <span className="text-xl shrink-0 mt-0.5">⚠️</span>
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> DontWaste is a coordination platform only. We do not verify item quality,
            handle transport, or guarantee the condition of donated goods.
            Donors and recipients are solely responsible for item safety.{' '}
            <Link href="/disclaimer" className="underline font-semibold">Read full disclaimer →</Link>
          </p>
        </div>
      </section>

    </div>
  );
}
