export type Category = 'FOOD' | 'CLOTHES' | 'BOOKS';
export type Status  = 'AVAILABLE' | 'CLAIMED' | 'COLLECTED';

export type Donation = {
  id: string;
  title: string;
  description: string;
  quantity: string;
  category: Category;
  itemType: string;
  expiresAt: string | null;
  status: Status;
  address: string;
  city: string;
  donorName: string;
  donorType: 'Individual' | 'Business' | 'NGO' | 'Institution';
  phone: string;
  postedAgo: string;
};

export const DONATIONS: Donation[] = [
  { id:'1',  title:'Fresh Vegetable Bundle',           description:'Assorted seasonal vegetables from our terrace garden — tomatoes, brinjals, spinach, curry leaves.',   quantity:'5 kg',       category:'FOOD',    itemType:'Vegetables',        expiresAt:'Expires in 2 days',    status:'AVAILABLE',  address:'12 Anna Nagar',      city:'Chennai',    donorName:'Priya Rajan',         donorType:'Individual',  phone:'+91 98400 12345', postedAgo:'2 hours ago' },
  { id:'2',  title:'Cooked Biryani – 30 Portions',      description:'Event leftovers from a wedding function. Freshly cooked, packed in sealed containers.',              quantity:'30 portions',category:'FOOD',    itemType:'Cooked Food',       expiresAt:'Expires in 6 hours',   status:'AVAILABLE',  address:'45 T Nagar',         city:'Chennai',    donorName:'Star Catering Co.',   donorType:'Business',    phone:'+91 98401 55678', postedAgo:'1 hour ago' },
  { id:'3',  title:'Surplus Mangoes & Bananas',         description:'Fresh farm produce collected this morning. Perfectly ripe and ready to eat.',                         quantity:'8 kg',       category:'FOOD',    itemType:'Fruits',            expiresAt:'Expires in 3 days',    status:'AVAILABLE',  address:'10 Chromepet',       city:'Chennai',    donorName:'Green Farms',         donorType:'Business',    phone:'+91 98402 77890', postedAgo:'30 min ago' },
  { id:'4',  title:'Basmati Rice – 10 kg',              description:'Unopened premium basmati rice pack, purchased in bulk. Best before Dec 2026.',                       quantity:'10 kg',      category:'FOOD',    itemType:'Grains & Pulses',   expiresAt:'Best before: Dec 2026',status:'CLAIMED',    address:'22 Velachery',       city:'Chennai',    donorName:'Ramesh Kumar',        donorType:'Individual',  phone:'+91 98403 11234', postedAgo:'1 day ago' },
  { id:'5',  title:'Bakery Surplus – Bread & Buns',     description:'End-of-day surplus from our bakery. Fresh bread loaves, dinner rolls, and cream buns.',            quantity:'40 pieces',  category:'FOOD',    itemType:'Bakery',            expiresAt:'Expires today',        status:'AVAILABLE',  address:'7 Mylapore',         city:'Chennai',    donorName:'Daily Bread Bakery',  donorType:'Business',    phone:'+91 98404 33456', postedAgo:'3 hours ago' },
  { id:'6',  title:"Men's Winter Jackets",              description:'Gently used warm jackets, sizes M to XL. Washed, dry-cleaned and folded.',                           quantity:'8 pieces',   category:'CLOTHES', itemType:'Winter Wear',       expiresAt:null,                   status:'AVAILABLE',  address:'78 Adyar',           city:'Chennai',    donorName:'Meena Sundar',        donorType:'Individual',  phone:'+91 98405 44567', postedAgo:'3 hours ago' },
  { id:'7',  title:"Children's School Uniforms",        description:'Clean school uniforms for kids aged 6–12. Includes shirts, pants, frocks. Various sizes.',           quantity:'15 sets',    category:'CLOTHES', itemType:"Children's Wear",   expiresAt:null,                   status:'AVAILABLE',  address:'9 Mylapore',         city:'Chennai',    donorName:'Helping Hand Trust',  donorType:'NGO',         phone:'+91 98406 55678', postedAgo:'5 hours ago' },
  { id:'8',  title:"Women's Sarees & Salwars",          description:'Traditional sarees and salwar sets in good condition. Various sizes and colours.',                    quantity:'20 pieces',  category:'CLOTHES', itemType:"Women's Wear",      expiresAt:null,                   status:'COLLECTED',  address:'5 Nungambakkam',     city:'Chennai',    donorName:'Anitha Krishnan',     donorType:'Individual',  phone:'+91 98407 66789', postedAgo:'2 days ago' },
  { id:'9',  title:'Footwear – Mixed Sizes',            description:'Assorted sandals, shoes, and chappals in good condition. Sizes 4–10.',                              quantity:'25 pairs',   category:'CLOTHES', itemType:'Footwear',          expiresAt:null,                   status:'AVAILABLE',  address:'14 Porur',           city:'Chennai',    donorName:'Kavitha Nair',        donorType:'Individual',  phone:'+91 98408 77890', postedAgo:'1 day ago' },
  { id:'10', title:"Men's Office Formals",              description:'Barely used formal shirts and trousers, sizes 38–42. Dry-cleaned and pressed.',                      quantity:'12 pieces',  category:'CLOTHES', itemType:"Men's Wear",        expiresAt:null,                   status:'AVAILABLE',  address:'33 Besant Nagar',    city:'Chennai',    donorName:'Kiran Mehta',         donorType:'Individual',  phone:'+91 98409 88901', postedAgo:'4 hours ago' },
  { id:'11', title:'CBSE Textbooks – Class 6 to 10',   description:'Lightly used CBSE textbooks covering all subjects. Great condition, no torn pages.',                quantity:'30 books',   category:'BOOKS',   itemType:'Textbooks',         expiresAt:null,                   status:'AVAILABLE',  address:'18 Kilpauk',         city:'Chennai',    donorName:'Suresh Babu',         donorType:'Individual',  phone:'+91 98410 99012', postedAgo:'4 hours ago' },
  { id:'12', title:'English Novels & Story Books',      description:'Collection of 15 fiction novels ranging from children to adult. Authors include R.K. Narayan, Ruskin Bond.', quantity:'15 books',  category:'BOOKS',   itemType:'Story Books',       expiresAt:null,                   status:'AVAILABLE',  address:'33 Besant Nagar',    city:'Chennai',    donorName:'Lakshmi Priya',       donorType:'Individual',  phone:'+91 98411 10123', postedAgo:'6 hours ago' },
  { id:'13', title:'UPSC & TNPSC Exam Books',           description:'Reference books and previous year papers for government competitive exams.',                          quantity:'12 books',   category:'BOOKS',   itemType:'Reference Books',   expiresAt:null,                   status:'CLAIMED',    address:'67 Tambaram',        city:'Chennai',    donorName:'Vijay Mohan',         donorType:'Individual',  phone:'+91 98412 21234', postedAgo:'1 day ago' },
  { id:'14', title:"Children's Activity & Colouring Books", description:'Colouring books, activity pads, and learning workbooks for ages 3–8.',                          quantity:'20 books',   category:'BOOKS',   itemType:'Children Books',    expiresAt:null,                   status:'AVAILABLE',  address:'55 Anna Nagar West', city:'Chennai',    donorName:'Bright Minds School', donorType:'Institution', phone:'+91 98413 32345', postedAgo:'2 days ago' },
  { id:'15', title:'Tamil & Hindi Language Books',      description:'Grammar books, dictionaries, and literature books in Tamil and Hindi.',                             quantity:'18 books',   category:'BOOKS',   itemType:'Reference Books',   expiresAt:null,                   status:'AVAILABLE',  address:'21 T Nagar',         city:'Chennai',    donorName:'Saraswathi Library',  donorType:'Institution', phone:'+91 98414 43456', postedAgo:'3 days ago' },
];

export const STATS = {
  totalDonations: 248,
  activeDonations: 87,
  ngoPartners: 34,
  citiesCovered: 12,
  livesImpacted: 1820,
  foodSaved: '2.4 tonnes',
};

export const CATEGORY_META = {
  FOOD:    { emoji: '🍱', label: 'Food',    color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', count: 34, desc: 'Meals, vegetables, fruits, grains' },
  CLOTHES: { emoji: '👕', label: 'Clothes', color: 'bg-blue-100 text-blue-700',   border: 'border-blue-200',   count: 28, desc: 'Wear for all ages & seasons' },
  BOOKS:   { emoji: '📚', label: 'Books',   color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', count: 25, desc: 'Textbooks, novels, references' },
} as const;

export const STATUS_META = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-700' },
  CLAIMED:   { label: 'Claimed',   color: 'bg-yellow-100 text-yellow-700' },
  COLLECTED: { label: 'Collected', color: 'bg-blue-100 text-blue-700' },
};

export const ITEM_TYPES: Record<Category, string[]> = {
  FOOD:    ['Cooked Food', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Grains & Pulses', 'Packaged Food', 'Other Food'],
  CLOTHES: ["Men's Wear", "Women's Wear", "Children's Wear", 'Winter Wear', 'Footwear', 'Accessories', 'Other Clothes'],
  BOOKS:   ['Textbooks', 'Story Books', 'Children Books', 'Religious Books', 'Reference Books', 'Magazines', 'Other Books'],
};

export const NGOS = [
  { name: 'Helping Hands Trust',    city: 'Chennai',   focus: 'Food & Clothes', since: '2015', donations: 312 },
  { name: 'Akshaya Patra Chennai',  city: 'Chennai',   focus: 'Food',           since: '2008', donations: 890 },
  { name: 'Book Smiles Foundation', city: 'Chennai',   focus: 'Books',          since: '2018', donations: 204 },
  { name: 'Clothes for All',        city: 'Bengaluru', focus: 'Clothes',        since: '2019', donations: 178 },
  { name: 'Annai Welfare Society',  city: 'Madurai',   focus: 'Food & Books',   since: '2012', donations: 445 },
  { name: 'Green Give Foundation',  city: 'Coimbatore',focus: 'All Categories', since: '2020', donations: 133 },
];
