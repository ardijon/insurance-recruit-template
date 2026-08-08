import { selectAll, ensureSchema } from "@/lib/db";

export interface ApplicantNotification {
  fullName: string;
  phone: string;
  score: number | null;
  scoreBreakdown: {
    total: number;
    salesBackground: number;
    networkSize: number;
    availability: number;
  } | null;
  fitResult: {
    fitScore: number;
    maxFitScore: number;
    summary: string;
  } | null;
  referralAgentName: string | null;
}

let cachedSettings: { token: string | undefined; chatId: string | undefined; fetchedAt: number } | null = null;
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getTelegramSettings(): Promise<{ token: string | undefined; chatId: string | undefined }> {
  if (cachedSettings && Date.now() - cachedSettings.fetchedAt < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }
  const rows = await selectAll(
    "SELECT key, value FROM settings WHERE key IN ('TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID')"
  );
  let token: string | undefined;
  let chatId: string | undefined;
  for (const row of rows) {
    if (row.key === "TELEGRAM_BOT_TOKEN") token = (row.value as string) || undefined;
    if (row.key === "TELEGRAM_CHAT_ID") chatId = (row.value as string) || undefined;
  }
  cachedSettings = {
    token: token || process.env.TELEGRAM_BOT_TOKEN,
    chatId: chatId || process.env.TELEGRAM_CHAT_ID,
    fetchedAt: Date.now(),
  };
  return cachedSettings;
}

const TELEGRAM_API = "https://api.telegram.org";

export async function notifyManagerOnTelegram(
  applicant: ApplicantNotification
): Promise<void> {
  await ensureSchema();
  const { token, chatId } = await getTelegramSettings();

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification"
    );
    return;
  }

  const message = buildMessage(applicant);

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    console.error(`[telegram] failed to send message: ${res.status} (chat_id redacted)`);
  }
}

export async function testTelegramConnection(
  token: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${TELEGRAM_API}/bot${token}/getMe`;
    const meRes = await fetch(url);
    if (!meRes.ok) {
      return { success: false, error: "توکن ربات نامعتبر است" };
    }
    const meData = await meRes.json();
    const botName = meData.result?.first_name ?? "ربات";

    const testMsg = `✅ اتصال ربات <b>${escapeHtml(botName)}</b> با موفقیت برقرار شد!\n\nاز این به بعد هر درخواست نمایندگی جدید از طریق سایت، به صورت آنی به این چت ارسال می‌شود.`;

    const sendUrl = `${TELEGRAM_API}/bot${token}/sendMessage`;
    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMsg,
        parse_mode: "HTML",
      }),
    });

    if (!sendRes.ok) {
      const errData = await sendRes.json().catch(() => ({}));
      const desc = errData?.description ?? "خطای ناشناخته";
      if (desc.includes("chat not found")) {
        return { success: false, error: "شناسه چت نامعتبر است. مطمئن شوید ربات را به گروه/چت اضافه کرده‌اید." };
      }
      if (desc.includes("bot was blocked")) {
        return { success: false, error: "ربات توسط کاربر بلاک شده است." };
      }
      return { success: false, error: `خطا: ${desc}` };
    }

    return { success: true };
  } catch {
    return { success: false, error: "خطا در اتصال به سرور تلگرام" };
  }
}

function buildMessage(applicant: ApplicantNotification): string {
  const lines: string[] = [];

  lines.push("📋 <b>درخواست نمایندگی جدید</b>");
  lines.push("");

  lines.push(`<b>نام:</b> ${escapeHtml(applicant.fullName)}`);
  lines.push(`<b>تلفن:</b> ${escapeHtml(applicant.phone)}`);

  if (applicant.referralAgentName) {
    lines.push(`<b>معرف:</b> ${escapeHtml(applicant.referralAgentName)}`);
  }

  if (applicant.score !== null) {
    const breakdown = applicant.scoreBreakdown;
    lines.push("");
    lines.push(`<b>امتیاز کل:</b> ${applicant.score}`);
    if (breakdown) {
      lines.push(`  · سابقه فروش: ${breakdown.salesBackground}/40`);
      lines.push(`  · شبکه ارتباطی: ${breakdown.networkSize}/30`);
      lines.push(`  · زمان در دسترس: ${breakdown.availability}/30`);
    }
    if (applicant.fitResult) {
      lines.push(`  · تناسب شغلی: ${applicant.fitResult.fitScore}/${applicant.fitResult.maxFitScore} (${applicant.fitResult.summary})`);
    }
  }

  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
