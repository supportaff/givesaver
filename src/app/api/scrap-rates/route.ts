import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const revalidate = 0; // always fresh — admin updates reflect instantly

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city   = searchParams.get('city')   || 'Chennai';
  const active = searchParams.get('active') || 'true';

  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('scrap_rates')
      .select('*')
      .eq('city', city)
      .order('category')
      .order('name');

    if (active === 'true') query = query.eq('active', true);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[scrap-rates GET]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('scrap_rates')
      .insert([{
        name:     body.name,
        category: body.category,
        unit:     body.unit,
        price:    body.price,
        city:     body.city || 'Chennai',
        active:   body.active ?? true,
      }])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[scrap-rates POST]', err);
    return NextResponse.json({ error: 'Failed to create rate' }, { status: 500 });
  }
}
