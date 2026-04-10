import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { donationId, receiverName, receiverPhone, message } = body;

    if (!donationId || !receiverName || !receiverPhone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: donation, error: dErr } = await supabase
      .from('donations').select('*').eq('id', donationId).single();
    if (dErr || !donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    if (donation.status !== 'AVAILABLE') return NextResponse.json({ error: 'Donation is no longer available' }, { status: 409 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: claim, error: cErr } = await supabase.from('claims').insert([{
      donation_id:    donationId,
      receiver_name:  receiverName,
      receiver_phone: receiverPhone,
      message:        message ?? null,
      status:         'PENDING',
    } as any]).select().single();
    if (cErr) throw cErr;

    // Mark donation CLAIMED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('donations').update({ status: 'CLAIMED' } as any).eq('id', donationId);

    return NextResponse.json({
      claimId: claim.id,
      donorPhone: donation.phone,
      donorName:  donation.donor_name,
      message: 'Claim submitted! Contact the donor directly to arrange pickup.',
    });
  } catch (err) {
    console.error('POST /api/claims/init:', err);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}
