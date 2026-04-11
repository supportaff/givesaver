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
      .select('id,status,donor_name,phone,title,quantity,address,city,expires_at')
      .eq('id', donationId)
      .single();
    if (dErr || !donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    if (donation.status !== 'AVAILABLE') return NextResponse.json({ error: 'Donation is no longer available' }, { status: 409 });

    // Insert claim record — status stays AVAILABLE until DONOR marks it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: cErr } = await supabase.from('claims').insert([{
      donation_id:    donationId,
      receiver_name:  receiverName,
      receiver_phone: receiverPhone.trim(),
      message:        message || null,
      status:         'PENDING',
    } as any]);
    if (cErr) throw cErr;

    // ⚠️ Do NOT auto-mark donation as CLAIMED — only the donor can do that via /manage

    // Build WhatsApp URL — donor phone never sent to client
    const rawPhone = donation.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
    const e164     = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const expiry   = donation.expires_at ? `\n⏰ Expiry: ${donation.expires_at}` : '';
    const lines = [
      `👋 Hi ${donation.donor_name},`,
      `I found your donation on *DontWaste* and I\'d like to collect it.`,
      ``,
      `📦 Item: *${donation.title}* — ${donation.quantity}${expiry}`,
      `📍 Pickup: ${donation.address}, ${donation.city}`,
      ``,
      `👤 My name: ${receiverName}`,
      `📞 My phone: ${receiverPhone.trim()}`,
      message ? `💬 ${message}` : `Can we arrange a pickup? Thank you 🙏`,
      ``,
      `— Sent via DontWaste (dontwaste.in)`,
    ];
    const waURL = `https://wa.me/${e164}?text=${encodeURIComponent(lines.join('\n'))}`;

    return NextResponse.json({ waURL, message: 'Claim submitted!' });
  } catch {
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}
