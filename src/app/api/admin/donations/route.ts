import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status  = searchParams.get('status');
  const flagged = searchParams.get('flagged');
  const search  = searchParams.get('search')?.trim() ?? '';
  const page    = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit   = 20;
  const from    = (page - 1) * limit;

  const supabase = createAdminClient();
  let q = supabase
    .from('donations')
    .select('id,title,category,status,flagged,flagged_reason,collected_at,donor_name,phone,city,address,quantity,created_at,photo_url', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (status)          q = q.eq('status', status);
  if (flagged === '1') q = q.eq('flagged', true);
  if (search)          q = q.ilike('title', `%${search}%`);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
}
