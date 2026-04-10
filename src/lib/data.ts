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

export const CATEGORY_META = {
  FOOD:    { emoji: '🍱', label: 'Food',    color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', desc: 'Meals, vegetables, fruits, grains' },
  CLOTHES: { emoji: '👕', label: 'Clothes', color: 'bg-blue-100 text-blue-700',    border: 'border-blue-200',   desc: 'Wear for all ages & seasons' },
  BOOKS:   { emoji: '📚', label: 'Books',   color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', desc: 'Textbooks, novels, references' },
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
