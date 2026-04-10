import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

// API routes that must be reachable WITHOUT a session
const PUBLIC_ADMIN_API = ['/api/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Block ALL /__admin/* routes unless authenticated ──────────────────────
  if (pathname.startsWith('/__admin')) {
    const isLoginPage = pathname === '/__admin/login';

    if (!isLoginPage && !isAdminAuthenticated(req)) {
      // Return hard 404 for the dashboard — do NOT hint that a login page exists
      return new NextResponse(null, { status: 404 });
    }
    // Login page itself is always reachable
    return NextResponse.next();
  }

  // ── Block /api/admin/* routes unless authenticated ────────────────────────
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
