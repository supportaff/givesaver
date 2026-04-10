import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET   = process.env.ADMIN_SECRET   ?? '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export const ADMIN_COOKIE = 'dw_admin_session';

export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value ?? '';
  return ADMIN_SECRET.length > 0 && cookie === ADMIN_SECRET;
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  return ADMIN_USERNAME.length > 0 && ADMIN_PASSWORD.length > 0
    && username === ADMIN_USERNAME
    && password === ADMIN_PASSWORD;
}

export function redirectToLogin(returnPath = ''): NextResponse {
  const secret = process.env.ADMIN_SECRET ?? 'admin';
  const url    = `/${secret}/login${returnPath ? `?next=${encodeURIComponent(returnPath)}` : ''}`;
  return NextResponse.redirect(new URL(url, 'http://localhost'));
}
