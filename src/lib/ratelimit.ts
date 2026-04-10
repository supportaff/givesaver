/**
 * Simple in-memory rate limiter (per IP, resets on server restart).
 * For production scale swap this out for @upstash/ratelimit + Redis.
 */
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * @param ip      Client IP string
 * @param key     Bucket identifier (e.g. 'donate', 'claim')
 * @param limit   Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function checkRateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const bucket = `${key}:${ip}`;
  const now    = Date.now();
  const entry  = store.get(bucket);

  if (!entry || now > entry.resetAt) {
    store.set(bucket, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** Extract best-effort IP from Next.js request headers */
export function getIP(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
