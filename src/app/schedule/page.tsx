'use client';
import { useState } from 'react';
import Link from 'next/link';

const SCRAP_CATEGORIES = [
  'Paper & Cardboard',
  'Plastic',
  'Metal (Iron / Steel)',
  'Copper / Brass / Aluminium',
  'E-Waste (Phones, Laptops, PCBs)',
  'Large Appliances (Fridge, Washing Machine, AC)',
  'Glass',
  'Mixed / Multiple Categories',
];

const TIME_SLOTS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

export default function SchedulePage() {
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');
  const [phone,     setPhone]     = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError('');
    const fd = new FormData(e.currentTarget);

    // Basic phone validation
    const rawPhone = (fd.get('phone') as string ?? '').replace(/\D/g, '');
    const localPhone = rawPhone.startsWith('91') && rawPhone.length === 12 ? rawPhone.slice(2) : rawPhone;
    if (!/^[6-9]\d{9}$/.test(localPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      setLoading(false); return;
    }

    try {
      const res = await fetch('/api/pickups', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       fd.get('name'),
          phone:      localPhone,
          address:    fd.get('address'),
          category:   fd.get('category'),
          timeSlot:   fd.get('timeSlot'),
          date:       fd.get('date'),
          notes:      fd.get('notes') || null,
          city:       'Chennai',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setPhone(localPhone);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or WhatsApp us directly.');
    } finally { setLoading(false); }
  }

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-3xl font-extrabold text-gray-900">Pickup Booked!</h2>
        <p className="text-gray-500 mt-2">Your scrap pickup request has been received.</p>
        <div className="card mt-6 text-left">
          <h3 className="font-bold text-gray-800 mb-4">📱 What happens next?</h3>
          <div className="space-y-4">
            {[
              ['1', 'WhatsApp confirmation', `We’ll send a confirmation to +91 ${phone} within 15 minutes.`],
              ['2', 'Our team arrives', 'A DontWaste agent will arrive at your address in the selected time slot.'],
              ['3', 'Weigh & Pay', 'All items are weighed on our digital scale. You get paid immediately by cash or UPI.'],
            ].map(([n, t, d]) => (
              <div key={n} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center shrink-0">{n}</div>
                <div><p className="text-sm font-semibold text-gray-700">{t}</p><p className="text-xs text-gray-500 mt-0.5">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link href="/" className="btn-secondary flex-1 text-center py-3">Back to Home</Link>
          <a href={`https://wa.me/919999999999?text=Hi%2C%20I%20just%20booked%20a%20scrap%20pickup%20from%20+91${phone}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#25D366] text-white">
            📲 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Schedule a Scrap Pickup</h1>
          <p className="text-gray-500 mt-1">Fill in the details below. We’ll confirm via WhatsApp within 15 minutes.</p>
        </div>
      </div>

      <div className="section-wrapper py-8">
        <div className="max-w-xl mx-auto">
          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input name="name" required placeholder="e.g. Ramesh Kumar" className="input-field" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number *</label>
                <input name="phone" required type="tel" placeholder="e.g. 9876543210" className="input-field" maxLength={13} />
                <p className="text-xs text-gray-400 mt-1">10-digit Indian mobile number. We’ll send confirmation here.</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Address *</label>
                <textarea name="address" required rows={3} placeholder="House/Flat no., Street, Area, City — be specific so our team can find you easily" className="input-field resize-none" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scrap Category *</label>
                <select name="category" required className="input-field">
                  <option value="">Select what you want to sell…</option>
                  {SCRAP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date *</label>
                <input name="date" required type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field" />
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Time Slot *</label>
                <select name="timeSlot" required className="input-field">
                  <option value="">Select a time slot…</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea name="notes" rows={2} placeholder="e.g. Large iron almirah on 3rd floor, will need 2 people" className="input-field resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Booking...' : '📅 Confirm Pickup Booking'}
              </button>

              <p className="text-xs text-center text-gray-400">
                Or call/WhatsApp us directly at{' '}
                <a href="tel:+919999999999" className="text-green-600 font-semibold">+91 99999 99999</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
