import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, ADMIN_COOKIE } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }); }

  const valid = verifyAdminCredentials(
    body.username?.trim() ?? '',
    body.password ?? ''
  );

  if (!valid) {
    // Deliberate delay to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const secret = process.env.ADMIN_SECRET ?? '';
  const res    = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   60 * 60 * 8, // 8-hour session
  });
  return res;
}

export async function DELETE(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
