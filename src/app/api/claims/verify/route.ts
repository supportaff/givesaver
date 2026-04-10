import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegram } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { claimId, otp, role } = await req.json();
    // role: 'receiver' | 'donor'
    if (!claimId || !otp || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = createAdminClient();

    const { data: claim, error: cErr } = await supabase
      .from('claims').select('*').eq('id', claimId).single();
    if (cErr || !claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    if (claim.status === 'VERIFIED') return NextResponse.json({ error: 'Already verified' }, { status: 409 });
    if (new Date(claim.expires_at) < new Date()) {
      await supabase.from('claims').update({ status: 'EXPIRED' } as any).eq('id', claimId);
      return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
    }

    // Validate OTP for the right role
    const expectedOtp = role === 'receiver' ? claim.otp : claim.donor_otp;
    if (otp !== expectedOtp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });

    const patch: Record<string, unknown> = role === 'receiver'
      ? { receiver_confirmed: true }
      : { donor_confirmed: true };

    const { data: updated } = await supabase
      .from('claims').update(patch as any).eq('id', claimId).select().single();

    const bothConfirmed =
      (role === 'receiver' && claim.donor_confirmed) ||
      (role === 'donor'    && claim.receiver_confirmed);

    if (bothConfirmed) {
      // Mark both confirmed + VERIFIED
      await supabase.from('claims')
        .update({ status: 'VERIFIED', receiver_confirmed: true, donor_confirmed: true } as any)
        .eq('id', claimId);

      // Mark donation COLLECTED
      const { data: donation } = await supabase
        .from('donations').select('*').eq('id', claim.donation_id).single();
      await supabase.from('donations')
        .update({ status: 'COLLECTED' } as any).eq('id', claim.donation_id);

      // Send confirmation to both
      const successMsg = [
        `🎉 <b>GiveSaver — Donation Collected!</b>`,
        ``,
        `<b>${donation?.title}</b> has been successfully handed over.`,
        `Both OTPs verified ✅`,
        ``,
        `Thank you for using GiveSaver 🙏`,
        `Together we’re reducing waste and helping families in need.`,
      ].join('\n');

      await sendTelegram(claim.receiver_telegram, successMsg);
      if (donation?.donor_telegram) await sendTelegram(donation.donor_telegram, successMsg);

      return NextResponse.json({ status: 'COLLECTED', message: 'Both OTPs verified. Donation marked as Collected!' });
    }

    return NextResponse.json({
      status: 'PARTIAL',
      message: role === 'receiver'
        ? 'Your OTP verified ✅. Waiting for donor to verify their OTP.'
        : 'Your OTP verified ✅. Waiting for receiver to verify their OTP.',
    });
  } catch (err) {
    console.error('POST /api/claims/verify:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
