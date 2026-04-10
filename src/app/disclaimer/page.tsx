export default function DisclaimerPage() {
  const sections = [
    { title: 'No Warranty on Donations',   body: 'GiveSaver makes no representations or warranties regarding the quality, safety, condition, or fitness of any donated items. All items are donated "as-is" and recipients accept full responsibility upon collection.' },
    { title: 'Food Safety',                body: 'GiveSaver does not verify the safety, hygiene, or freshness of food donations. Recipients must independently assess food quality before consumption or distribution. Always check expiry dates, storage conditions, and packaging. GiveSaver is not responsible for illness or harm resulting from food donations.' },
    { title: 'Clothing & Books',           body: 'Donors are expected to donate clean and usable items, but GiveSaver does not inspect them. Recipients should inspect all clothing and books upon receipt and decline items that are damaged, soiled, or unsuitable.' },
    { title: 'No Transportation Service', body: 'GiveSaver does not provide pickup, delivery, or logistics services of any kind. All coordination for item collection is directly between the donor and the recipient. GiveSaver is not a party to these arrangements.' },
    { title: 'User Verification',         body: 'GiveSaver does not conduct background checks or verify the identity of all donors and recipients. Exercise reasonable caution during pickup interactions. Prefer public or accessible locations for handover.' },
    { title: 'Accuracy of Listings',      body: 'Donation descriptions, quantities, and expiry information are provided by donors. GiveSaver does not independently verify this information. Confirm details with the donor directly before making a trip for pickup.' },
    { title: 'Limitation of Liability',   body: 'To the fullest extent permitted by law, GiveSaver and its team shall not be held liable for any loss, damage, illness, or injury arising from the use of this platform or from donated items. Your use of GiveSaver is entirely at your own risk.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="section-wrapper py-12">
          <h1 className="text-4xl font-bold text-gray-800">Disclaimer</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: April 2026</p>
        </div>
      </div>
      <div className="section-wrapper py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-10 flex gap-4 items-start">
            <span className="text-3xl shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-amber-800 mb-1">Important Notice</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                GiveSaver is a coordination platform only. We do not physically handle, inspect,
                transport, or guarantee any donated items. Read this disclaimer carefully.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {sections.map((s) => (
              <div key={s.title} className="card">
                <h2 className="font-bold text-gray-800 mb-2">{s.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="card mt-5 bg-gray-800 text-white">
            <h2 className="font-bold mb-2">Report a Concern</h2>
            <p className="text-gray-300 text-sm">If you experience issues with a donation, contact <a href="mailto:support@givesaver.in" className="text-green-400 underline">support@givesaver.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
