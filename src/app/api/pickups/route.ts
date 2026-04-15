import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .insert([{
        name:      body.name,
        phone:     body.phone,
        address:   body.address,
        category:  body.category,
        time_slot: body.timeSlot,
        date:      body.date,
        notes:     body.notes || null,
        city:      body.city || 'Chennai',
        status:    'PENDING',
      }])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[pickups POST]', err);
    return NextResponse.json({ error: 'Failed to save pickup request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city   = searchParams.get('city')   || 'Chennai';
  const status = searchParams.get('status') || 'PENDING';
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('city', city)
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[pickups GET]', err);
    return NextResponse.json([], { status: 500 });
  }
}
