const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API       = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Resolve @username → chat_id via getUpdates cache or sendMessage trick
// We use the username directly — Telegram accepts @username as chat_id in sendMessage
export async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  try {
    const target = chatId.startsWith('@') ? chatId : `@${chatId}`;
    const res = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    target,
        text,
        parse_mode: 'HTML',
      }),
    });
    const json = await res.json() as { ok: boolean; description?: string };
    if (!json.ok) console.error('Telegram error:', json.description);
    return json.ok;
  } catch (err) {
    console.error('sendTelegram failed:', err);
    return false;
  }
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
