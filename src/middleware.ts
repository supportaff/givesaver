import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated, ADMIN_COOKIE } from '@/lib/adminAuth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.ADMIN_SECRET ?? '';

  if (!secret) return NextResponse.next();

  // Protect everything under /<ADMIN_SECRET>/* except the login page itself
  if (pathname.startsWith(`/${secret}`) && !pathname.endsWith('/login')) {
    if (!isAdminAuthenticated(req)) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = `/${secret}/login`;
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin/')) {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
