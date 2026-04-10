import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

const PUBLIC_ADMIN_API = ['/api/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = (process.env.ADMIN_SECRET ?? '').trim();

  if (!secret) return NextResponse.next(); // skip if not configured

  // ── Admin page routes ─────────────────────────────────────────────
  const isSecretRoot  = pathname === `/${secret}`;
  const isSecretLogin = pathname === `/${secret}/login`;
  const isUnderSecret = pathname.startsWith(`/${secret}/`) && !isSecretLogin;

  // Any sub-path beyond /login under the secret slug → hard 404
  if (isUnderSecret) {
    return new NextResponse(null, { status: 404 });
  }

  // Dashboard: secret root requires valid session
  if (isSecretRoot && !isAdminAuthenticated(req)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = `/${secret}/login`;
    return NextResponse.redirect(loginUrl);
  }

  // Any path that looks like an admin path but uses wrong slug → hard 404
  // e.g. /admin, /dashboard, /panel — only exact secret slug is valid
  // (We only enforce this for the /__admin internal path)
  if (pathname.startsWith('/__admin')) {
    return new NextResponse(null, { status: 404 });
  }

  // ── Admin API routes ────────────────────────────────────────────────
  if (
    pathname.startsWith('/api/admin/') &&
    !PUBLIC_ADMIN_API.some((p) => pathname.startsWith(p))
  ) {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
