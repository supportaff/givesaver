/**
 * Validates and normalises an Indian mobile number.
 * Accepts: 9876543210 | +919876543210 | 919876543210 | 09876543210
 * Returns: '919876543210' (E.164 without +) on success, null on failure.
 */
export function normaliseIndianPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().+]/g, '');
  // Strip leading 0 or 91 country code
  const local = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits.startsWith('0') && digits.length === 11
    ? digits.slice(1)
    : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return '91' + local;
}

export function validateIndianPhone(raw: string): string | null {
  if (!normaliseIndianPhone(raw)) {
    return 'Enter a valid 10-digit Indian mobile number (starting with 6–9).';
  }
  return null;
}
