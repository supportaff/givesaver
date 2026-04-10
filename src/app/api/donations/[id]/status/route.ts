import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const VALID = ['AVAILABLE', 'CLAIMED', 'COLLECTED'];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ status } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('PATCH /api/donations/[id]/status:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
