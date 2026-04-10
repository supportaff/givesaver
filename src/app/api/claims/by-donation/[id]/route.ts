import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('claims')
      .select('*')
      .eq('donation_id', id)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({});
  }
}
