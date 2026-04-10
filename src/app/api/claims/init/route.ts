import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegram, generateOTP } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donationId, receiverName, receiverPhone, receiverTelegram } = body;

    if (!donationId || !receiverName || !receiverPhone || !receiverTelegram) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const supabase   = createAdminClient();
    const cleanTg    = (receiverTelegram as string).replace(/^@/, '');

    // Fetch donation
    const { data: donation, error: dErr } = await supabase
      .from('donations').select('*').eq('id', donationId).single();
    if (dErr || !donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    if (donation.status !== 'AVAILABLE') return NextResponse.json({ error: 'Donation is no longer available' }, { status: 409 });

    const receiverOtp = generateOTP();
    const donorOtp    = generateOTP();
    const expiresAt   = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: claim, error: cErr } = await supabase.from('claims').insert([{
      donation_id:       donationId,
      receiver_name:     receiverName,
      receiver_phone:    receiverPhone,
      receiver_telegram: cleanTg,
      otp:               receiverOtp,
      donor_otp:         donorOtp,
      status:            'PENDING',
      expires_at:        expiresAt,
    } as any]).select().single();
    if (cErr) throw cErr;

    // Mark donation CLAIMED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('donations').update({ status: 'CLAIMED' } as any).eq('id', donationId);

    const donorTg = donation.donor_telegram as string | null;

    // ---- Receiver Telegram ----
    const receiverMsg = [
      `✅ <b>GiveSaver — Claim Confirmed!</b>`,
      ``,
      `Hi <b>${receiverName}</b>! Your claim is live.`,
      ``,
      `📋 <b>Donation</b>`,
      `• Item     : ${donation.title}`,
      `• Quantity : ${donation.quantity}`,
      `• Pickup   : ${donation.address}, ${donation.city}`,
      ``,
      `👤 <b>Donor</b>`,
      `• Name  : ${donation.donor_name}`,
      `• Phone : ${donation.phone}`,
      donorTg ? `• Telegram : @${donorTg}` : '',
      ``,
      `🔑 <b>Your OTP (share with donor at pickup):</b>`,
      `<code>${receiverOtp}</code>`,
      ``,
      `🔓 <b>Enter donor’s OTP here after pickup:</b>`,
      `https://givesaver.in/claim/${claim.id}/verify`,
      ``,
      `⏰ Valid 24 hours · Do NOT share OTP before meeting in person.`,
    ].filter(Boolean).join('\n');

    // ---- Donor Telegram ----
    const donorMsg = [
      `📦 <b>GiveSaver — Someone Claimed Your Donation!</b>`,
      ``,
      `<b>${donation.title}</b> has been claimed.`,
      ``,
      `👤 <b>Receiver</b>`,
      `• Name     : ${receiverName}`,
      `• Phone    : ${receiverPhone}`,
      `• Telegram : @${cleanTg}`,
      ``,
      `🔑 <b>Your OTP (share with receiver at pickup):</b>`,
      `<code>${donorOtp}</code>`,
      ``,
      `🔓 <b>Enter receiver’s OTP at your manage page:</b>`,
      `https://givesaver.in/manage/${donationId}`,
      ``,
      `⏰ Valid 24 hours · Both OTPs must match to mark Collected.`,
    ].join('\n');

    // Send both — non-blocking, errors logged not thrown
    const [rOk, dOk] = await Promise.all([
      sendTelegram(cleanTg, receiverMsg),
      donorTg ? sendTelegram(donorTg, donorMsg) : Promise.resolve(false),
    ]);

    return NextResponse.json({
      claimId:           claim.id,
      telegramSent:      { receiver: rOk, donor: dOk },
      message:           'Claim created. OTPs sent via Telegram.',
    });
  } catch (err) {
    console.error('POST /api/claims/init:', err);
    return NextResponse.json({ error: 'Failed to initiate claim' }, { status: 500 });
  }
}
