import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const formData   = await req.formData();
    const file       = formData.get('file') as File;
    const donationId = formData.get('donationId') as string;

    if (!file || !donationId) {
      return NextResponse.json({ error: 'Missing file or donationId' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext      = file.name.split('.').pop() ?? 'jpg';
    const path     = `donations/${donationId}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('donation-photos')
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('donation-photos')
      .getPublicUrl(path);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await supabase
      .from('donations')
      .update({ photo_url: publicUrl } as any)
      .eq('id', donationId);
    if (updateError) throw updateError;

    return NextResponse.json({ photo_url: publicUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    return NextResponse.json({ error: 'Photo upload failed' }, { status: 500 });
  }
}
