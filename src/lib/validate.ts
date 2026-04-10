// Shared validation & sanitisation helpers

const UUID_RE   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE  = /^[+0-9][0-9\s\-().]{6,17}$/;
const ALLOWED_EXTS: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  webp: 'image/webp',
};
// Magic bytes for image types
const MAGIC: { mime: string; bytes: number[] }[] = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
];

export function isUUID(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

export function isValidPhone(v: unknown): v is string {
  return typeof v === 'string' && PHONE_RE.test(v.trim());
}

export function sanitiseStr(v: unknown, maxLen: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, maxLen);
}

export function requireStr(v: unknown, maxLen: number): string | null {
  const s = sanitiseStr(v, maxLen);
  return s.length > 0 ? s : null;
}

/** Returns the safe content-type if the buffer magic bytes match a known image, else null */
export function validateImageMagic(buf: Buffer): string | null {
  for (const { mime, bytes } of MAGIC) {
    if (bytes.every((b, i) => buf[i] === b)) return mime;
  }
  return null;
}

export function safeImageExt(filename: string): { ext: string; mime: string } | null {
  const raw = filename.split('.').pop()?.toLowerCase() ?? '';
  const mime = ALLOWED_EXTS[raw];
  return mime ? { ext: raw === 'jpeg' ? 'jpg' : raw, mime } : null;
}
