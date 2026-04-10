import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['AVAILABLE', 'CLAIMED', 'COLLECTED'] as const;
type Status = typeof VALID_STATUSES[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }     = await params;
    const body       = await req.json();
    const status     = body.status as string;

    if (!VALID_STATUSES.includes(status as Status)) {
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
