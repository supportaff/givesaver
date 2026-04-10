import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isUUID } from '@/lib/validate';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!isUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }); }

  const allowed = ['status', 'flagged', 'flagged_reason', 'collected_at'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from('donations').update(patch as any).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!isUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from('donations').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
