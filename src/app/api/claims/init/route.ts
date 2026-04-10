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

    const supabase = createAdminClient();

    // Fetch donation + donor details
    const { data: donation, error: dErr } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();
    if (dErr || !donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    if (donation.status !== 'AVAILABLE') return NextResponse.json({ error: 'Donation no longer available' }, { status: 409 });

    // Generate two separate OTPs
    const receiverOtp = generateOTP();
    const donorOtp    = generateOTP();
    const expiresAt   = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Save claim
    const { data: claim, error: cErr } = await supabase
      .from('claims')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert([{
        donation_id:       donationId,
        receiver_name:     receiverName,
        receiver_phone:    receiverPhone,
        receiver_telegram: receiverTelegram.replace(/^@/, ''),
        otp:               receiverOtp,
        donor_otp:         donorOtp,
        status:            'PENDING',
        expires_at:        expiresAt,
      } as any])
      .select()
      .single();
    if (cErr) throw cErr;

    // Mark donation as CLAIMED
    await supabase.from('donations').update({ status: 'CLAIMED' } as any).eq('id', donationId);

    // --- Send Telegram to RECEIVER ---
    const receiverMsg = [
      `✅ <b>GiveSaver — Claim Initiated!</b>`,
      ``,
      `Hi <b>${receiverName}</b>, your claim request has been sent to the donor.`,
      ``,
      `📋 <b>Donation Details</b>`,
      `• Item     : ${donation.title}`,
      `• Category : ${donation.category}`,
      `• Quantity : ${donation.quantity}`,
      `• Pickup   : ${donation.address}, ${donation.city}`,
      ``,
      `👤 <b>Donor Details</b>`,
      `• Name  : ${donation.donor_name}`,
      `• Phone : ${donation.phone}`,
      donation.donor_telegram ? `• Telegram : @${donation.donor_telegram}` : '',
      ``,
      `🔑 <b>Your OTP: <code>${receiverOtp}</code></b>`,
      `Share this OTP with the donor at pickup time.`,
      ``,
      `🔑 <b>Donor OTP (you'll receive from donor): <code>${donorOtp}</code></b>`,
      `The donor will share their OTP with you. Enter it at:`,
      `https://givesaver.in/claim/${claim.id}/verify`,
      ``,
      `⏰ OTP valid for 24 hours.`,
      `⚠️ Do NOT share your OTP with anyone other than the donor at pickup.`,
    ].filter(Boolean).join('\n');

    // --- Send Telegram to DONOR ---
    const donorMsg = [
      `📦 <b>GiveSaver — New Claim on Your Donation!</b>`,
      ``,
      `Someone wants to collect your donation: <b>${donation.title}</b>`,
      ``,
      `👤 <b>Receiver Details</b>`,
      `• Name     : ${receiverName}`,
      `• Phone    : ${receiverPhone}`,
      `• Telegram : @${receiverTelegram.replace(/^@/, '')}`,
      ``,
      `🔑 <b>Your OTP: <code>${donorOtp}</code></b>`,
      `Share this OTP with the receiver at pickup time.`,
      ``,
      `🔑 <b>Receiver OTP (you'll receive from receiver): <code>${receiverOtp}</code></b>`,
      `The receiver will share their OTP with you. Enter it at:`,
      `https://givesaver.in/manage/${donationId}`,
      ``,
      `⏰ OTP valid for 24 hours.`,
      `Once both OTPs are verified, the donation will be marked as Collected. 🎉`,
    ].join('\n');

    // Send to receiver
    await sendTelegram(receiverTelegram.replace(/^@/, ''), receiverMsg);

    // Send to donor (only if they provided Telegram)
    if (donation.donor_telegram) {
      await sendTelegram(donation.donor_telegram, donorMsg);
    }

    return NextResponse.json({ claimId: claim.id, message: 'Claim initiated. OTPs sent via Telegram.' });
  } catch (err) {
    console.error('POST /api/claims/init:', err);
    return NextResponse.json({ error: 'Failed to initiate claim' }, { status: 500 });
  }
}
