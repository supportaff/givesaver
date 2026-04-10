import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

const PUBLIC_ADMIN_API = ['/api/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = (process.env.ADMIN_SECRET ?? '').trim();

  // ── Guard admin pages ───────────────────────────────────────────────────
  if (pathname.startsWith('/__admin')) {
    if (!secret) return NextResponse.next(); // dev fallback

    const isLoginPage = pathname === '/__admin/login';

    // Wrong slug cookie → hard 404 (don’t reveal login exists)
    if (!isLoginPage && !isAdminAuthenticated(req)) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // ── Secret-slug routes: /<ADMIN_SECRET> and /<ADMIN_SECRET>/login ─────
  if (secret) {
    const isSecretRoot  = pathname === `/${secret}`;
    const isSecretLogin = pathname === `/${secret}/login`;

    if (isSecretRoot || isSecretLogin) {
      // Rewrite internally to the fixed /__admin path
      const url = req.nextUrl.clone();
      url.pathname = isSecretLogin ? '/__admin/login' : '/__admin';
      return NextResponse.rewrite(url);
    }

    // Any other path that STARTS with /<secret>/ → hard 404
    // (prevents /<secret>/dashboard, /<secret>/anything)
    if (pathname.startsWith(`/${secret}/`) && !isSecretLogin) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── Guard admin API routes ────────────────────────────────────────────
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
