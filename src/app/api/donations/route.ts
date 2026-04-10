import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireStr, sanitiseStr, isValidPhone } from '@/lib/validate';
import { checkRateLimit, getIP } from '@/lib/ratelimit';

const VALID_CATEGORIES = ['FOOD', 'CLOTHES', 'BOOKS'] as const;
const VALID_DONOR_TYPES = ['Individual', 'Business', 'NGO', 'Institution'] as const;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      .select('id,title,description,quantity,category,item_type,expires_at,address,city,donor_name,donor_type,status,photo_url,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate limit: 5 donations per IP per hour
  const ip = getIP(req);
  if (!checkRateLimit(ip, 'donate', 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let b: Record<string, unknown>;
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  // Validate & sanitise every field
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
