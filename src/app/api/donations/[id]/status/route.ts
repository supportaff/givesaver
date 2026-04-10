import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type DonationUpdate = Database['public']['Tables']['donations']['Update'];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }     = await params;
    const body       = await req.json() as { status: string };
    const { status } = body;

    if (!['AVAILABLE', 'CLAIMED', 'COLLECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const payload: DonationUpdate = {
      status: status as 'AVAILABLE' | 'CLAIMED' | 'COLLECTED',
    };

    const { data, error } = await supabase
      .from('donations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('PATCH status error:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
