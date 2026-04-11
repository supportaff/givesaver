import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireStr, sanitiseStr, isValidPhone } from '@/lib/validate';
import { checkRateLimit, getIP } from '@/lib/ratelimit';

const VALID_CATEGORIES = ['FOOD', 'CLOTHES', 'BOOKS'] as const;
const VALID_DONOR_TYPES = ['Individual', 'Business', 'NGO', 'Institution'] as const;

// Cooked food expires after 12 hours; other food after expiry date
const COOKED_FOOD_TYPES = ['cooked', 'cooked meal', 'cooked meals', 'meal', 'meals', 'rice', 'curry', 'food'];

function isFoodExpired(row: { category: string; item_type: string | null; expires_at: string | null; created_at: string }): boolean {
  if (row.category !== 'FOOD') return false;

  // Check explicit expiry date first
  if (row.expires_at) {
    const expiry = new Date(row.expires_at);
    if (!isNaN(expiry.getTime()) && expiry < new Date()) return true;
  }

  // Auto-expire cooked food after 12 hours from posting
  const itemTypeLower = (row.item_type ?? '').toLowerCase();
  const isCooked = COOKED_FOOD_TYPES.some((t) => itemTypeLower.includes(t));
  if (isCooked) {
    const posted = new Date(row.created_at);
    const hoursOld = (Date.now() - posted.getTime()) / 3_600_000;
    if (hoursOld > 12) return true;
  }

  return false;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      .select('id,title,description,quantity,category,item_type,expires_at,address,city,donor_name,donor_type,status,photo_url,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Filter out expired food listings — do not show them on browse
    const visible = (data ?? []).filter((row) => !isFoodExpired(row));
    return NextResponse.json(visible);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getIP(req);
  if (!checkRateLimit(ip, 'donate', 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let b: Record<string, unknown>;
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const title      = requireStr(b.title,       100);
  const quantity   = requireStr(b.quantity,     50);
  const address    = requireStr(b.address,     200);
  const donorName  = requireStr(b.donorName,   100);
  const phone      = sanitiseStr(b.phone,       20);
  const category   = b.category as string;
  const donorType  = b.donorType as string;
  const description = sanitiseStr(b.description, 500);
  const city       = sanitiseStr(b.city,        100) || 'Chennai';
  const itemType   = sanitiseStr(b.itemType,     80);
  const expiresAt  = typeof b.expiresAt === 'string' ? b.expiresAt.slice(0, 30) : null;

  if (!title || !quantity || !address || !donorName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  if (donorType && !VALID_DONOR_TYPES.includes(donorType as typeof VALID_DONOR_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid donor type' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase.from('donations').insert([{
      title,
      description: description || null,
      quantity,
      category,
      item_type:  itemType || null,
      expires_at: expiresAt,
      address,
      city,
      donor_name: donorName,
      donor_type: donorType ?? 'Individual',
      phone:      phone.trim(),
      status:     'AVAILABLE',
      photo_url:  null,
    } as any]).select('id,title,category,status,created_at').single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
