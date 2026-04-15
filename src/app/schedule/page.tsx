'use client';
import { useState } from 'react';
import Link from 'next/link';

const SCRAP_CATEGORIES = [
  { id: 'paper',      emoji: '\uD83D\uDCF0', label: 'Paper & Cardboard' },
  { id: 'plastic',    emoji: '\uD83D\uDED2', label: 'Plastic' },
  { id: 'metal',      emoji: '\u2699\uFE0F',  label: 'Metal (Iron/Steel)' },
  { id: 'copper',     emoji: '\uD83E\uDEB4', label: 'Copper / Brass / Aluminium' },
  { id: 'ewaste',     emoji: '\uD83D\uDCBB', label: 'E-Waste' },
  { id: 'appliances', emoji: '\uD83E\uDDF9', label: 'Large Appliances' },
  { id: 'glass',      emoji: '\uD83C\uDF7A', label: 'Glass' },
  { id: 'mixed',      emoji: '\uD83D\uDCE6', label: 'Mixed / Multiple' },
];

const TIME_SLOTS = [
  { id: 'slot1', label: '8 AM – 10 AM',   emoji: '\uD83C\uDF05' },
  { id: 'slot2', label: '10 AM – 12 PM',  emoji: '\uD83C\uDFD9\uFE0F' },
  { id: 'slot3', label: '12 PM – 2 PM',   emoji: '\u2600\uFE0F' },
  { id: 'slot4', label: '2 PM – 4 PM',    emoji: '\uD83C\uDF24\uFE0F' },
  { id: 'slot5', label: '4 PM – 6 PM',    emoji: '\uD83C\uDF07' },
];

interface FormData {
  name: string; phone: string;
  address: string; pincode: string;
  categories: string[];
  date: string; timeSlot: string; notes: string;
}

export default function SchedulePage() {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState<FormData>({
    name: '', phone: '', address: '', pincode: '',
    categories: [], date: '', timeSlot: '', notes: '',
  });

  function update(key: keyof FormData, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function toggleCategory(id: string) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id],
    }));
  }

  function validateStep(s: number): string {
    if (s === 1) {
      if (!form.name.trim()) return 'Please enter your name.';
      const raw = form.phone.replace(/\D/g, '');
      const local = raw.startsWith('91') && raw.length === 12 ? raw.slice(2) : raw;
      if (!/^[6-9]\d{9}$/.test(local)) return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (s === 2) {
      if (!form.address.trim()) return 'Please enter your pickup address.';
      if (form.categories.length === 0) return 'Please select at least one scrap category.';
    }
    if (s === 3) {
      if (!form.date) return 'Please select a preferred date.';
      if (!form.timeSlot) return 'Please select a time slot.';
    }
    return '';
  }

  function nextStep() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    const err = validateStep(3);
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    const raw = form.phone.replace(/\D/g, '');
    const localPhone = raw.startsWith('91') && raw.length === 12 ? raw.slice(2) : raw;
    try {
      const res = await fetch('/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     form.name,
          phone:    localPhone,
          address:  `${form.address}${form.pincode ? ', ' + form.pincode : ''}`,
          category: form.categories.map(id => SCRAP_CATEGORIES.find(c => c.id === id)?.label).join(', '),
          timeSlot: TIME_SLOTS.find(t => t.id === form.timeSlot)?.label ?? form.timeSlot,
          date:     form.date,
          notes:    form.notes || null,
          city:     'Chennai',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or WhatsApp us directly.');
    } finally { setLoading(false); }
  }

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="text-7xl mb-4">\uD83C\uDF89</div>
        <h2 className="text-3xl font-extrabold text-gray-900">Pickup Booked!</h2>
        <p className="text-gray-500 mt-2">Your scrap pickup request has been received.</p>
        <div className="card mt-6 text-left">
          <h3 className="font-bold text-gray-800 mb-4">\uD83D\uDCF1 What happens next?</h3>
          <div className="space-y-4">
            {[
              ['1', 'WhatsApp confirmation', `We\u2019ll send a confirmation to +91 ${form.phone} within 15 minutes.`],
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
          <a href={`https://wa.me/919999999999?text=Hi%2C%20I%20just%20booked%20a%20scrap%20pickup`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-[#25D366] text-white">
            \uD83D\uDCF2 Chat on WhatsApp
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
          <p className="text-gray-500 mt-1">We\u2019ll confirm via WhatsApp within 15 minutes.</p>
        </div>
      </div>

      <div className="section-wrapper py-8">
        <div className="max-w-xl mx-auto">

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {['Contact Info', 'Scrap Details', 'Schedule'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > i + 1 ? 'bg-green-600 text-white' :
                    step === i + 1 ? 'bg-green-600 text-white ring-4 ring-green-100' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step > i + 1 ? '\u2713' : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${ step === i + 1 ? 'text-green-700' : 'text-gray-400' }`}>{label}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">{error}</div>
            )}

            {/* Step 1: Contact Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Ramesh Kumar" className="input-field" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-semibold">\uD83C\uDDEE\uD83C\uDDF3 +91</span>
                    <input value={form.phone} onChange={e => update('phone', e.target.value)}
                      type="tel" placeholder="9876543210" maxLength={10}
                      className="input-field rounded-l-none flex-1" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">10-digit Indian mobile. We\u2019ll send pickup confirmation here.</p>
                </div>
                <button onClick={nextStep} className="btn-primary w-full py-4 text-base">Continue \u2192</button>
              </div>
            )}

            {/* Step 2: Scrap Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Address *</label>
                  <textarea value={form.address} onChange={e => update('address', e.target.value)}
                    rows={3} placeholder="House/Flat no., Street, Area \u2014 be specific so our team finds you easily"
                    className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                  <input value={form.pincode} onChange={e => update('pincode', e.target.value)}
                    placeholder="e.g. 600001" maxLength={6} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Scrap Categories * <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCRAP_CATEGORIES.map((cat) => (
                      <button key={cat.id} type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                          form.categories.includes(cat.id)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50/30'
                        }`}>
                        <span>{cat.emoji}</span> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setStep(1); setError(''); }} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">\u2190 Back</button>
                  <button onClick={nextStep} className="flex-1 btn-primary py-3 text-sm">Continue \u2192</button>
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date *</label>
                  <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Time Slot *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button key={slot.id} type="button"
                        onClick={() => update('timeSlot', slot.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          form.timeSlot === slot.id
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-green-200'
                        }`}>
                        <span>{slot.emoji}</span> {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
                    rows={2} placeholder="e.g. Large iron almirah on 3rd floor, will need 2 people"
                    className="input-field resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setStep(2); setError(''); }} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm">\u2190 Back</button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">
                    {loading ? 'Booking...' : '\uD83D\uDCC5 Confirm Booking'}
                  </button>
                </div>
                <p className="text-xs text-center text-gray-400">
                  Or WhatsApp us: <a href="tel:+919999999999" className="text-green-600 font-semibold">+91 99999 99999</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
