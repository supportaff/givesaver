import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page  = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = 20;
  const from  = (page - 1) * limit;

  const supabase = createAdminClient();
  const { data, error, count } = await supabase
    .from('claims')
    .select('id,donation_id,receiver_name,receiver_phone,message,status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
}
