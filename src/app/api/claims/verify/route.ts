import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegram } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { claimId, otp, role } = await req.json() as { claimId: string; otp: string; role: 'receiver' | 'donor' };
    if (!claimId || !otp || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: claim, error: cErr } = await supabase
      .from('claims').select('*').eq('id', claimId).single();
    if (cErr || !claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    if (claim.status === 'VERIFIED')  return NextResponse.json({ error: 'Already verified' }, { status: 409 });
    if (claim.status === 'EXPIRED')   return NextResponse.json({ error: 'OTP has expired' }, { status: 410 });
    if (new Date(claim.expires_at) < new Date()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('claims').update({ status: 'EXPIRED' } as any).eq('id', claimId);
      return NextResponse.json({ error: 'OTP has expired' }, { status: 410 });
    }

    const expectedOtp = role === 'receiver' ? claim.otp : claim.donor_otp;
    if (otp.trim() !== expectedOtp) return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: any = role === 'receiver' ? { receiver_confirmed: true } : { donor_confirmed: true };
    await supabase.from('claims').update(patch).eq('id', claimId);

    // Re-fetch to get latest confirmed states
    const { data: updated } = await supabase.from('claims').select('*').eq('id', claimId).single();
    const bothConfirmed = updated?.receiver_confirmed && updated?.donor_confirmed;

    if (bothConfirmed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('claims').update({ status: 'VERIFIED' } as any).eq('id', claimId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from('donations').update({ status: 'COLLECTED' } as any).eq('id', claim.donation_id);

      const { data: donation } = await supabase.from('donations').select('*').eq('id', claim.donation_id).single();

      const successMsg = [
        `🎉 <b>GiveSaver — Donation Collected!</b>`,
        ``,
        `<b>${donation?.title ?? 'Your donation'}</b> has been successfully handed over.`,
        `✅ Both OTPs verified.`,
        ``,
        `Thank you for making a difference 🙏`,
      ].join('\n');

      await Promise.all([
        sendTelegram(claim.receiver_telegram, successMsg),
        donation?.donor_telegram ? sendTelegram(donation.donor_telegram as string, successMsg) : Promise.resolve(),
      ]);

      return NextResponse.json({ status: 'COLLECTED', message: '🎉 Both OTPs verified! Donation marked as Collected.' });
    }

    return NextResponse.json({
      status:  'PARTIAL',
      message: role === 'receiver'
        ? '✅ Your OTP verified. Waiting for the donor to verify their OTP.'
        : '✅ Your OTP verified. Waiting for the receiver to verify their OTP.',
    });
  } catch (err) {
    console.error('POST /api/claims/verify:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
