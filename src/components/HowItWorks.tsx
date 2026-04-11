'use client';
import { useState } from 'react';
import Link from 'next/link';

const DONOR_STEPS = [
  {
    icon: '\u{1F4DD}',
    title: 'Fill in your donation details',
    desc: 'Go to Post a Donation. Enter the item name, category (Food / Clothes / Books), quantity, pickup address, and your phone number. Add an expiry date for food items. Takes under 2 minutes — no account needed.',
    tip: 'For cooked food, post it as soon as possible so receivers can collect before it expires.',
  },
  {
    icon: '\u2705',
    title: 'Your listing goes live instantly',
    desc: 'Your donation is immediately visible on the Browse page for everyone in Chennai. You will receive a unique Manage link — save it! You will need it to update or close your listing later.',
    tip: 'Copy your Manage link from the success screen and save it in your notes.',
  },
  {
    icon: '\u{1F4F2}',
    title: 'A receiver contacts you on WhatsApp',
    desc: 'When someone is interested, they fill in their name and phone number on the listing. WhatsApp will open on their end with a pre-filled message sent to YOU. You will receive a WhatsApp message with their details — reply to agree on a pickup time.',
    tip: 'You never have to call a stranger first — they reach out to you.',
  },
  {
    icon: '\u{1F91D}',
    title: 'Hand over the item',
    desc: 'Meet the receiver at your agreed pickup location. Hand over the donation. That is it — you have done your part. The item finds a new home instead of going to waste.',
    tip: 'Meet in a visible, public spot for safety. A shop entrance or building lobby works great.',
  },
  {
    icon: '\u{1F4CB}',
    title: 'Mark as Collected',
    desc: 'After the handoff, open your Manage link (or go to My Donations → enter your phone number). Click Mark as Collected. This closes the listing and updates the live stats. Only you as the donor can do this step.',
    tip: 'Mark it collected promptly so other receivers know it is gone.',
  },
];

const RECEIVER_STEPS = [
  {
    icon: '\u{1F50D}',
    title: 'Browse available donations',
    desc: 'Go to Browse Donations. Filter by category (Food, Clothes, Books) or search by item name or area. All listings show the item, quantity, area, and how long ago it was posted. Food listings automatically disappear after expiry.',
    tip: 'Check the Expires label on food items — collect quickly if it expires soon.',
  },
  {
    icon: '\u{1F4E6}',
    title: 'Tap \u201cI want this\u201d on a listing',
    desc: 'Click the green \u201cI want this — Contact Donor\u201d button on any Available listing. A short form slides open asking for your name and WhatsApp number. You can also add an optional message like when you can collect.',
    tip: 'Be honest about when you can pick up — it helps the donor plan.',
  },
  {
    icon: '\u{1F4CB}',
    title: 'Accept the disclaimer',
    desc: 'Tick the checkbox confirming that DontWaste is a free platform, you will inspect items before accepting, and you will not resell donated goods. This keeps the platform safe and fair for everyone.',
    tip: 'Read it — it only takes 10 seconds and protects both sides.',
  },
  {
    icon: '\u{1F4AC}',
    title: 'WhatsApp opens with a pre-filled message',
    desc: 'As soon as you submit, WhatsApp opens with a ready-to-send message already filled in — it includes your name, phone number, the item details, and pickup address. Just hit Send. The donor\u2019s number is never shown on screen.',
    tip: 'If WhatsApp does not open, tap the \u201cRe-open WhatsApp\u201d button on the confirmation screen.',
  },
  {
    icon: '\u{1F91D}',
    title: 'Coordinate and collect',
    desc: 'The donor will reply on WhatsApp to confirm a pickup time and location. Go collect the item at the agreed time. Inspect it on the spot — you are free to decline if something seems off.',
    tip: 'Always meet in a public place. Never pay any money — all donations are 100% free.',
  },
  {
    icon: '\u2728',
    title: 'Done — you helped cut waste!',
    desc: 'Once you have collected the item, the donor marks it as Collected on their end. The listing closes, the live stats update, and one more item is saved from going to waste. Thank you for being part of this.',
    tip: 'If you no longer need the item, please let the donor know so they can re-list it for someone else.',
  },
];

export default function HowItWorks() {
  const [tab, setTab] = useState<'donor' | 'receiver'>('donor');
  const steps = tab === 'donor' ? DONOR_STEPS : RECEIVER_STEPS;

  return (
    <section className="bg-white py-16">
      <div className="section-wrapper">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">How DontWaste Works</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            No sign-up. No approval. No middlemen. Pick your role below and follow the steps.
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
            <button
              onClick={() => setTab('donor')}
              className={`px-7 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === 'donor'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              \u{1F381} I\u2019m a Donor
            </button>
            <button
              onClick={() => setTab('receiver')}
              className={`px-7 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === 'receiver'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              \u{1F91C} I\u2019m a Receiver
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-0 max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="relative flex gap-5">

              {/* Left: number bubble + connector line */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-green-100 border-2 border-green-200 flex items-center justify-center shrink-0 z-10">
                  <span className="text-2xl">{s.icon}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-green-200 to-green-50 my-1" />
                )}
              </div>

              {/* Right: content */}
              <div className="pb-8 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-2">{s.desc}</p>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <span className="text-sm shrink-0">\u{1F4A1}</span>
                  <p className="text-xs text-amber-800 leading-relaxed">{s.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          {tab === 'donor' ? (
            <>
              <Link href="/donate"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow text-center">
                \u{1F381} Post a Donation Now
              </Link>
              <Link href="/my-donations"
                className="border-2 border-green-600 text-green-700 font-bold py-3 px-10 rounded-xl hover:bg-green-50 transition-colors text-center">
                \u{1F4CB} Manage My Donations
              </Link>
            </>
          ) : (
            <>
              <Link href="/browse"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow text-center">
                \u{1F50D} Browse Donations
              </Link>
              <Link href="/browse?category=FOOD"
                className="border-2 border-green-600 text-green-700 font-bold py-3 px-10 rounded-xl hover:bg-green-50 transition-colors text-center">
                \u{1F371} Browse Food Only
              </Link>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
