import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';

export const revalidate = 60;

async function getLiveStats() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('donations').select('status, category');
    const rows = (data ?? []) as { status: string; category: string }[];
    return {
      total:     rows.length,
      collected: rows.filter((r) => r.status === 'COLLECTED').length,
      food:      rows.filter((r) => r.category === 'FOOD').length,
      clothes:   rows.filter((r) => r.category === 'CLOTHES').length,
      books:     rows.filter((r) => r.category === 'BOOKS').length,
    };
  } catch {
    return { total: 0, collected: 0, food: 0, clothes: 0, books: 0 };
  }
}

export default async function AboutPage() {
  const stats = await getLiveStats();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white">
        <div className="section-wrapper py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">About GiveSaver</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            A community-driven platform to reduce waste and connect surplus with need.
          </p>
        </div>
      </div>

      <div className="section-wrapper py-16 space-y-16">
        {/* Mission */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            To build a sustainable, community-driven ecosystem where surplus becomes support.
            No food should go to waste. No book should gather dust. No piece of clothing should
            be discarded when someone else needs it.
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { emoji: '📦', label: 'Total Donations',   value: stats.total },
            { emoji: '✅', label: 'Successfully Collected', value: stats.collected },
            { emoji: '🍱', label: 'Food Donations',    value: stats.food },
            { emoji: '👕', label: 'Clothes Donations', value: stats.clothes },
            { emoji: '📚', label: 'Book Donations',    value: stats.books },
            { emoji: '🌱', label: 'Items Saved from Waste', value: stats.collected },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="text-2xl font-bold text-green-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What We Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '🍱', title: 'Food',    desc: 'Cooked meals, vegetables, fruits, packaged goods, grains — anything safe and edible. Food donations include expiry tracking.' },
              { emoji: '👕', title: 'Clothes', desc: 'Clean, wearable clothing for all ages — everyday wear, winter clothing, footwear, and accessories.' },
              { emoji: '📚', title: 'Books',   desc: "School textbooks, story books, reference materials, children's activity books, religious texts, and more." },
            ].map((c) => (
              <div key={c.title} className="card text-center">
                <div className="text-5xl mb-4">{c.emoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '🌟', title: 'Dignity',        desc: 'Every donation is made with respect for the recipient.' },
              { icon: '🔒', title: 'Safety',         desc: 'Donors affirm all items are safe and fit for use.' },
              { icon: '🤝', title: 'Community',      desc: 'We build bridges between givers and receivers.' },
              { icon: '♻️', title: 'Sustainability', desc: 'Reducing waste is at the heart of everything we do.' },
            ].map((v) => (
              <div key={v.title} className="card flex items-start gap-4">
                <span className="text-3xl shrink-0">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{v.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/donate" className="btn-primary text-lg px-10 py-4 mr-4">Start Donating</Link>
          <Link href="/browse" className="btn-secondary text-lg px-10 py-4">Browse Donations</Link>
        </div>
      </div>
    </div>
  );
}
