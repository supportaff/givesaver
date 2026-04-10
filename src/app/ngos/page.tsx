import Link from 'next/link';

const FOCUS_COLORS: Record<string, string> = {
  'Food':          'bg-orange-100 text-orange-700',
  'Clothes':       'bg-blue-100 text-blue-700',
  'Books':         'bg-purple-100 text-purple-700',
  'Food & Clothes':'bg-red-100 text-red-700',
  'Food & Books':  'bg-yellow-100 text-yellow-700',
  'All':           'bg-green-100 text-green-700',
  'Education':     'bg-indigo-100 text-indigo-700',
  'Healthcare':    'bg-pink-100 text-pink-700',
  'Women':         'bg-fuchsia-100 text-fuchsia-700',
  'Children':      'bg-cyan-100 text-cyan-700',
};

const NGOS = [
  // Chennai
  { name: 'Akshaya Patra Foundation',     city: 'Chennai',     focus: 'Food',          phone: '044-2815 7272', website: 'https://www.akshayapatra.org',         desc: 'Mid-day meal programme feeding millions of school children across India.' },
  { name: 'Karunalaya',                   city: 'Chennai',     focus: 'Children',      phone: '044-2591 0709', website: 'https://karunalaya.org',               desc: 'Supports street children, child labourers, and trafficking survivors.' },
  { name: 'Exnora International',         city: 'Chennai',     focus: 'All',           phone: '044-2433 3444', website: 'https://exnora.org',                   desc: 'Civic improvement and waste management through citizen action.' },
  { name: 'SNEHA India',                  city: 'Chennai',     focus: 'Women',         phone: '044-2464 0050', website: 'https://snehaindia.org',               desc: 'Suicide prevention, domestic violence support, and mental health.' },
  { name: 'Udavum Karangal',              city: 'Chennai',     focus: 'All',           phone: '044-2278 0034', website: 'https://udavumkarangal.org',           desc: 'Shelter and rehabilitation for abandoned elderly, children, and disabled.' },
  { name: 'Loyal Home',                   city: 'Chennai',     focus: 'Food',          phone: '044-2617 2000', website: null,                                   desc: 'Provides food and shelter for the destitute in Chennai.' },
  { name: 'Desire Society',               city: 'Chennai',     focus: 'Children',      phone: '044-2491 0823', website: 'https://desiresociety.org',            desc: 'Care and support for children affected by HIV/AIDS.' },
  { name: 'Robin Hood Army Chennai',      city: 'Chennai',     focus: 'Food',          phone: null,            website: 'https://robinhoodarmy.com',            desc: 'Volunteer network collecting and distributing surplus food to the underprivileged.' },
  { name: 'No Food Waste',                city: 'Chennai',     focus: 'Food',          phone: '98403 99233',   website: 'https://nofoodwaste.org',              desc: 'App-based platform collecting surplus food from events and hotels.' },
  { name: 'Isha Foundation',              city: 'Coimbatore',  focus: 'All',           phone: '0422-2515 345', website: 'https://isha.sadhguru.org',            desc: 'Yoga, rural development, and environmental outreach across Tamil Nadu.' },
  // Coimbatore
  { name: 'Sri Avinashilingam Institute', city: 'Coimbatore',  focus: 'Education',     phone: '0422-2440241',  website: 'https://avinuty.ac.in',               desc: 'Women\'s education and empowerment with strong social welfare wing.' },
  { name: 'Kovai Medical Relief Society', city: 'Coimbatore',  focus: 'Healthcare',    phone: '0422-4323800',  website: 'https://kmchhospital.org',             desc: 'Subsidised healthcare and free medical camps across Coimbatore.' },
  // Madurai
  { name: 'Madurai Kamaraj University NSS',city: 'Madurai',    focus: 'All',           phone: '0452-2458401',  website: null,                                   desc: 'National Service Scheme unit organising community welfare camps in rural TN.' },
  { name: 'Swami Vivekananda Youth Movement',city:'Madurai',   focus: 'Education',     phone: null,            website: 'https://svym.org',                     desc: 'Tribal welfare, education, and healthcare in remote districts.' },
  // Tiruchy
  { name: 'Bethany Navajeevan',           city: 'Tiruchy',     focus: 'Children',      phone: '0431-2702230',  website: null,                                   desc: 'Care for abandoned children, orphans, and differently-abled youth.' },
  { name: 'CREDO',                        city: 'Tiruchy',     focus: 'Women',         phone: '0431-2415050',  website: null,                                   desc: 'Empowering rural women through self-help groups and vocational training.' },
  // Salem
  { name: 'Serve Needy Foundation',       city: 'Salem',       focus: 'Food & Clothes',phone: '98421 00023',   website: null,                                   desc: 'Distributes food, clothes, and essentials to street dwellers in Salem.' },
  // Tirunelveli
  { name: 'Shanthi Ashram',               city: 'Tirunelveli', focus: 'All',           phone: '0462-2577844',  website: null,                                   desc: 'Social welfare ashram offering education, food, and shelter to the needy.' },
  // Vellore
  { name: 'CMC Vellore Community Health', city: 'Vellore',     focus: 'Healthcare',    phone: '0416-2281000',  website: 'https://cmch-vellore.edu',             desc: 'Community health and outreach programmes across Tamil Nadu villages.' },
  // Erode
  { name: 'Annai Welfare Society',        city: 'Erode',       focus: 'Food & Books',  phone: null,            website: null,                                   desc: 'Books, food, and scholarship support for underprivileged students in Erode.' },
];

const CITIES = ['All', ...Array.from(new Set(NGOS.map((n) => n.city))).sort()];
const FOCUSES = ['All', ...Array.from(new Set(NGOS.map((n) => n.focus))).sort()];

export default function NGODirectoryPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white">
        <div className="section-wrapper py-16 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h1 className="text-4xl font-bold mb-3">NGO Directory</h1>
          <p className="text-green-100 max-w-xl mx-auto">
            Verified NGOs and welfare organisations across Tamil Nadu.
            Contact them directly to coordinate large donations or volunteer.
          </p>
        </div>
      </div>

      <NGOList ngos={NGOS} cities={CITIES} focuses={FOCUSES} />

      <div className="bg-amber-50 border-t border-amber-200 py-5">
        <div className="section-wrapper">
          <p className="text-xs text-amber-700 text-center">
            ⚠️ This directory is maintained for reference only. GiveSaver does not endorse, partner with,
            or take responsibility for any of the listed organisations. Please verify directly before donating.
          </p>
        </div>
      </div>
    </div>
  );
}

// Client-side filter component
import NGOList from '@/components/NGOList';
