import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }     = await params;
    const { status } = await req.json() as { status: 'AVAILABLE' | 'CLAIMED' | 'COLLECTED' };

    if (!['AVAILABLE', 'CLAIMED', 'COLLECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      .update({ status })
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
