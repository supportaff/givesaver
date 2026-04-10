import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTelegram } from '@/lib/telegram';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/donations:', err);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('donations')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert([{
        title:          b.title,
        description:    b.description ?? null,
        quantity:       b.quantity,
        category:       b.category,
        item_type:      b.itemType,
        expires_at:     b.expiresAt ?? null,
        address:        b.address,
        city:           b.city ?? 'Chennai',
        donor_name:     b.donorName,
        donor_type:     b.donorType ?? 'Individual',
        phone:          b.phone,
        donor_telegram: b.donorTelegram ?? null,
        status:         'AVAILABLE',
        photo_url:      null,
      } as any])
      .select().single();
    if (error) throw error;

    // Send manage link to donor via Telegram if they provided username
    if (data && b.donorTelegram) {
      const shortId = (data.id as string).slice(0, 8).toUpperCase();
      const msg = [
        `🎉 <b>GiveSaver — Donation Posted!</b>`,
        ``,
        `Your donation is now live:`,
        `📌 <b>${data.title}</b>`,
        `🔖 Posting ID: <code>${shortId}</code>`,
        ``,
        `🔗 <b>Your private manage link:</b>`,
        `https://givesaver.in/manage/${data.id}`,
        ``,
        `Use this link to:`,
        `• View receiver’s details when someone claims`,
        `• Enter receiver’s OTP to confirm pickup`,
        `• Manually update status if needed`,
        ``,
        `📱 To see all your donations: https://givesaver.in/my-donations`,
        `Enter your phone number <b>${b.phone}</b> to view all listings.`,
      ].join('\n');
      await sendTelegram(b.donorTelegram.replace(/^@/, ''), msg);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('POST /api/donations:', err);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
