import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isAdmin(): boolean {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === process.env.ADMIN_SECRET;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.name     !== undefined) update.name     = body.name;
  if (body.category !== undefined) update.category = body.category;
  if (body.unit     !== undefined) update.unit     = body.unit;
  if (body.price    !== undefined) update.price    = parseFloat(body.price);
  if (body.city     !== undefined) update.city     = body.city;
  if (body.active   !== undefined) update.active   = body.active;
  update.updated_at = new Date().toISOString();
  const { error } = await supabase.from('scrap_rates').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabase.from('scrap_rates').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
