import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city   = searchParams.get('city') ?? 'Chennai';
  const active = searchParams.get('active');

  let query = supabase
    .from('scrap_rates')
    .select('id, name, category, unit, price, city')
    .eq('city', city)
    .order('category')
    .order('name');

  if (active === 'true') query = query.eq('active', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
