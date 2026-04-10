import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type DonationInsert = Database['public']['Tables']['donations']['Insert'];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/donations error:', err);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const payload: DonationInsert = {
      title:       body.title,
      description: body.description || null,
      quantity:    body.quantity,
      category:    body.category,
      item_type:   body.itemType,
      expires_at:  body.expiresAt || null,
      address:     body.address,
      city:        body.city || 'Chennai',
      donor_name:  body.donorName,
      donor_type:  body.donorType || 'Individual',
      phone:       body.phone,
      status:      'AVAILABLE',
    };

    const { data, error } = await supabase
      .from('donations')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/donations error:', err);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
