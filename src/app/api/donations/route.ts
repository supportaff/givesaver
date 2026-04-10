import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('GET /api/donations:', err);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.title || !b.quantity || !b.category || !b.donorName || !b.phone || !b.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.from('donations').insert([{
      title:       b.title,
      description: b.description  ?? null,
      quantity:    b.quantity,
      category:    b.category,
      item_type:   b.itemType,
      expires_at:  b.expiresAt    ?? null,
      address:     b.address,
      city:        b.city         ?? 'Chennai',
      donor_name:  b.donorName,
      donor_type:  b.donorType    ?? 'Individual',
      phone:       b.phone,
      status:      'AVAILABLE',
      photo_url:   null,
    } as any]).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/donations:', err);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
