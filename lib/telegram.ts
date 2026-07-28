import { selectOne, ensureSchema } from "@/lib/db";

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

async function getSetting(key: string): Promise<string | null> {
  const row = await selectOne("SELECT value FROM settings WHERE key = ?", [key]);
  return row ? (row.value as string) : null;
}

async function getBotToken(): Promise<string | undefined> {
  const dbToken = await getSetting("TELEGRAM_BOT_TOKEN");
  if (dbToken) return dbToken;
  return process.env.TELEGRAM_BOT_TOKEN;
}

async function getChatId(): Promise<string | undefined> {
  const dbChatId = await getSetting("TELEGRAM_CHAT_ID");
  if (dbChatId) return dbChatId;
  return process.env.TELEGRAM_CHAT_ID;
}

const TELEGRAM_API = "https://api.telegram.org";

export async function notifyManagerOnTelegram(
  applicant: ApplicantNotification
): Promise<void> {
  await ensureSchema();
  const token = await getBotToken();
  const chatId = await getChatId();

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
