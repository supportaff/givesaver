import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const form       = await req.formData();
    const file       = form.get('file') as File | null;
    const donationId = form.get('donationId') as string | null;

    if (!file || !donationId) {
      return NextResponse.json({ error: 'file and donationId required' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
    }

    const ext    = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path   = `donations/${donationId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createAdminClient();

    // Upsert — remove any old file for this donation first (ignore error)
    await supabase.storage.from('donation-photos').remove([path]);

    const { error: upErr } = await supabase.storage
      .from('donation-photos')
      .upload(path, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert:      true,
      });
    if (upErr) throw upErr;

    const { data: urlData } = supabase.storage
      .from('donation-photos')
      .getPublicUrl(path);

    // Persist photo_url back to the donation row
    await supabase.from('donations')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ photo_url: urlData.publicUrl } as any)
      .eq('id', donationId);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('POST /api/donations/upload-photo:', err);
    return NextResponse.json({ error: 'Photo upload failed' }, { status: 500 });
  }
}
