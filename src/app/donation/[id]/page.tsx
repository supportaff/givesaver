import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import type { DonationRow } from '@/lib/supabase/types';
import { CATEGORY_META, STATUS_META } from '@/lib/data';
import DonationDetailClient from '@/components/DonationDetailClient';

interface Props { params: Promise<{ id: string }> }

async function getDonation(id: string): Promise<DonationRow | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('donations').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as DonationRow;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const d = await getDonation(id);
  if (!d) return { title: 'Donation not found' };
  const cat = CATEGORY_META[d.category as keyof typeof CATEGORY_META];
  return {
    title:       `${cat?.emoji} ${d.title} — Free in ${d.city} | DontWaste`,
    description: `${d.quantity} of ${d.item_type} available for free in ${d.address}, ${d.city}. Donated by ${d.donor_name}. Claim it now on DontWaste.`,
    openGraph: {
      title:       `${cat?.emoji} FREE: ${d.title} in ${d.city}`,
      description: `${d.quantity} • ${d.address}, ${d.city} • Posted by ${d.donor_name}`,
      images:      d.photo_url ? [{ url: d.photo_url, width: 1200, height: 630 }] : [],
      type:        'website',
    },
    twitter: {
      card:        d.photo_url ? 'summary_large_image' : 'summary',
      title:       `FREE: ${d.title} in ${d.city}`,
      description: `${d.quantity} available • Claim free on DontWaste`,
      images:      d.photo_url ? [d.photo_url] : [],
    },
  };
}

export default async function DonationDetailPage({ params }: Props) {
  const { id } = await params;
  const d = await getDonation(id);
  if (!d) notFound();
  return <DonationDetailClient donation={d} />;
}
