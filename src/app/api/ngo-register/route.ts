import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireStr, sanitiseStr, isValidPhone } from '@/lib/validate';
import { checkRateLimit, getIP } from '@/lib/ratelimit';

export async function POST(req: Request) {
  // Rate limit: 3 NGO registrations per IP per day
  const ip = getIP(req);
  if (!checkRateLimit(ip, 'ngo', 3, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again tomorrow.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  // Validate & sanitise all fields
  const orgName       = requireStr(body.orgName,       150);
  const regNumber     = requireStr(body.regNumber,      50);
  const focusArea     = requireStr(body.focusArea,     100);
  const operatingArea = requireStr(body.operatingArea, 100);
  const address       = requireStr(body.address,       200);
  const receiverName  = requireStr(body.receiverName,  100);
  const designation   = requireStr(body.designation,   100);
  const whatsapp      = sanitiseStr(body.whatsapp,      20);
  const email         = sanitiseStr(body.email,        150);
  const idType        = requireStr(body.idType,         50);
  const idNumber      = requireStr(body.idNumber,       50);
  const website       = sanitiseStr(body.website,      200) || null;
  const altPhone      = sanitiseStr(body.alternatePhone, 20) || null;
  const yearRaw       = Number(body.yearEstablished);
  const yearEst       = Number.isFinite(yearRaw) && yearRaw >= 1800 && yearRaw <= new Date().getFullYear()
    ? yearRaw : null;

  // Required field checks
  if (!orgName || !regNumber || !focusArea || !operatingArea || !address ||
      !receiverName || !designation || !idType || !idNumber || !yearEst) {
    return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
  }
  if (!isValidPhone(whatsapp)) {
    return NextResponse.json({ error: 'Invalid WhatsApp number' }, { status: 400 });
  }
  // Basic email format check
  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('ngo_registrations')
      .insert([{
        org_name:         orgName,
        reg_number:       regNumber,
        year_established: yearEst,
        focus_area:       focusArea,
        operating_area:   operatingArea,
        address,
        website,
        receiver_name:    receiverName,
        designation,
        whatsapp:         whatsapp.trim(),
        alternate_phone:  altPhone,
        email,
        id_type:          idType,
        id_number:        idNumber,
      }])
      .select('id')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}
