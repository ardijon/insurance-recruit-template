import { NextRequest, NextResponse } from "next/server";
import { selectAll, executeInsert, ensureSchema } from "@/lib/db";
import { sanitizeUrl } from "@/lib/url";

const SETTINGS_KEYS = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "SOCIAL_TELEGRAM",
  "SOCIAL_WHATSAPP",
  "SOCIAL_INSTAGRAM",
] as const;

const SENSITIVE_KEYS = new Set(["TELEGRAM_BOT_TOKEN"]);
const SOCIAL_URL_KEYS = new Set(["SOCIAL_TELEGRAM", "SOCIAL_WHATSAPP", "SOCIAL_INSTAGRAM"]);

function maskSensitiveValue(key: string, value: string): string {
  if (!SENSITIVE_KEYS.has(key) || !value || value.length < 16) return value;
  return value.slice(0, 8) + "••••••••" + value.slice(-4);
}

async function getSettings(): Promise<Record<string, string>> {
  await ensureSchema();
  const placeholders = SETTINGS_KEYS.map(() => "?").join(",");
  const rows = await selectAll(
    `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
    [...SETTINGS_KEYS]
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key as string;
    const raw = (row.value as string) || "";
    result[key] = maskSensitiveValue(key, raw);
  }
  return result;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "خطا در خواندن تنظیمات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = body as Record<string, string>;

  await ensureSchema();

  for (const [key, value] of Object.entries(data)) {
    if (SETTINGS_KEYS.includes(key as (typeof SETTINGS_KEYS)[number])) {
      const isMasked = SENSITIVE_KEYS.has(key) && value.includes("••••••••");
      if (isMasked) continue;

      // Only validate telegram keys if they're being set (not masked and not empty)
      if (key === "TELEGRAM_BOT_TOKEN" && (!value || value.length < 10)) {
        return NextResponse.json({ error: "توکن ربات الزامی است" }, { status: 422 });
      }
      if (key === "TELEGRAM_CHAT_ID" && (!value || value.length < 3)) {
        return NextResponse.json({ error: "شناسه چت الزامی است" }, { status: 422 });
      }

      const finalValue = SOCIAL_URL_KEYS.has(key) ? sanitizeUrl(value || "") : (value || "");
      await executeInsert(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [key, finalValue]
      );
    }
  }

  return NextResponse.json({ message: "تنظیمات ذخیره شد" });
}
