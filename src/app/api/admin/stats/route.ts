import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createAdminClient();
  const [donations, claims, ngos] = await Promise.all([
    supabase.from('donations').select('id,status,flagged'),
    supabase.from('claims').select('id,status'),
    supabase.from('ngo_registrations').select('id'),
  ]);
  const d = donations.data ?? [];
  return NextResponse.json({
    totalDonations:   d.length,
    available:        d.filter((x) => x.status === 'AVAILABLE').length,
    claimed:          d.filter((x) => x.status === 'CLAIMED').length,
    collected:        d.filter((x) => x.status === 'COLLECTED').length,
    flagged:          d.filter((x) => x.flagged).length,
    totalClaims:      (claims.data ?? []).length,
    totalNGOs:        (ngos.data ?? []).length,
  });
}
