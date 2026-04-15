import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body     = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('scrap_rates')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('[scrap-rates PATCH]', err);
    return NextResponse.json({ error: 'Failed to update rate' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('scrap_rates').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[scrap-rates DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete rate' }, { status: 500 });
  }
}
