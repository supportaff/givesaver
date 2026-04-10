const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegram(username: string, text: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not set — skipping Telegram notification');
    return false;
  }
  if (!username) return false;
  try {
    const target = username.startsWith('@') ? username : `@${username}`;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: target, text, parse_mode: 'HTML' }),
    });
    const json = await res.json() as { ok: boolean; description?: string };
    if (!json.ok) console.error('[Telegram] send failed:', json.description, '| target:', target);
    return json.ok;
  } catch (err) {
    console.error('[Telegram] fetch error:', err);
    return false;
  }
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
