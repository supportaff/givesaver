import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, ADMIN_COOKIE } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }); }

  if (!verifyAdminPassword(body.password ?? '')) {
    // Small delay to slow brute force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const secret = process.env.ADMIN_SECRET ?? '';
  const res    = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   60 * 60 * 8, // 8 hours
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
