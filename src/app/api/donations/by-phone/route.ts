import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('phone') ?? '';
    // Normalise: strip spaces, dashes, leading +
    const phone = raw.replace(/[\s\-]/g, '');
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    const supabase = createAdminClient();
    // Match phone loosely — stored values may have spaces / +91 prefix
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .ilike('phone', `%${phone.slice(-10)}%`) // match last 10 digits
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('GET /api/donations/by-phone:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
