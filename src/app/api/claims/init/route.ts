import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isUUID, requireStr, sanitiseStr, isValidPhone } from '@/lib/validate';
import { checkRateLimit, getIP } from '@/lib/ratelimit';

export async function POST(req: Request) {
  // Rate limit: 10 claims per IP per hour
  const ip = getIP(req);
  if (!checkRateLimit(ip, 'claim', 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { donationId } = body;
  const receiverName  = requireStr(body.receiverName,  100);
  const receiverPhone = sanitiseStr(body.receiverPhone, 20);
  const message       = sanitiseStr(body.message,       300);

  // Validate inputs
  if (!isUUID(donationId)) {
    return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
  }
  if (!receiverName) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!isValidPhone(receiverPhone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: donation, error: dErr } = await supabase
      .from('donations')
      .select('id,status,donor_name,phone')
      .eq('id', donationId)
      .single();
    if (dErr || !donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    if (donation.status !== 'AVAILABLE') return NextResponse.json({ error: 'Donation is no longer available' }, { status: 409 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: cErr } = await supabase.from('claims').insert([{
      donation_id:    donationId,
      receiver_name:  receiverName,
      receiver_phone: receiverPhone.trim(),
      message:        message || null,
      status:         'PENDING',
    } as any]);
    if (cErr) throw cErr;

    // Mark donation as CLAIMED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('donations').update({ status: 'CLAIMED' } as any).eq('id', donationId);

    // Build WhatsApp URL server-side — donor phone NEVER sent to client
    const rawPhone  = donation.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
    const e164      = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const lines = [
      `\u{1F44B} Hi ${donation.donor_name},`,
      `I saw your donation on *GiveSaver* and would like to collect.`,
      ``,
      `\u{1F464} My name: ${receiverName}`,
      `\u{1F4DE} My phone: ${receiverPhone.trim()}`,
      message ? `\u{1F4AC} ${message}` : `Can we arrange a pickup? Thank you \u{1F64F}`,
      ``,
      `\u2014 Sent via GiveSaver`,
    ];
    const waURL = `https://wa.me/${e164}?text=${encodeURIComponent(lines.join('\n'))}`;

    // Return ONLY the WhatsApp redirect URL — no phone number exposed
    return NextResponse.json({
      waURL,
      message: 'Claim submitted!',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}
