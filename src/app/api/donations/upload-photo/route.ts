import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isUUID, safeImageExt, validateImageMagic } from '@/lib/validate';
import { checkRateLimit, getIP } from '@/lib/ratelimit';

export async function POST(req: Request) {
  // Rate limit: 10 uploads per IP per hour
  const ip = getIP(req);
  if (!checkRateLimit(ip, 'upload', 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let form: FormData;
  try { form = await req.formData(); }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }); }

  const file       = form.get('file') as File | null;
  const donationId = form.get('donationId') as string | null;

  if (!file || !donationId) {
    return NextResponse.json({ error: 'file and donationId are required' }, { status: 400 });
  }

  // 1. Validate donationId is a real UUID (prevent path traversal)
  if (!isUUID(donationId)) {
    return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
  }

  // 2. File size check
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
  }

  // 3. Extension whitelist
  const extInfo = safeImageExt(file.name);
  if (!extInfo) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are allowed' }, { status: 400 });
  }

  // 4. Magic bytes check — validate actual file content, not just extension
  const buffer = Buffer.from(await file.arrayBuffer());
  const realMime = validateImageMagic(buffer);
  if (!realMime) {
    return NextResponse.json({ error: 'File content does not match an allowed image type' }, { status: 400 });
  }

  // Safe path: UUID + whitelisted extension only
  const safePath = `donations/${donationId}.${extInfo.ext}`;

  try {
    const supabase = createAdminClient();

    await supabase.storage.from('donation-photos').remove([safePath]);

    const { error: upErr } = await supabase.storage
      .from('donation-photos')
      .upload(safePath, buffer, { contentType: realMime, upsert: true });
    if (upErr) throw upErr;

    const { data: urlData } = supabase.storage
      .from('donation-photos')
      .getPublicUrl(safePath);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('donations').update({ photo_url: urlData.publicUrl } as any).eq('id', donationId);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: 'Photo upload failed' }, { status: 500 });
  }
}
