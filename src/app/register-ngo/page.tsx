'use client';
import { useState } from 'react';
import Link from 'next/link';

const FOCUS_AREAS = ['Food', 'Clothes', 'Books', 'Food & Clothes', 'Food & Books', 'All Categories'];
const CHENNAI_AREAS = [
  'Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'Mylapore', 'Nungambakkam',
  'Kilpauk', 'Tambaram', 'Chromepet', 'Porur', 'Besant Nagar', 'Perambur',
  'Royapettah', 'Egmore', 'Kodambakkam', 'Ashok Nagar', 'KK Nagar', 'Virugambakkam',
  'Guindy', 'Thoraipakkam', 'OMR', 'ECR', 'Sholinganallur', 'Perungudi',
];

type Step = 1 | 2 | 3;

type FormData = Record<string, string>;

export default function RegisterNGOPage() {
  const [step,      setStep]      = useState<Step>(1);
  const [formData,  setFormData]  = useState<FormData>({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  function saveAndNext(e: React.FormEvent<HTMLFormElement>, nextStep: Step) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const entries: FormData = {};
    fd.forEach((v, k) => { entries[k] = v.toString(); });
    setFormData((prev) => ({ ...prev, ...entries }));
    setStep(nextStep);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ngo-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName:         formData.orgName,
          regNumber:       formData.regNumber,
          yearEstablished: formData.yearEstablished,
          focusArea:       formData.focusArea,
          operatingArea:   formData.operatingArea,
          address:         formData.address,
          website:         formData.website || null,
          receiverName:    formData.receiverName,
          designation:     formData.designation,
          whatsapp:        formData.whatsapp,
          alternatePhone:  formData.alternatePhone || null,
          email:           formData.email,
          idType:          formData.idType,
          idNumber:        formData.idNumber,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
    } catch (err) {
      setError('Submission failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-5">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Registration Submitted!</h2>
        <p className="text-gray-500 leading-relaxed mb-2">
          Our team in <strong>Chennai</strong> will verify your details within <strong>2–3 working days</strong>.
        </p>
        <p className="text-sm text-gray-400 mb-8">You will be contacted on your WhatsApp number once approved.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/browse" className="btn-primary">Browse Donations</Link>
          <Link href="/" className="btn-secondary">Go Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white">
        <div className="section-wrapper py-12 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h1 className="text-4xl font-bold mb-2">Register as an NGO</h1>
          <p className="text-green-100 max-w-xl mx-auto">
            Join GiveSaver&apos;s verified network in Chennai to receive and distribute donations.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b">
        <div className="section-wrapper py-5">
          <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
            {([1,2,3] as Step[]).map((s, i) => (
              <>
                <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  step === s ? 'bg-green-600 text-white shadow-sm' : step > s ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  <span>{step > s ? '✓' : s}</span>
                  <span className="hidden sm:inline">{s === 1 ? 'Organisation' : s === 2 ? 'Receiver' : 'Agreement'}</span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-gray-200" />}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="section-wrapper py-10">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">{error}</div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-6">🏢 Organisation Details</h2>
              <form onSubmit={(e) => saveAndNext(e, 2)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">NGO / Organisation Name *</label>
                  <input name="orgName" required defaultValue={formData.orgName} placeholder="e.g. Helping Hands Trust" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration Number *</label>
                    <input name="regNumber" required defaultValue={formData.regNumber} placeholder="NGO Darpan / Trust No." className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year Established *</label>
                    <input name="yearEstablished" required type="number" min="1900" max="2026" defaultValue={formData.yearEstablished} placeholder="e.g. 2015" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Focus Area *</label>
                  <select name="focusArea" required defaultValue={formData.focusArea || ''} className="input-field">
                    <option value="">Select focus area...</option>
                    {FOCUS_AREAS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Operating Area in Chennai *</label>
                  <select name="operatingArea" required defaultValue={formData.operatingArea || ''} className="input-field">
                    <option value="">Select your primary area...</option>
                    {CHENNAI_AREAS.map((a) => <option key={a} value={a}>{a}, Chennai</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address *</label>
                  <input name="address" required defaultValue={formData.address} placeholder="Street, Area, Chennai" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website / Social Media (optional)</label>
                  <input name="website" defaultValue={formData.website} placeholder="https://" className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full py-3">Next: Receiver Details →</button>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-2">👤 Authorised Receiver Details</h2>
              <p className="text-sm text-gray-500 mb-6">This person will coordinate pickups with donors. Details shared with donors when you claim.</p>
              <form onSubmit={(e) => saveAndNext(e, 3)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input name="receiverName" required defaultValue={formData.receiverName} placeholder="Receiver full name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation *</label>
                    <input name="designation" required defaultValue={formData.designation} placeholder="e.g. Coordinator" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number *</label>
                  <div className="flex gap-2">
                    <span className="input-field max-w-[70px] text-center text-gray-500 bg-gray-50">+91</span>
                    <input name="whatsapp" required type="tel" defaultValue={formData.whatsapp} placeholder="98400 00000" className="input-field flex-1" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Donors will message you on this number.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alternate Contact</label>
                  <input name="alternatePhone" type="tel" defaultValue={formData.alternatePhone} placeholder="+91 XXXXX XXXXX" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input name="email" required type="email" defaultValue={formData.email} placeholder="receiver@ngo.org" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Government ID Type *</label>
                  <select name="idType" required defaultValue={formData.idType || ''} className="input-field">
                    <option value="">Select ID type...</option>
                    <option>Aadhaar Card</option>
                    <option>Voter ID</option>
                    <option>Passport</option>
                    <option>Driving Licence</option>
                    <option>PAN Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Number *</label>
                  <input name="idNumber" required defaultValue={formData.idNumber} placeholder="Enter ID number" className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">Kept confidential. Used for verification only.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">🔒 Your name, designation and WhatsApp will be visible to donors when you claim. ID is private.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button type="submit" className="btn-primary flex-1 py-3">Next: Agreement →</button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-6">📜 NGO Pledge &amp; Agreement</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  'Our organisation is a legitimate non-profit operating for genuine charitable purposes.',
                  'All donations received through GiveSaver will be distributed FREE OF COST to individuals in need.',
                  'We will NEVER resell, trade, or commercially exploit donated items in any form.',
                  'Our authorised receiver details are accurate and we accept full responsibility for any misrepresentation.',
                  'We agree to provide distribution proof (photo/report) if requested by GiveSaver within 30 days.',
                  'We understand that violation of these terms results in immediate removal and legal action.',
                  'We acknowledge GiveSaver currently serves Chennai and we operate within this region.',
                ].map((line, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition-all">
                    <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" />
                    <span className="text-sm text-gray-700 leading-relaxed">{line}</span>
                  </label>
                ))}
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mt-2">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>⚠️ Disclaimer:</strong> GiveSaver is a coordination platform only. By registering, your
                    organisation accepts full responsibility for verifying and safely distributing all received
                    donations. GiveSaver reserves the right to remove any NGO found misusing the platform.
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-40">
                    {loading ? 'Submitting...' : '🤝 Submit Registration'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '✅', title: 'Verified Only',  desc: 'We manually verify every NGO before approving.' },
                { icon: '🔒', title: 'Data Protected', desc: 'Shared with donors only when you claim a donation.' },
                { icon: '📍', title: 'Chennai Focus',  desc: 'Currently serving Chennai. More cities coming soon.' },
              ].map((c) => (
                <div key={c.title} className="card text-center">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-gray-800 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
