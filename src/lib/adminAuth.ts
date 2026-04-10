import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET   = process.env.ADMIN_SECRET   ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

/** Cookie name that stores the session token */
export const ADMIN_COOKIE = 'gs_admin_session';

/** Returns true if the cookie value matches the secret */
export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value ?? '';
  return ADMIN_SECRET.length > 0 && cookie === ADMIN_SECRET;
}

/** Verify a plain-text password against ADMIN_PASSWORD env var */
export function verifyAdminPassword(password: string): boolean {
  return ADMIN_PASSWORD.length > 0 && password === ADMIN_PASSWORD;
}

/** Build a redirect to login, preserving return path */
export function redirectToLogin(returnPath = ''): NextResponse {
  const secret = process.env.ADMIN_SECRET ?? 'admin';
  const url    = `/${secret}/login${returnPath ? `?next=${encodeURIComponent(returnPath)}` : ''}`;
  return NextResponse.redirect(new URL(url, 'http://localhost'));
}
